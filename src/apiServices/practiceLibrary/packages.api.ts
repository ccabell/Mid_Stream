/**
 * Practice Library - Packages API
 */

import { apiClient } from '../client';
import type {
  ListOfItems,
  PLPackage,
  PaginationParams,
  CreatePLPackagePayload,
  UpdatePLPackagePayload,
} from './types';

const BASE_URL = '/practice/packages';

export interface PLPackageSearchParams extends PaginationParams {
  practice_id?: string;
  is_active?: boolean;
  is_featured?: boolean;
  search?: string;
}

export const getPLPackages = async (
  params: PLPackageSearchParams,
  signal?: AbortSignal
): Promise<ListOfItems<PLPackage>> => {
  const response = await apiClient.get<ListOfItems<PLPackage>>(BASE_URL, { params, signal });
  return response.data;
};

export const getPLPackage = async (packageId: string): Promise<PLPackage> => {
  const response = await apiClient.get<PLPackage>(`${BASE_URL}/${packageId}`);
  return response.data;
};

export const createPLPackage = async (payload: CreatePLPackagePayload): Promise<PLPackage> => {
  const response = await apiClient.post<PLPackage>(BASE_URL, payload);
  return response.data;
};

export const updatePLPackage = async (
  packageId: string,
  payload: UpdatePLPackagePayload
): Promise<PLPackage> => {
  const response = await apiClient.patch<PLPackage>(`${BASE_URL}/${packageId}`, payload);
  return response.data;
};

export const deletePLPackage = async (packageId: string): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/${packageId}`);
};

export const activatePLPackage = async (packageId: string): Promise<PLPackage> => {
  const response = await apiClient.patch<PLPackage>(`${BASE_URL}/${packageId}/activate`);
  return response.data;
};

export const deactivatePLPackage = async (packageId: string): Promise<PLPackage> => {
  const response = await apiClient.patch<PLPackage>(`${BASE_URL}/${packageId}/deactivate`);
  return response.data;
};

// Calculate package pricing
export const calculatePackagePricing = async (
  items: { item_type: 'service' | 'product'; item_id: string; quantity: number }[]
): Promise<{
  total_value: number;
  suggested_price: number;
  savings_amount: number;
  savings_percent: number;
}> => {
  const response = await apiClient.post(`${BASE_URL}/calculate`, { items });
  return response.data;
};
