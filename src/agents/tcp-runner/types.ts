/**
 * TCP Runner Agent Types
 *
 * Types for the streaming TCP generation workflow.
 * Generates TCPDocument sections progressively with real-time LLM streaming.
 */

import type {
  TCPDocument,
  TreatmentCarePlan,
  ImmediateIntervention,
  ShortTermGoals,
  LongTermStrategy,
  ClinicalSafetyProtocols,
} from '../tcp/types';
import type { ExtractionOutput, HITLVerifiedOutput } from '../types';

// ============================================================================
// SECTION IDENTIFIERS
// ============================================================================

/** TCP sections that are generated sequentially */
export type TCPSectionId =
  | 'immediate'    // Immediate Intervention (today's treatments)
  | 'short_term'   // Short-term Goals (coming weeks)
  | 'long_term'    // Long-term Strategy (maintenance)
  | 'safety'       // Clinical Safety Protocols
  | 'summary';     // Executive Summary

/** Generation status for each section */
export type SectionStatus =
  | 'pending'      // Not started
  | 'streaming'    // Currently generating (streaming response)
  | 'completed'    // Successfully generated
  | 'error'        // Generation failed
  | 'editing';     // User is editing the content

/** Order of section generation */
export const SECTION_ORDER: TCPSectionId[] = [
  'immediate',
  'short_term',
  'long_term',
  'safety',
  'summary',
];

/** Human-readable section labels */
export const SECTION_LABELS: Record<TCPSectionId, string> = {
  immediate: 'Immediate Intervention',
  short_term: 'Short-term Goals',
  long_term: 'Long-term Strategy',
  safety: 'Clinical Safety Protocols',
  summary: 'Executive Summary',
};

/** Section descriptions for UI */
export const SECTION_DESCRIPTIONS: Record<TCPSectionId, string> = {
  immediate: "Today's treatments and post-care instructions",
  short_term: 'Recommended treatments and follow-up schedule for coming weeks',
  long_term: 'Maintenance schedule and skincare routine',
  safety: 'Coordination requirements and safety protocols',
  summary: 'Patient-friendly overview of the treatment plan',
};

// ============================================================================
// LLM PROVIDER CONFIGURATION
// ============================================================================

/** Supported LLM providers */
export type LLMProvider = 'openai' | 'anthropic';

/** OpenAI model options */
export type OpenAIModel = 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4-turbo';

/** Anthropic model options */
export type AnthropicModel =
  | 'claude-sonnet-4-20250514'
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-opus-20240229';

/** Model display names */
export const MODEL_LABELS: Record<OpenAIModel | AnthropicModel, string> = {
  'gpt-4o': 'GPT-4o (Recommended)',
  'gpt-4o-mini': 'GPT-4o Mini (Faster)',
  'gpt-4-turbo': 'GPT-4 Turbo',
  'claude-sonnet-4-20250514': 'Claude Sonnet 4 (Recommended)',
  'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet',
  'claude-3-opus-20240229': 'Claude 3 Opus',
};

/** Provider model lists */
export const PROVIDER_MODELS: Record<LLMProvider, (OpenAIModel | AnthropicModel)[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  anthropic: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'],
};

/** Streaming configuration */
export interface StreamingConfig {
  provider: LLMProvider;
  model: OpenAIModel | AnthropicModel;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
}

/** Default streaming configuration */
export const DEFAULT_STREAMING_CONFIG: Omit<StreamingConfig, 'apiKey'> = {
  provider: 'openai',
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 4096,
};

// ============================================================================
// SECTION STATE
// ============================================================================

/** Token usage tracking */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
}

/** State for a single section */
export interface SectionState {
  id: TCPSectionId;
  status: SectionStatus;

  /** Raw streaming text (visible during generation) */
  streamingText: string;

  /** Parsed JSON content after completion */
  parsedContent: SectionContent | null;

  /** Error message if generation failed */
  error: string | null;

  /** Generation timestamps */
  startedAt: string | null;
  completedAt: string | null;

  /** Token usage for this section */
  tokenUsage: TokenUsage | null;

  /** Whether user has edited this section */
  isEdited: boolean;

  /** User's edited content (if different from parsed) */
  editedContent: SectionContent | null;
}

/** Union of possible section content types */
export type SectionContent =
  | ImmediateIntervention
  | ShortTermGoals
  | LongTermStrategy
  | ClinicalSafetyProtocols
  | ExecutiveSummary;

/** Executive summary section (generated last) */
export interface ExecutiveSummary {
  overview: string;
  key_points: string[];
  next_appointment: string | null;
}

/** Initial state for a section */
export function createInitialSectionState(id: TCPSectionId): SectionState {
  return {
    id,
    status: 'pending',
    streamingText: '',
    parsedContent: null,
    error: null,
    startedAt: null,
    completedAt: null,
    tokenUsage: null,
    isEdited: false,
    editedContent: null,
  };
}

