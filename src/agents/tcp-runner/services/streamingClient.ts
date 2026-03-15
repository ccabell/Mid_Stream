/**
 * Streaming LLM Client
 *
 * Uses native fetch with ReadableStream for real-time streaming.
 * Supports both OpenAI and Anthropic APIs.
 */

import type {
  LLMProvider,
  StreamingRequest,
  StreamingCallbacks,
  TokenUsage,
} from '../types';

/**
 * Stream LLM response with real-time token delivery
 */
export async function streamLLMResponse(
  request: StreamingRequest,
  callbacks: StreamingCallbacks
): Promise<void> {
  const {
    provider,
    model,
    apiKey,
    messages,
    temperature = 0.7,
    maxTokens = 4096,
    abortSignal,
  } = request;

  const endpoint = getEndpoint(provider);
  const headers = buildHeaders(provider, apiKey);
  const body = buildRequestBody(provider, model, messages, temperature, maxTokens);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: abortSignal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = extractErrorMessage(provider, errorData, response.status);
      throw new Error(errorMessage);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body available');
    }

    await processStream(reader, provider, callbacks);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        // Graceful abort - don't call onError
        return;
      }
      callbacks.onError(error);
    } else {
      callbacks.onError(new Error(String(error)));
    }
  }
}

/**
 * Get API endpoint for provider
 */
function getEndpoint(provider: LLMProvider): string {
  switch (provider) {
    case 'openai':
      return 'https://api.openai.com/v1/chat/completions';
    case 'anthropic':
      return 'https://api.anthropic.com/v1/messages';
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Build request headers for provider
 */
function buildHeaders(provider: LLMProvider, apiKey: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (provider === 'openai') {
    headers['Authorization'] = `Bearer ${apiKey}`;
  } else if (provider === 'anthropic') {
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
    // Required for browser-based API calls
    headers['anthropic-dangerous-direct-browser-access'] = 'true';
  }

  return headers;
}

/**
 * Build request body for provider
 */
function buildRequestBody(
  provider: LLMProvider,
  model: string,
  messages: Array<{ role: string; content: string }>,
  temperature: number,
  maxTokens: number
): object {
  if (provider === 'openai') {
    return {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
      stream_options: { include_usage: true },
    };
  } else {
    // Anthropic format - system message is separate
    const systemMessage = messages.find((m) => m.role === 'system');
    const nonSystemMessages = messages.filter((m) => m.role !== 'system');

    return {
      model,
      system: systemMessage?.content,
      messages: nonSystemMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      max_tokens: maxTokens,
      temperature,
      stream: true,
    };
  }
}

/**
 * Extract error message from API response
 */
function extractErrorMessage(
  provider: LLMProvider,
  errorData: Record<string, unknown>,
  status: number
): string {
  if (provider === 'openai') {
    const error = errorData.error as Record<string, unknown> | undefined;
    return (error?.message as string) || `OpenAI API error: ${status}`;
  } else {
    const error = errorData.error as Record<string, unknown> | undefined;
    return (error?.message as string) || `Anthropic API error: ${status}`;
  }
}

/**
 * Process streaming response
 */
async function processStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  provider: LLMProvider,
  callbacks: StreamingCallbacks
): Promise<void> {
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const data = trimmed.slice(6); // Remove 'data: ' prefix
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const result = extractToken(provider, parsed);

          if (result.token) {
            fullText += result.token;
            callbacks.onToken(result.token);
          }

          if (result.usage && callbacks.onUsage) {
            callbacks.onUsage(result.usage);
          }
        } catch {
          // Skip malformed JSON chunks
        }
      }
    }

    callbacks.onComplete(fullText);
  } finally {
    reader.releaseLock();
  }
}

/**
 * Extract token and usage from parsed SSE data
 */
function extractToken(
  provider: LLMProvider,
  parsed: Record<string, unknown>
): { token: string; usage: TokenUsage | null } {
  let token = '';
  let usage: TokenUsage | null = null;

  if (provider === 'openai') {
    // OpenAI format
    const choices = parsed.choices as Array<{
      delta?: { content?: string };
    }> | undefined;
    token = choices?.[0]?.delta?.content || '';

    // Usage comes in final chunk
    const usageData = parsed.usage as {
      prompt_tokens?: number;
      completion_tokens?: number;
    } | undefined;
    if (usageData) {
      usage = {
        promptTokens: usageData.prompt_tokens || 0,
        completionTokens: usageData.completion_tokens || 0,
      };
    }
  } else {
    // Anthropic format
    const type = parsed.type as string;

    if (type === 'content_block_delta') {
      const delta = parsed.delta as { text?: string } | undefined;
      token = delta?.text || '';
    }

    if (type === 'message_delta') {
      const usageData = parsed.usage as {
        input_tokens?: number;
        output_tokens?: number;
      } | undefined;
      if (usageData) {
        usage = {
          promptTokens: usageData.input_tokens || 0,
          completionTokens: usageData.output_tokens || 0,
        };
      }
    }
  }

  return { token, usage };
}

/**
 * Test API key validity by making a minimal request
 */
export async function testApiKey(
  provider: LLMProvider,
  apiKey: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const endpoint = getEndpoint(provider);
    const headers = buildHeaders(provider, apiKey);

    // Minimal request to test auth
    const body =
      provider === 'openai'
        ? {
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: 'Hi' }],
            max_tokens: 1,
          }
        : {
            model: 'claude-3-5-sonnet-20241022',
            messages: [{ role: 'user', content: 'Hi' }],
            max_tokens: 1,
          };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (response.ok) {
      return { valid: true };
    }

    const errorData = await response.json().catch(() => ({}));
    const errorMessage = extractErrorMessage(provider, errorData, response.status);
    return { valid: false, error: errorMessage };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}
