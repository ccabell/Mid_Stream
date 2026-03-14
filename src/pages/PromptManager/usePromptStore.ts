/**
 * Prompt Manager Store
 *
 * Zustand store for managing prompts state
 * Integrates with local prompt server for file-based storage
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { promptsApi } from 'apiServices/prompts.api';
import type { Prompt, PromptCategory, PromptTestResult, PromptVariable } from './types';

interface PromptStore {
  // State
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

  // View state
  categoryFilter: PromptCategory | 'all';
  searchQuery: string;

  // Actions
  actions: {
    // CRUD
    setPrompts: (prompts: Prompt[]) => void;
    addPrompt: (prompt: Prompt) => void;
    updatePrompt: (id: string, updates: Partial<Prompt>) => void;
    deletePrompt: (id: string) => void;

    // Selection
    selectPrompt: (id: string | null) => void;

    // Editor
    setEditedContent: (content: string | null) => void;
    saveChanges: () => void;
    discardChanges: () => void;

    // Filtering
    setCategoryFilter: (category: PromptCategory | 'all') => void;
    setSearchQuery: (query: string) => void;

    // Testing
    addTestResult: (result: PromptTestResult) => void;
    clearTestResults: () => void;
    setIsRunningTest: (running: boolean) => void;

    // Loading
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    // Version management
    createVersion: (promptId: string, changelog?: string) => void;
    revertToVersion: (promptId: string, version: string) => void;

    // API Integration
    loadPromptsFromServer: () => Promise<void>;
    loadPromptContent: (slug: string) => Promise<void>;
    savePromptToFile: (slug: string) => Promise<void>;
    revertPromptToBackup: (slug: string) => Promise<void>;
    scanDirectory: (directory: string) => Promise<void>;
  };
}

export const usePromptStore = create<PromptStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      prompts: [],
      selectedPromptId: null,
      isLoading: false,
      error: null,
      editedContent: null,
      hasUnsavedChanges: false,
      testResults: [],
      isRunningTest: false,
      categoryFilter: 'all',
      searchQuery: '',

      actions: {
        // CRUD
        setPrompts: (prompts) => set({ prompts }),

        addPrompt: (prompt) =>
          set((state) => ({
            prompts: [...state.prompts, prompt],
          })),

        updatePrompt: (id, updates) =>
          set((state) => ({
            prompts: state.prompts.map((p) =>
              p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
            ),
          })),

        deletePrompt: (id) =>
          set((state) => ({
            prompts: state.prompts.filter((p) => p.id !== id),
            selectedPromptId: state.selectedPromptId === id ? null : state.selectedPromptId,
          })),

        // Selection
        selectPrompt: (id) => {
          const state = get();
          if (state.hasUnsavedChanges) {
            // Could show confirmation dialog here
            console.warn('Unsaved changes will be lost');
          }
          const prompt = id ? state.prompts.find((p) => p.id === id) : null;
          set({
            selectedPromptId: id,
            editedContent: prompt?.content || null,
            hasUnsavedChanges: false,
          });
        },

        // Editor
        setEditedContent: (content) =>
          set((state) => {
            const selectedPrompt = state.prompts.find((p) => p.id === state.selectedPromptId);
            return {
              editedContent: content,
              hasUnsavedChanges: content !== selectedPrompt?.content,
            };
          }),

        saveChanges: () => {
          const state = get();
          if (!state.selectedPromptId || !state.editedContent) return;

          const prompt = state.prompts.find((p) => p.id === state.selectedPromptId);
          if (!prompt) return;

          // Create new version
          const newVersion = {
            version: incrementVersion(prompt.currentVersion),
            content: state.editedContent,
            createdAt: new Date().toISOString(),
            createdBy: 'user', // TODO: Get from auth
            changelog: 'Manual edit',
          };

          set((state) => ({
            prompts: state.prompts.map((p) =>
              p.id === state.selectedPromptId
                ? {
                    ...p,
                    content: state.editedContent!,
                    currentVersion: newVersion.version,
                    versions: [...p.versions, newVersion],
                    updatedAt: new Date().toISOString(),
                  }
                : p
            ),
            hasUnsavedChanges: false,
          }));
        },

        discardChanges: () => {
          const state = get();
          const prompt = state.prompts.find((p) => p.id === state.selectedPromptId);
          set({
            editedContent: prompt?.content || null,
            hasUnsavedChanges: false,
          });
        },

        // Filtering
        setCategoryFilter: (category) => set({ categoryFilter: category }),
        setSearchQuery: (query) => set({ searchQuery: query }),

        // Testing
        addTestResult: (result) =>
          set((state) => ({
            testResults: [result, ...state.testResults].slice(0, 50), // Keep last 50
          })),

        clearTestResults: () => set({ testResults: [] }),
        setIsRunningTest: (running) => set({ isRunningTest: running }),

        // Loading
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),

        // Version management
        createVersion: (promptId, changelog) => {
          const state = get();
          const prompt = state.prompts.find((p) => p.id === promptId);
          if (!prompt) return;

          const newVersion = {
            version: incrementVersion(prompt.currentVersion),
            content: prompt.content,
            createdAt: new Date().toISOString(),
            createdBy: 'user',
            changelog,
          };

          set((state) => ({
            prompts: state.prompts.map((p) =>
              p.id === promptId
                ? {
                    ...p,
                    currentVersion: newVersion.version,
                    versions: [...p.versions, newVersion],
                  }
                : p
            ),
          }));
        },

        revertToVersion: (promptId, version) => {
          const state = get();
          const prompt = state.prompts.find((p) => p.id === promptId);
          if (!prompt) return;

          const targetVersion = prompt.versions.find((v) => v.version === version);
          if (!targetVersion) return;

          set((state) => ({
            prompts: state.prompts.map((p) =>
              p.id === promptId
                ? {
                    ...p,
                    content: targetVersion.content,
                    currentVersion: version,
                    updatedAt: new Date().toISOString(),
                  }
                : p
            ),
            editedContent: targetVersion.content,
            hasUnsavedChanges: false,
          }));
        },

        // API Integration
        loadPromptsFromServer: async () => {
          set({ isLoading: true, error: null });
          try {
            const { prompts: serverPrompts } = await promptsApi.list();

            const prompts: Prompt[] = serverPrompts.map((p) => ({
              id: p.slug,
              name: p.name,
              slug: p.slug,
              category: p.category as PromptCategory,
              description: p.description,
              content: '', // Loaded on demand
              variables: [],
              currentVersion: '1.0.0',
              versions: [],
              tags: [],
              localPath: p.path,
              syncedToBackend: false,
              status: 'active' as const,
              createdAt: p.lastModified || new Date().toISOString(),
              updatedAt: p.lastModified || new Date().toISOString(),
              exists: p.exists,
            }));

            set({ prompts, isLoading: false });
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load prompts';
            set({ error: message, isLoading: false });
          }
        },

        loadPromptContent: async (slug) => {
          set({ isLoading: true, error: null });
          try {
            const detail = await promptsApi.getBySlug(slug);
            const variables = extractVariables(detail.content);

            set((state) => ({
              prompts: state.prompts.map((p) =>
                p.slug === slug
                  ? {
                      ...p,
                      content: detail.content,
                      variables,
                      updatedAt: detail.lastModified,
                    }
                  : p
              ),
              editedContent: state.selectedPromptId === slug ? detail.content : state.editedContent,
              isLoading: false,
            }));
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load prompt content';
            set({ error: message, isLoading: false });
          }
        },

        savePromptToFile: async (slug) => {
          const state = get();
          const content = state.editedContent;
          if (!content) return;

          set({ isLoading: true, error: null });
          try {
            const result = await promptsApi.update(slug, content);

            set((state) => ({
              prompts: state.prompts.map((p) =>
                p.slug === slug
                  ? {
                      ...p,
                      content: result.content,
                      updatedAt: result.lastModified,
                    }
                  : p
              ),
              hasUnsavedChanges: false,
              isLoading: false,
            }));
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to save prompt';
            set({ error: message, isLoading: false });
          }
        },

        revertPromptToBackup: async (slug) => {
          set({ isLoading: true, error: null });
          try {
            await promptsApi.revert(slug);
            // Reload the prompt content after reverting
            const detail = await promptsApi.getBySlug(slug);
            const variables = extractVariables(detail.content);

            set((state) => ({
              prompts: state.prompts.map((p) =>
                p.slug === slug
                  ? {
                      ...p,
                      content: detail.content,
                      variables,
                      updatedAt: detail.lastModified,
                    }
                  : p
              ),
              editedContent: state.selectedPromptId === slug ? detail.content : state.editedContent,
              hasUnsavedChanges: false,
              isLoading: false,
            }));
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to revert prompt';
            set({ error: message, isLoading: false });
          }
        },

        scanDirectory: async (directory) => {
          set({ isLoading: true, error: null });
          try {
            const result = await promptsApi.scan(directory);
            console.log('Scanned directory:', result);
            // Could add discovered prompts to the registry here
            set({ isLoading: false });
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to scan directory';
            set({ error: message, isLoading: false });
          }
        },
      },
    }),
    { name: 'prompt-store' }
  )
);

// Selectors
export const useSelectedPrompt = () => {
  const prompts = usePromptStore((s) => s.prompts);
  const selectedId = usePromptStore((s) => s.selectedPromptId);
  return prompts.find((p) => p.id === selectedId) || null;
};

export const useFilteredPrompts = () => {
  const prompts = usePromptStore((s) => s.prompts);
  const categoryFilter = usePromptStore((s) => s.categoryFilter);
  const searchQuery = usePromptStore((s) => s.searchQuery);

  return prompts.filter((p) => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
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

export const usePromptsByCategory = () => {
  const prompts = usePromptStore((s) => s.prompts);
  return prompts.reduce((acc, prompt) => {
    if (!acc[prompt.category]) acc[prompt.category] = [];
    acc[prompt.category].push(prompt);
    return acc;
  }, {} as Record<PromptCategory, Prompt[]>);
};

// Helper functions
function incrementVersion(version: string): string {
  const parts = version.split('.').map(Number);
  parts[2] += 1; // Increment patch
  return parts.join('.');
}

export function extractVariables(content: string): PromptVariable[] {
  const variables: PromptVariable[] = [];
  const seen = new Set<string>();

  // Match {{variable}} and {{variable:type}} patterns
  const regex = /\{\{(\w+)(?::(\w+))?\}\}/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const name = match[1];
    const type = (match[2] as PromptVariable['type']) || 'string';

    if (!seen.has(name)) {
      seen.add(name);
      variables.push({
        name,
        type,
        description: `Variable: ${name}`,
        required: true,
      });
    }
  }

  // Also match common patterns like {transcript}, <transcript>, etc.
  const altRegex = /[{<](\w+)[}>]/g;
  while ((match = altRegex.exec(content)) !== null) {
    const name = match[1];
    if (!seen.has(name) && name.length > 2) {
      seen.add(name);
      variables.push({
        name,
        type: 'string',
        description: `Variable: ${name}`,
        required: true,
      });
    }
  }

  return variables;
}
