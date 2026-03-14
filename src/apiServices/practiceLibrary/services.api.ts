/**
 * Practice Library - Services API
 *
 * Aligned with A360 apiServices/practice/services pattern
 */

import { apiClient } from '../client';
import type {
  ListOfItems,
  PLService,
  PLServiceSearchParams,
  CreatePLServicePayload,
  UpdatePLServicePayload,
} from './types';

const BASE_URL = '/practice/services';

export const getPLServices = async (
  params: PLServiceSearchParams,
  signal?: AbortSignal
): Promise<ListOfItems<PLService>> => {
  const response = await apiClient.get<ListOfItems<PLService>>(BASE_URL, { params, signal });
  return response.data;
};

export const getPLService = async (serviceId: string): Promise<PLService> => {
  const response = await apiClient.get<PLService>(`${BASE_URL}/${serviceId}`);
  return response.data;
};

export const createPLService = async (payload: CreatePLServicePayload): Promise<PLService> => {
  const response = await apiClient.post<PLService>(BASE_URL, payload);
  return response.data;
};

export const updatePLService = async (
  serviceId: string,
  payload: UpdatePLServicePayload
): Promise<PLService> => {
  const response = await apiClient.patch<PLService>(`${BASE_URL}/${serviceId}`, payload);
  return response.data;
};

export const deletePLService = async (serviceId: string): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/${serviceId}`);
};

export const activatePLService = async (serviceId: string): Promise<PLService> => {
  const response = await apiClient.patch<PLService>(`${BASE_URL}/${serviceId}/activate`);
  return response.data;
};

export const deactivatePLService = async (serviceId: string): Promise<PLService> => {
  const response = await apiClient.patch<PLService>(`${BASE_URL}/${serviceId}/deactivate`);
  return response.data;
};

// Bulk operations
export const importPLServices = async (
  practiceId: string,
  services: CreatePLServicePayload[]
): Promise<PLService[]> => {
  const response = await apiClient.post<PLService[]>(`${BASE_URL}/import`, {
    practice_id: practiceId,
    services,
  });
  return response.data;
};

export const exportPLServices = async (practiceId: string): Promise<PLService[]> => {
  const response = await apiClient.get<PLService[]>(`${BASE_URL}/export`, {
    params: { practice_id: practiceId },
  });
  return response.data;
};

// ============================================
// Global Library Services
// ============================================

const GLOBAL_URL = '/global/services';

/**
 * Get all global library services (practice_id = null)
 */
export const getGLServices = async (
  params?: Omit<PLServiceSearchParams, 'practice_id'>,
  signal?: AbortSignal
): Promise<ListOfItems<PLService>> => {
  const response = await apiClient.get<ListOfItems<PLService>>(GLOBAL_URL, { params, signal });
  return response.data;
};

/**
 * Get a single global library service
 */
export const getGLService = async (serviceId: string): Promise<PLService> => {
  const response = await apiClient.get<PLService>(`${GLOBAL_URL}/${serviceId}`);
  return response.data;
};

/**
 * Create a global library service (practice_id = null)
 */
export const createGLService = async (
  payload: Omit<CreatePLServicePayload, 'practice_id'>
): Promise<PLService> => {
  const response = await apiClient.post<PLService>(GLOBAL_URL, {
    ...payload,
    practice_id: null,
  });
  return response.data;
};

/**
 * Update a global library service
 */
export const updateGLService = async (
  serviceId: string,
  payload: UpdatePLServicePayload
): Promise<PLService> => {
  const response = await apiClient.patch<PLService>(`${GLOBAL_URL}/${serviceId}`, payload);
  return response.data;
};

/**
 * Delete a global library service
 */
export const deleteGLService = async (serviceId: string): Promise<void> => {
  await apiClient.delete(`${GLOBAL_URL}/${serviceId}`);
};
