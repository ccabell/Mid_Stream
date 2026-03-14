/**
 * Practice Library Files API
 *
 * Access practice library files from the database.
 * These files are loaded by the HITL prompt for practice-specific context.
 */

import { client } from '../client';
import type { PracticeLibraryTag, LoadedPracticeFile } from '../../agents/types';

// ============================================================================
// TYPES
// ============================================================================

export interface PracticeLibraryFilesResponse {
  practice_id: string;
  files: LoadedPracticeFile[];
}

export interface PracticeLibraryFileResponse {
  practice_id: string;
  filename: string;
  file_type: string;
  content: string;
  content_json?: unknown;
  tags?: string[];
  shared?: boolean;
}

// ============================================================================
// API
// ============================================================================

export const practiceLibraryFilesApi = {
  /**
   * List practice library files for a practice
   * @param practiceId - The practice ID (e.g., "calospa")
   * @param tags - Optional tags to filter by (e.g., ["concerns", "suggestions"])
   */
  list: (practiceId: string, tags?: PracticeLibraryTag[]) =>
    client
      .get<PracticeLibraryFilesResponse>(`/practice-library/${practiceId}`, {
        params: tags?.length ? { tags: tags.join(',') } : undefined,
      })
      .then((r) => r.data),

  /**
   * Get a specific file by filename
   * @param practiceId - The practice ID
   * @param filename - The filename to retrieve
   */
  getFile: (practiceId: string, filename: string) =>
    client
      .get<PracticeLibraryFileResponse>(`/practice-library/${practiceId}/file/${filename}`)
      .then((r) => r.data),
};
