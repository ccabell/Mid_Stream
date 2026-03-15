/**
 * Prompts API
 *
 * Connects to Prompt Runner's prompt_templates and prompt_sets endpoints.
 */

import { client } from './client';

// ============================================================================
// TYPES
// ============================================================================

export interface PromptTemplate {
  id: string;
  prompt_id: string;
  name: string;
  description: string;
  version: string;
  content?: string;
  created_at: string;
}

export interface PromptSet {
  id: string;
  set_id: string;
  name: string;
  description: string;
  prompt_order: string[];
  prompt_versions: Record<string, string>;
  created_at: string;
}

export interface PromptTemplateDetail extends PromptTemplate {
  content: string;
  prompt_text?: string;  // Backend returns this field name
  system_prompt?: string;
  input_contract?: unknown;
  output_schema?: unknown;
}

export interface CreatePromptTemplatePayload {
  prompt_id: string;
  name: string;
  description?: string;
  version: string;
  content: string;
}

export interface CreatePromptSetPayload {
  set_id: string;
  name: string;
  description?: string;
  prompt_order: string[];
  prompt_versions: Record<string, string>;
}

// ============================================================================
// API
// ============================================================================

export const promptsApi = {
  // =========================================================================
  // PROMPT TEMPLATES
  // =========================================================================

  /** List all prompt templates */
  listTemplates: () =>
    client
      .get<{ data: PromptTemplate[]; total: number }>('/prompt_templates')
      .then((r) => r.data),

  /** Get a single prompt template by ID (with full content) */
  getTemplate: (templateId: string) =>
    client
      .get<PromptTemplateDetail>(`/prompt_templates/${templateId}`)
      .then((r) => ({
        ...r.data,
        // Backend returns prompt_text, normalize to content
        content: r.data.prompt_text || r.data.content || '',
      })),

  /** Create a new prompt template */
  createTemplate: (payload: CreatePromptTemplatePayload) =>
    client
      .post<PromptTemplate>('/prompt_templates', payload)
      .then((r) => r.data),

  /** Update a prompt template */
  updateTemplate: (templateId: string, payload: Partial<CreatePromptTemplatePayload>) =>
    client
      .patch<PromptTemplate>(`/prompt_templates/${templateId}`, payload)
      .then((r) => r.data),

  /** Delete a prompt template */
  deleteTemplate: (templateId: string) =>
    client
      .delete(`/prompt_templates/${templateId}`)
      .then((r) => r.data),

  // =========================================================================
  // PROMPT SETS
  // =========================================================================

  /** List all prompt sets */
  listSets: () =>
    client
      .get<{ data: PromptSet[]; total: number }>('/prompt_sets')
      .then((r) => r.data),

  /** Get a single prompt set by ID */
  getSet: (setId: string) =>
    client
      .get<PromptSet>(`/prompt_sets/${setId}`)
      .then((r) => r.data),

  /** Create a new prompt set */
  createSet: (payload: CreatePromptSetPayload) =>
    client
      .post<PromptSet>('/prompt_sets', payload)
      .then((r) => r.data),

  // =========================================================================
  // LEGACY ALIASES (for backward compatibility with old Prompt Manager)
  // =========================================================================

  /** @deprecated Use listTemplates instead */
  list: () =>
    client
      .get<{ data: PromptTemplate[]; total: number }>('/prompt_templates')
      .then((r) => ({
        prompts: r.data.data.map((t) => ({
          slug: t.id,
          name: t.name,
          category: t.prompt_id,
          description: t.description,
          path: '',
          exists: true,
          lastModified: t.created_at,
        })),
        basePaths: {
          primary: '',
          conversational: '',
          reach: '',
        },
      })),

  /** @deprecated Use getTemplate instead */
  getBySlug: (slug: string) =>
    client.get<PromptTemplateDetail>(`/prompt_templates/${slug}`).then((r) => ({
      slug: r.data.id,
      name: r.data.name,
      category: r.data.prompt_id,
      description: r.data.description,
      path: '',
      exists: true,
      lastModified: r.data.created_at,
      content: r.data.content || '',
      size: r.data.content?.length || 0,
    })),

  /** @deprecated Not supported in database-backed system */
  update: (_slug: string, _content: string): Promise<{ content: string; lastModified: string }> =>
    Promise.reject(new Error('Prompt editing not yet supported. Use Prompt Runner to manage templates.')),

  /** @deprecated Not supported in database-backed system */
  revert: (_slug: string) =>
    Promise.reject(new Error('Prompt revert not supported in database-backed system.')),

  /** @deprecated Not supported in database-backed system */
  scan: (_directory: string) =>
    Promise.reject(new Error('Directory scanning not supported. Prompts are stored in database.')),

  /** Health check - just verify API is reachable */
  health: () =>
    client
      .get<{ data: PromptTemplate[] }>('/prompt_templates')
      .then(() => ({ status: 'ok', timestamp: new Date().toISOString() }))
      .catch(() => ({ status: 'error', timestamp: new Date().toISOString() })),
};
