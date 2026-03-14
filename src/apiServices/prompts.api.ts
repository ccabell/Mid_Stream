import axios from 'axios';

// Prompts API connects to local prompt server via Vite proxy
const promptsClient = axios.create({
  baseURL: '/prompts-api',
  headers: { 'Content-Type': 'application/json' },
});

promptsClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error ?? err.message ?? 'Request failed';
    return Promise.reject(new Error(typeof message === 'string' ? message : JSON.stringify(message)));
  }
);

export interface PromptMeta {
  slug: string;
  name: string;
  category: string;
  description: string;
  path: string;
  exists: boolean;
  lastModified: string | null;
}

export interface PromptDetail extends PromptMeta {
  content: string;
  size: number;
}

export interface ScannedFile {
  file: string;
  title: string;
  path: string;
  size: number;
  lastModified: string;
}

export interface BasePaths {
  primary: string;
  conversational: string;
  reach: string;
}

export const promptsApi = {
  /** List all registered prompts with metadata */
  list: () =>
    promptsClient
      .get<{ prompts: PromptMeta[]; basePaths: BasePaths }>('/prompts')
      .then((r) => r.data),

  /** Get a single prompt by slug with full content */
  getBySlug: (slug: string) =>
    promptsClient.get<PromptDetail>(`/prompts/${slug}`).then((r) => r.data),

  /** Update a prompt's content */
  update: (slug: string, content: string) =>
    promptsClient
      .put<PromptDetail>(`/prompts/${slug}`, { content })
      .then((r) => r.data),

  /** Revert a prompt to its backup */
  revert: (slug: string) =>
    promptsClient
      .post<{ message: string; slug: string }>(`/prompts/${slug}/revert`)
      .then((r) => r.data),

  /** Scan a directory for additional prompt files */
  scan: (directory: string) =>
    promptsClient
      .post<{ directory: string; files: ScannedFile[] }>('/prompts/scan', { directory })
      .then((r) => r.data),

  /** Read any file by path */
  readFile: (path: string) =>
    promptsClient
      .get<{ path: string; content: string; lastModified: string; size: number }>('/prompts/file', {
        params: { path },
      })
      .then((r) => r.data),

  /** Write any file by path */
  writeFile: (path: string, content: string) =>
    promptsClient
      .put<{ path: string; lastModified: string; size: number; message: string }>('/prompts/file', {
        path,
        content,
      })
      .then((r) => r.data),

  /** Health check */
  health: () =>
    promptsClient
      .get<{ status: string; timestamp: string }>('/health')
      .then((r) => r.data),
};
