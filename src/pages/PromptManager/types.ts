/**
 * Prompt Manager Types
 */

export type PromptCategory =
  | 'extraction'      // V3 Pass 1, Pass 2
  | 'hitl'            // HITL verification prompts
  | 'tcp'             // Treatment Care Plan generation
  | 'agents'          // Specialized agents (objection, cross-sell, etc.)
  | 'reach'           // Follow-up email campaigns
  | 'coaching'        // Provider coaching prompts
  | 'system';         // System prompts (schemas, configs)

export interface PromptVariable {
  name: string;           // e.g., "transcript"
  type: 'string' | 'json' | 'markdown' | 'array';
  description: string;
  required: boolean;
  example?: string;
}

export interface PromptVersion {
  version: string;        // Semantic version (1.0.0)
  content: string;        // Full prompt content
  createdAt: string;      // ISO timestamp
  createdBy: string;      // User who created
  changelog?: string;     // What changed
}

export interface Prompt {
  id: string;
  name: string;
  slug: string;           // URL-safe identifier
  category: PromptCategory;
  description: string;

  // Content
  content: string;        // Current version content

  // Variables used in this prompt
  variables: PromptVariable[];

  // Version history
  currentVersion: string;
  versions: PromptVersion[];

  // Metadata
  tags: string[];
  outputSchema?: string;  // JSON schema for expected output

  // Source
  localPath?: string;     // Path to local .md file
  syncedToBackend: boolean;
  lastSyncedAt?: string;

  // Status
  status: 'draft' | 'active' | 'deprecated';
  createdAt: string;
  updatedAt: string;
}

export interface PromptTestResult {
  promptId: string;
  timestamp: string;
  input: Record<string, unknown>;
  output: string;
  parsedOutput?: Record<string, unknown>;
  error?: string;
  duration: number;       // ms
  model: string;
  tokens: {
    input: number;
    output: number;
  };
}

export interface PromptManagerState {
  prompts: Prompt[];
  selectedPromptId: string | null;
  isLoading: boolean;
  error: string | null;

  // Editor state
  editedContent: string | null;
  hasUnsavedChanges: boolean;

  // Test state
  testResults: PromptTestResult[];
  isRunningTest: boolean;
}

// Category metadata
export const PROMPT_CATEGORIES: Record<PromptCategory, { label: string; description: string; icon: string }> = {
  extraction: {
    label: 'Extraction',
    description: 'V3 two-pass extraction prompts',
    icon: 'Psychology',
  },
  hitl: {
    label: 'HITL Verification',
    description: 'Human-in-the-loop verification prompts',
    icon: 'FactCheck',
  },
  tcp: {
    label: 'Treatment Care Plan',
    description: 'TCP generation prompts',
    icon: 'Description',
  },
  agents: {
    label: 'Specialized Agents',
    description: 'Objection handling, cross-sell, coaching agents',
    icon: 'SmartToy',
  },
  reach: {
    label: 'Reach / Follow-up',
    description: 'Follow-up email and campaign prompts',
    icon: 'Email',
  },
  coaching: {
    label: 'Coaching',
    description: 'Provider coaching and feedback prompts',
    icon: 'School',
  },
  system: {
    label: 'System',
    description: 'Schemas, configs, and system prompts',
    icon: 'Settings',
  },
};

// Default prompts to load from local files
export const DEFAULT_PROMPTS: Array<{ slug: string; name: string; category: PromptCategory; localPath: string }> = [
  {
    slug: 'v3-pass-1',
    name: 'V3 Pass 1: Context & Offerings',
    category: 'extraction',
    localPath: 'prompts/v3_pass_1_context_offerings.md',
  },
  {
    slug: 'v3-pass-2',
    name: 'V3 Pass 2: Outcome Intelligence',
    category: 'extraction',
    localPath: 'prompts/v3_pass_2_outcome_intelligence.md',
  },
  {
    slug: 'v3-schema',
    name: 'V3 Extraction Schema',
    category: 'system',
    localPath: 'prompts/V3_EXTRACTION_SCHEMA.md',
  },
  {
    slug: 'hitl-verification',
    name: 'HITL Verification Prompt',
    category: 'hitl',
    localPath: 'prompts/v3_hitl_verification.md',
  },
  {
    slug: 'tcp-current',
    name: 'TCP Generation (Current)',
    category: 'tcp',
    localPath: 'prompts/tcp_CURRENT_improved.md',
  },
  {
    slug: 'tcp-future-hitl',
    name: 'TCP Generation (Future w/ HITL)',
    category: 'tcp',
    localPath: 'prompts/tcp_FUTURE_with_hitl.md',
  },
  {
    slug: 'agent-objection',
    name: 'Objection Response Agent',
    category: 'agents',
    localPath: 'prompts/v3_agent_objection_response.md',
  },
  {
    slug: 'agent-cross-sell',
    name: 'Cross-Sell Guidance Agent',
    category: 'agents',
    localPath: 'prompts/v3_agent_cross_sell_guidance.md',
  },
];
