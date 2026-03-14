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
