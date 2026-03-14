/**
 * Practice Library - Concerns API
 */

import { apiClient } from '../client';
import type {
  ListOfItems,
  PLConcern,
  PaginationParams,
  CreatePLConcernPayload,
  UpdatePLConcernPayload,
  GLConcern,
} from './types';

const BASE_URL = '/practice/concerns';
const GLOBAL_URL = '/global/concerns';

// Practice Library Concerns
export interface PLConcernSearchParams extends PaginationParams {
  practice_id?: string;
  category?: string;
  search?: string;
}

export const getPLConcerns = async (
  params: PLConcernSearchParams,
  signal?: AbortSignal
): Promise<ListOfItems<PLConcern>> => {
  const response = await apiClient.get<ListOfItems<PLConcern>>(BASE_URL, { params, signal });
  return response.data;
};

export const getPLConcern = async (concernId: string): Promise<PLConcern> => {
  const response = await apiClient.get<PLConcern>(`${BASE_URL}/${concernId}`);
  return response.data;
};

export const createPLConcern = async (payload: CreatePLConcernPayload): Promise<PLConcern> => {
  const response = await apiClient.post<PLConcern>(BASE_URL, payload);
  return response.data;
};

export const updatePLConcern = async (
  concernId: string,
  payload: UpdatePLConcernPayload
): Promise<PLConcern> => {
  const response = await apiClient.patch<PLConcern>(`${BASE_URL}/${concernId}`, payload);
  return response.data;
};

export const deletePLConcern = async (concernId: string): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/${concernId}`);
};

// Bulk import from CSV
export const importPLConcerns = async (
  practiceId: string,
  concerns: CreatePLConcernPayload[]
): Promise<PLConcern[]> => {
  const response = await apiClient.post<PLConcern[]>(`${BASE_URL}/import`, {
    practice_id: practiceId,
    concerns,
  });
  return response.data;
};

// Global Library Concerns (read-only)
export const getGLConcerns = async (signal?: AbortSignal): Promise<GLConcern[]> => {
  const response = await apiClient.get<GLConcern[]>(GLOBAL_URL, { signal });
  return response.data;
};

export const getGLConcernsByCategory = async (
  category: string,
  signal?: AbortSignal
): Promise<GLConcern[]> => {
  const response = await apiClient.get<GLConcern[]>(`${GLOBAL_URL}/category/${category}`, { signal });
  return response.data;
};

// Match concern text to global/practice concerns
export const matchConcern = async (
  practiceId: string,
  concernText: string
): Promise<{
  matched: boolean;
  practice_concern: PLConcern | null;
  global_concern: GLConcern | null;
  confidence: number;
}> => {
  const response = await apiClient.post(`${BASE_URL}/match`, {
    practice_id: practiceId,
    concern_text: concernText,
  });
  return response.data;
};
