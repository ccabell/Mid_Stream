/**
 * Practice Library - Products API
 *
 * Aligned with A360 apiServices/practice/products pattern
 */

import { apiClient } from '../client';
import type {
  ListOfItems,
  PLProduct,
  PLProductSearchParams,
  CreatePLProductPayload,
  UpdatePLProductPayload,
} from './types';

const BASE_URL = '/practice/products';

export const getPLProducts = async (
  params: PLProductSearchParams,
  signal?: AbortSignal
): Promise<ListOfItems<PLProduct>> => {
  const response = await apiClient.get<ListOfItems<PLProduct>>(BASE_URL, { params, signal });
  return response.data;
};

export const getPLProduct = async (productId: string): Promise<PLProduct> => {
  const response = await apiClient.get<PLProduct>(`${BASE_URL}/${productId}`);
  return response.data;
};

export const createPLProduct = async (payload: CreatePLProductPayload): Promise<PLProduct> => {
  const response = await apiClient.post<PLProduct>(BASE_URL, payload);
  return response.data;
};

export const updatePLProduct = async (
  productId: string,
  payload: UpdatePLProductPayload
): Promise<PLProduct> => {
  const response = await apiClient.patch<PLProduct>(`${BASE_URL}/${productId}`, payload);
  return response.data;
};

export const deletePLProduct = async (productId: string): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/${productId}`);
};

export const activatePLProduct = async (productId: string): Promise<PLProduct> => {
  const response = await apiClient.patch<PLProduct>(`${BASE_URL}/${productId}/activate`);
  return response.data;
};

export const deactivatePLProduct = async (productId: string): Promise<PLProduct> => {
  const response = await apiClient.patch<PLProduct>(`${BASE_URL}/${productId}/deactivate`);
  return response.data;
};

// Bulk operations
export const importPLProducts = async (
  practiceId: string,
  products: CreatePLProductPayload[]
): Promise<PLProduct[]> => {
  const response = await apiClient.post<PLProduct[]>(`${BASE_URL}/import`, {
    practice_id: practiceId,
    products,
  });
  return response.data;
};

// ============================================
// Global Library Products
// ============================================

const GLOBAL_URL = '/global/products';

/**
 * Get all global library products (practice_id = null)
 */
export const getGLProducts = async (
  params?: Omit<PLProductSearchParams, 'practice_id'>,
  signal?: AbortSignal
): Promise<ListOfItems<PLProduct>> => {
  const response = await apiClient.get<ListOfItems<PLProduct>>(GLOBAL_URL, { params, signal });
  return response.data;
};

/**
 * Get a single global library product
 */
export const getGLProduct = async (productId: string): Promise<PLProduct> => {
  const response = await apiClient.get<PLProduct>(`${GLOBAL_URL}/${productId}`);
  return response.data;
};

/**
 * Create a global library product (practice_id = null)
 */
export const createGLProduct = async (
  payload: Omit<CreatePLProductPayload, 'practice_id'>
): Promise<PLProduct> => {
  const response = await apiClient.post<PLProduct>(GLOBAL_URL, {
    ...payload,
    practice_id: null,
  });
  return response.data;
};

/**
 * Update a global library product
 */
export const updateGLProduct = async (
  productId: string,
  payload: UpdatePLProductPayload
): Promise<PLProduct> => {
  const response = await apiClient.patch<PLProduct>(`${GLOBAL_URL}/${productId}`, payload);
  return response.data;
};

/**
 * Delete a global library product
 */
export const deleteGLProduct = async (productId: string): Promise<void> => {
  await apiClient.delete(`${GLOBAL_URL}/${productId}`);
};
