/**
 * Prompt Store
 *
 * Manages prompts, prompt sets, and agent linkage.
 * Persists to localStorage with optional backend sync.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuid } from 'uuid';
import type {
  PromptStore,
  PromptStoreState,
  Prompt,
  PromptSet,
  AgentDefinition,
  PromptCategory,
  PromptStatus,
} from './types';
import { promptsApi } from 'apiServices/prompts.api';

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: PromptStoreState = {
  prompts: [],
  promptSets: [],
  agents: [],

  selectedPromptId: null,
  selectedSetId: null,
  activeTab: 'prompts',

  categoryFilter: 'all',
  statusFilter: 'all',
  agentFilter: 'all',
  searchQuery: '',

  isEditing: false,
  editedContent: null,
  hasUnsavedChanges: false,

  isLoading: false,
  isSyncing: false,
  error: null,
};

// ============================================================================
// DEFAULT AGENTS
// ============================================================================

const defaultAgents: AgentDefinition[] = [
  {
    id: 'hitl',
    name: 'HITL Verification',
    description: 'Human-in-the-loop verification of extraction outputs',
    type: 'verification',
    category: 'verification',
    promptIds: [],
    hasPage: true,
    pagePath: '/agents/hitl',
  },
  {
    id: 'tcp',
    name: 'Treatment & Care Plan',
    description: 'AI-generated treatment and care plans',
    type: 'planning',
    category: 'planning',
    promptIds: [],
    hasPage: true,
    pagePath: '/agents/tcp',
  },
  {
    id: 'extraction',
    name: 'Transcript Extraction',
    description: 'Extract structured data from consultation transcripts',
    type: 'extraction',
    category: 'extraction',
    promptIds: [],
    hasPage: false,
  },
  {
    id: 'soap',
    name: 'SOAP Notes',
    description: 'Generate SOAP notes from consultations',
    type: 'generation',
    category: 'generation',
    promptIds: [],
    hasPage: false,
  },
  {
    id: 'summary',
    name: 'Consultation Summary',
    description: 'Generate consultation summaries',
    type: 'generation',
    category: 'generation',
    promptIds: [],
    hasPage: false,
  },
  {
    id: 'followup',
    name: 'Follow-up Email',
    description: 'Generate patient follow-up emails',
    type: 'generation',
    category: 'communication',
    promptIds: [],
    hasPage: false,
  },
];

// ============================================================================
// STORE
// ============================================================================

export const usePromptStore = create<PromptStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,
        agents: defaultAgents,

        actions: {
          // ==================================================================
          // CRUD - PROMPTS
          // ==================================================================

          createPrompt: (promptData) => {
            const now = new Date().toISOString();
            const newPrompt: Prompt = {
              ...promptData,
              id: uuid(),
              createdAt: now,
              updatedAt: now,
              versions: [],
              syncedToBackend: false,
            };

            set((state) => {
              state.prompts.push(newPrompt);
            });

            return newPrompt;
          },

          updatePrompt: (id, updates) => {
            set((state) => {
              const index = state.prompts.findIndex((p) => p.id === id);
              if (index !== -1) {
                state.prompts[index] = {
                  ...state.prompts[index],
                  ...updates,
                  updatedAt: new Date().toISOString(),
                  syncedToBackend: false,
                };
              }
            });
          },

          deletePrompt: (id) => {
            set((state) => {
              state.prompts = state.prompts.filter((p) => p.id !== id);
              if (state.selectedPromptId === id) {
                state.selectedPromptId = null;
              }
              // Remove from any agents
              state.agents.forEach((agent) => {
                agent.promptIds = agent.promptIds.filter((pid) => pid !== id);
              });
            });
          },

          duplicatePrompt: (id) => {
            const state = get();
            const source = state.prompts.find((p) => p.id === id);
            if (!source) throw new Error('Prompt not found');

            const now = new Date().toISOString();
            const newPrompt: Prompt = {
              ...source,
              id: uuid(),
              name: `${source.name} (Copy)`,
              createdAt: now,
              updatedAt: now,
              versions: [],
              syncedToBackend: false,
              backendId: undefined,
            };

            set((state) => {
              state.prompts.push(newPrompt);
            });

            return newPrompt;
          },

          // ==================================================================
          // CRUD - PROMPT SETS
          // ==================================================================

          createPromptSet: (setData) => {
            const now = new Date().toISOString();
            const newSet: PromptSet = {
              ...setData,
              id: uuid(),
              createdAt: now,
              updatedAt: now,
              syncedToBackend: false,
            };

            set((state) => {
              state.promptSets.push(newSet);
            });

            return newSet;
          },

          updatePromptSet: (id, updates) => {
            set((state) => {
              const index = state.promptSets.findIndex((s) => s.id === id);
              if (index !== -1) {
                state.promptSets[index] = {
                  ...state.promptSets[index],
                  ...updates,
                  updatedAt: new Date().toISOString(),
                  syncedToBackend: false,
                };
              }
            });
          },

          deletePromptSet: (id) => {
            set((state) => {
              state.promptSets = state.promptSets.filter((s) => s.id !== id);
              if (state.selectedSetId === id) {
                state.selectedSetId = null;
              }
            });
          },

          // ==================================================================
          // CRUD - AGENTS
          // ==================================================================

          registerAgent: (agent) => {
            set((state) => {
              const existing = state.agents.find((a) => a.id === agent.id);
              if (!existing) {
                state.agents.push(agent);
              }
            });
          },

          updateAgent: (id, updates) => {
            set((state) => {
              const index = state.agents.findIndex((a) => a.id === id);
              if (index !== -1) {
                state.agents[index] = { ...state.agents[index], ...updates };
              }
            });
          },

          linkPromptToAgent: (promptId, agentId) => {
            set((state) => {
              // Update prompt
              const promptIndex = state.prompts.findIndex((p) => p.id === promptId);
              if (promptIndex !== -1) {
                const agent = state.agents.find((a) => a.id === agentId);
                state.prompts[promptIndex].agentId = agentId;
                state.prompts[promptIndex].agentName = agent?.name;
              }

              // Update agent
              const agentIndex = state.agents.findIndex((a) => a.id === agentId);
              if (agentIndex !== -1 && !state.agents[agentIndex].promptIds.includes(promptId)) {
                state.agents[agentIndex].promptIds.push(promptId);
              }
            });
          },

          unlinkPromptFromAgent: (promptId) => {
            set((state) => {
              const promptIndex = state.prompts.findIndex((p) => p.id === promptId);
              if (promptIndex !== -1) {
                const oldAgentId = state.prompts[promptIndex].agentId;
                state.prompts[promptIndex].agentId = undefined;
                state.prompts[promptIndex].agentName = undefined;

                // Remove from agent
                if (oldAgentId) {
                  const agentIndex = state.agents.findIndex((a) => a.id === oldAgentId);
                  if (agentIndex !== -1) {
                    state.agents[agentIndex].promptIds = state.agents[agentIndex].promptIds.filter(
                      (pid) => pid !== promptId
                    );
                  }
                }
              }
            });
          },

          // ==================================================================
          // SELECTION
          // ==================================================================

          selectPrompt: (id) => {
            const state = get();
            if (state.hasUnsavedChanges) {
              console.warn('Unsaved changes will be lost');
            }
            const prompt = id ? state.prompts.find((p) => p.id === id) : null;
            set({
              selectedPromptId: id,
              editedContent: prompt?.content || null,
              hasUnsavedChanges: false,
            });
          },

          selectPromptSet: (id) => {
            set({ selectedSetId: id });
          },

          setActiveTab: (tab) => {
            set({ activeTab: tab });
          },

          // ==================================================================
          // FILTERING
          // ==================================================================

          setCategoryFilter: (category) => {
            set({ categoryFilter: category });
          },

          setStatusFilter: (status) => {
            set({ statusFilter: status });
          },

          setAgentFilter: (agentId) => {
            set({ agentFilter: agentId });
          },

          setSearchQuery: (query) => {
            set({ searchQuery: query });
          },

          // ==================================================================
          // EDITOR
          // ==================================================================

          setEditedContent: (content) => {
            set((state) => {
              const selectedPrompt = state.prompts.find((p) => p.id === state.selectedPromptId);
              state.editedContent = content;
              state.hasUnsavedChanges = content !== selectedPrompt?.content;
            });
          },

          saveChanges: () => {
            const state = get();
            if (!state.selectedPromptId || !state.editedContent) return;

            const prompt = state.prompts.find((p) => p.id === state.selectedPromptId);
            if (!prompt) return;

            // Create new version
            const newVersion = {
              version: incrementVersion(prompt.version),
              content: state.editedContent,
              createdAt: new Date().toISOString(),
              createdBy: 'user',
              changelog: 'Manual edit',
            };

            set((state) => {
              const index = state.prompts.findIndex((p) => p.id === state.selectedPromptId);
              if (index !== -1) {
                state.prompts[index].content = state.editedContent!;
                state.prompts[index].version = newVersion.version;
                state.prompts[index].versions.push(newVersion);
                state.prompts[index].updatedAt = new Date().toISOString();
                state.prompts[index].syncedToBackend = false;
              }
              state.hasUnsavedChanges = false;
            });
          },

          discardChanges: () => {
            const state = get();
            const prompt = state.prompts.find((p) => p.id === state.selectedPromptId);
            set({
              editedContent: prompt?.content || null,
              hasUnsavedChanges: false,
            });
          },

          // ==================================================================
          // VERSIONING
          // ==================================================================

          createVersion: (promptId, changelog) => {
            set((state) => {
              const index = state.prompts.findIndex((p) => p.id === promptId);
              if (index === -1) return;

              const prompt = state.prompts[index];
              const newVersion = {
                version: incrementVersion(prompt.version),
                content: prompt.content,
                createdAt: new Date().toISOString(),
                createdBy: 'user',
                changelog,
              };

              state.prompts[index].version = newVersion.version;
              state.prompts[index].versions.push(newVersion);
            });
          },

          revertToVersion: (promptId, version) => {
            set((state) => {
              const index = state.prompts.findIndex((p) => p.id === promptId);
              if (index === -1) return;

              const targetVersion = state.prompts[index].versions.find((v) => v.version === version);
              if (!targetVersion) return;

              state.prompts[index].content = targetVersion.content;
              state.prompts[index].systemPrompt = targetVersion.systemPrompt;
              state.prompts[index].version = version;
              state.prompts[index].updatedAt = new Date().toISOString();

              if (state.selectedPromptId === promptId) {
                state.editedContent = targetVersion.content;
                state.hasUnsavedChanges = false;
              }
            });
          },

          // ==================================================================
          // SYNC
          // ==================================================================

          syncToBackend: async () => {
            set({ isSyncing: true, error: null });
            try {
              const state = get();
              const unsyncedPrompts = state.prompts.filter((p) => !p.syncedToBackend);

              for (const prompt of unsyncedPrompts) {
                try {
                  if (prompt.backendId) {
                    await promptsApi.updateTemplate(prompt.backendId, {
                      name: prompt.name,
                      description: prompt.description,
                      content: prompt.content,
                    });
                  } else {
                    const created = await promptsApi.createTemplate({
                      prompt_id: prompt.category,
                      name: prompt.name,
                      description: prompt.description,
                      version: prompt.version,
                      content: prompt.content,
                    });
                    set((state) => {
                      const index = state.prompts.findIndex((p) => p.id === prompt.id);
                      if (index !== -1) {
                        state.prompts[index].backendId = created.id;
                        state.prompts[index].syncedToBackend = true;
                      }
                    });
                  }
                } catch (e) {
                  console.error(`Failed to sync prompt ${prompt.name}:`, e);
                }
              }

              set({ isSyncing: false });
            } catch (e) {
              set({
                isSyncing: false,
                error: e instanceof Error ? e.message : 'Sync failed',
              });
            }
          },

          loadFromBackend: async () => {
            set({ isLoading: true, error: null });
            try {
              const [templatesRes, setsRes] = await Promise.all([
                promptsApi.listTemplates(),
                promptsApi.listSets(),
              ]);

              // Merge backend prompts with local ones
              set((state) => {
                for (const template of templatesRes.data) {
                  const existing = state.prompts.find((p) => p.backendId === template.id);
                  if (!existing) {
                    state.prompts.push({
                      id: uuid(),
                      backendId: template.id,
                      name: template.name,
                      description: template.description,
                      category: (template.prompt_id as PromptCategory) || 'custom',
                      status: 'active',
                      content: template.content || '',
                      variables: [],
                      version: template.version || '1.0.0',
                      versions: [],
                      tags: [],
                      createdAt: template.created_at,
                      updatedAt: template.created_at,
                      syncedToBackend: true,
                    });
                  }
                }

                for (const backendSet of setsRes.data) {
                  const existing = state.promptSets.find((s) => s.backendId === backendSet.id);
                  if (!existing) {
                    state.promptSets.push({
                      id: uuid(),
                      backendId: backendSet.id,
                      name: backendSet.name,
                      description: backendSet.description,
                      promptOrder: backendSet.prompt_order,
                      promptVersions: backendSet.prompt_versions,
                      status: 'active',
                      createdAt: backendSet.created_at,
                      updatedAt: backendSet.created_at,
                      syncedToBackend: true,
                    });
                  }
                }

                state.isLoading = false;
              });
            } catch (e) {
              set({
                isLoading: false,
                error: e instanceof Error ? e.message : 'Failed to load from backend',
              });
            }
          },

          // ==================================================================
          // LOADING
          // ==================================================================

          setLoading: (loading) => {
            set({ isLoading: loading });
          },

          setError: (error) => {
            set({ error });
          },

          // ==================================================================
          // PERSISTENCE
          // ==================================================================

          loadFromStorage: () => {
            // Handled by persist middleware
          },

          saveToStorage: () => {
            // Handled by persist middleware
          },
        },
      })),
      {
        name: 'prompt-store',
        partialize: (state) => ({
          prompts: state.prompts,
          promptSets: state.promptSets,
          agents: state.agents,
        }),
      }
    ),
    { name: 'PromptStore' }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

export const useSelectedPrompt = () => {
  const prompts = usePromptStore((s) => s.prompts);
  const selectedId = usePromptStore((s) => s.selectedPromptId);
  return prompts.find((p) => p.id === selectedId) || null;
};

export const useFilteredPrompts = () => {
  const prompts = usePromptStore((s) => s.prompts);
  const categoryFilter = usePromptStore((s) => s.categoryFilter);
  const statusFilter = usePromptStore((s) => s.statusFilter);
  const agentFilter = usePromptStore((s) => s.agentFilter);
  const searchQuery = usePromptStore((s) => s.searchQuery);

  return prompts.filter((p) => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (agentFilter !== 'all' && p.agentId !== agentFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query))
      );
    }
    return true;
  });
};

export const usePromptsByAgent = (agentId: string) => {
  const prompts = usePromptStore((s) => s.prompts);
  return prompts.filter((p) => p.agentId === agentId);
};

export const useAgentById = (agentId: string) => {
  const agents = usePromptStore((s) => s.agents);
  return agents.find((a) => a.id === agentId);
};

// ============================================================================
// HELPERS
// ============================================================================

function incrementVersion(version: string): string {
  const parts = version.split('.').map(Number);
  while (parts.length < 3) parts.push(0);
  parts[2] = (parts[2] ?? 0) + 1;
  return parts.join('.');
}
