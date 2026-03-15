/**
 * Prompt Store Types
 *
 * Defines the data structures for managing prompts and their relationship to agents.
 */

/**
 * Prompt categories aligned with agent types
 */
export type PromptCategory =
  | 'extraction'      // Data extraction from transcripts
  | 'generation'      // Content generation (SOAP notes, summaries, etc.)
  | 'verification'    // HITL verification prompts
  | 'analysis'        // Analysis and scoring prompts
  | 'communication'   // Email, follow-up generation
  | 'planning'        // TCP, treatment planning
  | 'custom';         // User-defined

/**
 * Prompt status
 */
export type PromptStatus = 'draft' | 'active' | 'archived';

/**
 * A prompt template
 */
export interface Prompt {
  id: string;
  name: string;
  description: string;
  category: PromptCategory;
  status: PromptStatus;

  // Content
  content: string;
  systemPrompt?: string;  // Optional system prompt prefix

  // Agent linkage
  agentId?: string;       // Which agent this prompt powers
  agentName?: string;     // Cached agent name for display

  // Variables that can be injected
  variables: PromptVariable[];

  // Version tracking
  version: string;
  versions: PromptVersion[];

  // Metadata
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;

  // Sync status
  syncedToBackend: boolean;
  backendId?: string;     // ID in the remote backend if synced
}

/**
 * A variable that can be injected into a prompt
 */
export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'transcript' | 'practice_context';
  description: string;
  required: boolean;
  defaultValue?: string;
}

/**
 * A version of a prompt
 */
export interface PromptVersion {
  version: string;
  content: string;
  systemPrompt?: string;
  createdAt: string;
  createdBy?: string;
  changelog?: string;
}

/**
 * A prompt set - ordered collection of prompts to run in sequence
 */
export interface PromptSet {
  id: string;
  name: string;
  description: string;

  // Ordered list of prompt IDs
  promptOrder: string[];

  // Version pinning per prompt (optional)
  promptVersions: Record<string, string>;

  // Agent linkage
  agentId?: string;
  agentName?: string;

  // Metadata
  status: PromptStatus;
  createdAt: string;
  updatedAt: string;

  // Sync status
  syncedToBackend: boolean;
  backendId?: string;
}

/**
 * Agent definition for linking
 */
export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  type: 'extraction' | 'generation' | 'verification' | 'analysis' | 'planning';
  category: PromptCategory;

  // The prompts this agent uses
  promptIds: string[];
  promptSetId?: string;

  // Whether this agent has its own page
  hasPage: boolean;
  pagePath?: string;
}

/**
 * Prompt store state
 */
export interface PromptStoreState {
  // Data
  prompts: Prompt[];
  promptSets: PromptSet[];
  agents: AgentDefinition[];

  // UI state
  selectedPromptId: string | null;
  selectedSetId: string | null;
  activeTab: 'prompts' | 'sets' | 'agents';

  // Filters
  categoryFilter: PromptCategory | 'all';
  statusFilter: PromptStatus | 'all';
  agentFilter: string | 'all';
  searchQuery: string;

  // Editor state
  isEditing: boolean;
  editedContent: string | null;
  hasUnsavedChanges: boolean;

  // Loading
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
}

/**
 * Prompt store actions
 */
export interface PromptStoreActions {
  // CRUD - Prompts
  createPrompt: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'versions' | 'syncedToBackend'>) => Prompt;
  updatePrompt: (id: string, updates: Partial<Prompt>) => void;
  deletePrompt: (id: string) => void;
  duplicatePrompt: (id: string) => Prompt;

  // CRUD - Prompt Sets
  createPromptSet: (set: Omit<PromptSet, 'id' | 'createdAt' | 'updatedAt' | 'syncedToBackend'>) => PromptSet;
  updatePromptSet: (id: string, updates: Partial<PromptSet>) => void;
  deletePromptSet: (id: string) => void;

  // CRUD - Agents
  registerAgent: (agent: AgentDefinition) => void;
  updateAgent: (id: string, updates: Partial<AgentDefinition>) => void;
  linkPromptToAgent: (promptId: string, agentId: string) => void;
  unlinkPromptFromAgent: (promptId: string) => void;

  // Selection
  selectPrompt: (id: string | null) => void;
  selectPromptSet: (id: string | null) => void;
  setActiveTab: (tab: 'prompts' | 'sets' | 'agents') => void;

  // Filtering
  setCategoryFilter: (category: PromptCategory | 'all') => void;
  setStatusFilter: (status: PromptStatus | 'all') => void;
  setAgentFilter: (agentId: string | 'all') => void;
  setSearchQuery: (query: string) => void;

  // Editor
  setEditedContent: (content: string | null) => void;
  saveChanges: () => void;
  discardChanges: () => void;

  // Versioning
  createVersion: (promptId: string, changelog?: string) => void;
  revertToVersion: (promptId: string, version: string) => void;

  // Sync
  syncToBackend: () => Promise<void>;
  loadFromBackend: () => Promise<void>;

  // Loading
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Persistence
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

export type PromptStore = PromptStoreState & { actions: PromptStoreActions };