// ============================================================================
// INPUT TYPES
// ============================================================================

/** Input from HITL verification */
export interface HITLInput {
  type: 'hitl';
  data: HITLVerifiedOutput;
  runId?: string;
}

/** Input from raw extraction */
export interface ExtractionInput {
  type: 'extraction';
  data: ExtractionOutput;
  runId?: string;
}

/** Union input type */
export type TCPRunnerInput = HITLInput | ExtractionInput;

// ============================================================================
// WORKFLOW STATE
// ============================================================================

/** Workflow step */
export type TCPRunnerStep =
  | 'input_selection'  // Choose input source
  | 'config'           // Configure LLM provider
  | 'generating'       // Streaming generation in progress
  | 'review'           // Review and edit sections
  | 'preview'          // Final preview
  | 'complete';        // Done

/** Full TCP Runner state */
export interface TCPRunnerState {
  // Workflow step
  currentStep: TCPRunnerStep;

  // Input data
  input: TCPRunnerInput | null;

  // LLM configuration
  config: StreamingConfig | null;

  // Patient info (extracted from input or entered manually)
  patientName: string;
  consultationDate: string;
  providerName: string;
  practiceName: string;

  // Generation state
  isGenerating: boolean;
  currentSection: TCPSectionId | null;
  sections: Record<TCPSectionId, SectionState>;

  // Abort controller reference (for cancel)
  abortController: AbortController | null;

  // Progress tracking
  completedSections: number;
  totalSections: 5;

  // Token tracking (cumulative)
  totalTokens: TokenUsage;

  // Error state
  globalError: string | null;

  // Final output
  finalTCP: TCPDocument | null;
}

/** Initial TCP Runner state */
export const INITIAL_TCP_RUNNER_STATE: TCPRunnerState = {
  currentStep: 'input_selection',
  input: null,
  config: null,
  patientName: '',
  consultationDate: new Date().toISOString().slice(0, 10),
  providerName: '',
  practiceName: '',
  isGenerating: false,
  currentSection: null,
  sections: {
    immediate: createInitialSectionState('immediate'),
    short_term: createInitialSectionState('short_term'),
    long_term: createInitialSectionState('long_term'),
    safety: createInitialSectionState('safety'),
    summary: createInitialSectionState('summary'),
  },
  abortController: null,
  completedSections: 0,
  totalSections: 5,
  totalTokens: { promptTokens: 0, completionTokens: 0 },
  globalError: null,
  finalTCP: null,
};

// ============================================================================
// ACTIONS
// ============================================================================

/** TCP Runner actions */
export interface TCPRunnerActions {
  // Initialization
  setInput: (input: TCPRunnerInput) => void;
  setConfig: (config: StreamingConfig) => void;
  setPatientInfo: (info: {
    patientName?: string;
    consultationDate?: string;
    providerName?: string;
    practiceName?: string;
  }) => void;

  // Navigation
  goToStep: (step: TCPRunnerStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Generation control
  startGeneration: () => Promise<void>;
  stopGeneration: () => void;
  retrySection: (sectionId: TCPSectionId) => Promise<void>;
  retryAllFailed: () => Promise<void>;

  // Section updates (called during streaming)
  appendStreamingText: (sectionId: TCPSectionId, text: string) => void;
  setSectionStatus: (sectionId: TCPSectionId, status: SectionStatus) => void;
  setSectionContent: (sectionId: TCPSectionId, content: SectionContent) => void;
  setSectionError: (sectionId: TCPSectionId, error: string) => void;
  setSectionTokenUsage: (sectionId: TCPSectionId, usage: TokenUsage) => void;

  // Editing
  startEditing: (sectionId: TCPSectionId) => void;
  saveEdit: (sectionId: TCPSectionId, content: SectionContent) => void;
  cancelEdit: (sectionId: TCPSectionId) => void;
  resetSection: (sectionId: TCPSectionId) => void;

  // Finalization
  finalizeTCP: () => TCPDocument | null;
  saveToRun: (runId: string) => Promise<{ success: boolean; error?: string }>;

  // Reset
  reset: () => void;
}

// ============================================================================
// STREAMING CLIENT TYPES
// ============================================================================

/** Message format for LLM API */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** Callbacks for streaming response */
export interface StreamingCallbacks {
  onToken: (token: string) => void;
  onComplete: (fullText: string) => void;
  onError: (error: Error) => void;
  onUsage?: (usage: TokenUsage) => void;
}

/** Streaming request parameters */
export interface StreamingRequest {
  provider: LLMProvider;
  model: string;
  apiKey: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  abortSignal?: AbortSignal;
}

// ============================================================================
// RE-EXPORTS
// ============================================================================

export type {
  TCPDocument,
  TreatmentCarePlan,
  ImmediateIntervention,
  ShortTermGoals,
  LongTermStrategy,
  ClinicalSafetyProtocols,
  ExtractionOutput,
  HITLVerifiedOutput,
};
