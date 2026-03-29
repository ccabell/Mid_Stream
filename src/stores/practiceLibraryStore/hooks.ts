/**
 * Practice Library Store Hooks
 *
 * Custom hooks for working with the practice library store.
 * Round 21: pl_services and pl_products now query Supabase directly
 * instead of using the localStorage stub.
 */

import { useCallback, useEffect } from 'react';
import { usePracticeLibraryStore } from './store';
import * as selectors from './selectors';
import * as practiceLibraryApi from 'apiServices/practiceLibrary';
import { isGlobalLibrary } from 'apiServices/practiceLibrary/types';
import type { PLService, PLProduct } from 'apiServices/practiceLibrary/types';
import type { LibraryTab } from './types';
import {
  getUnifiedProducts,
  getUnifiedServices,
  convertToPLProduct,
  convertToPLService,
} from 'data/globalLibraryUnified';
import { supabase } from 'lib/supabaseClient';

/**
 * Hook for accessing store actions
 */
export const usePracticeLibraryActions = () => {
  return usePracticeLibraryStore(selectors.selectActions);
};

/**
 * Hook for selected practice
 */
export const useSelectedPractice = () => {
  const practice = usePracticeLibraryStore(selectors.selectSelectedPractice);
  const practiceId = usePracticeLibraryStore(selectors.selectSelectedPracticeId);
  return { practice, practiceId };
};

/**
 * Hook for active tab
 */
export const useActiveTab = () => {
  const activeTab = usePracticeLibraryStore(selectors.selectActiveTab);
  const { setActiveTab } = usePracticeLibraryActions();
  return { activeTab, setActiveTab };
};

/**
 * Hook for filters
 */
export const useFilters = () => {
  const filters = usePracticeLibraryStore(selectors.selectFilters);
  const { setFilters, resetFilters } = usePracticeLibraryActions();
  return { filters, setFilters, resetFilters };
};

/**
 * Hook to load practices
 */
export const usePractices = () => {
  const practices = usePracticeLibraryStore(selectors.selectPractices);
  const isLoading = usePracticeLibraryStore(selectors.selectIsLoadingPractices);
  const { setPractices, setIsLoadingPractices, setSelectedPractice } = usePracticeLibraryActions();

  const loadPractices = useCallback(async () => {
    setIsLoadingPractices(true);
    try {
      // Practices are loaded by PracticeSelector via practicesApi.list()
      // This hook is a no-op stub kept for API compatibility
    } catch (error) {
      console.error('Failed to load practices:', error);
    } finally {
      setIsLoadingPractices(false);
    }
  }, [setPractices, setIsLoadingPractices]);

  return { practices, isLoading, loadPractices, setSelectedPractice };
};

/**
 * Hook to load services for selected practice or global library.
 *
 * Global Library → static unified data (globalLibraryUnified.ts)
 * Practice Library → Supabase pl_services table (Round 21: replaces localStorage stub)
 */
export const useServices = () => {
  const services = usePracticeLibraryStore(selectors.selectServices);
  const isLoading = usePracticeLibraryStore(selectors.selectIsLoadingServices);
  const practiceId = usePracticeLibraryStore(selectors.selectSelectedPracticeId);
  const filters = usePracticeLibraryStore(selectors.selectFilters);
  const { setServices, setIsLoadingServices } = usePracticeLibraryActions();

  const loadServices = useCallback(
    async (signal?: AbortSignal) => {
      if (!practiceId) return;

      setIsLoadingServices(true);
      try {
        if (isGlobalLibrary(practiceId)) {
          // Global Library: load from static unified data
          let items = getUnifiedServices().map((item) => convertToPLService(item, null));

          if (filters.search) {
            const q = filters.search.toLowerCase();
            items = items.filter(
              (item) =>
                item.title.toLowerCase().includes(q) ||
                item.description?.toLowerCase().includes(q) ||
                item.category?.toLowerCase().includes(q)
            );
          }
          if (filters.is_active !== null) {
            items = items.filter((item) => item.is_active === filters.is_active);
          }

          setServices({ items, total: items.length, page: 1, size: items.length, pages: 1 });
        } else {
          // Practice Library: query Supabase pl_services table
          if (signal?.aborted) return;

          let query = supabase
            .from('pl_services')
            .select('*')
            .eq('practice_id', practiceId)
            .order('display_order', { ascending: true });

          if (filters.search) {
            query = query.ilike('title', `%${filters.search}%`);
          }
          if (filters.is_active !== null) {
            query = query.eq('is_active', filters.is_active);
          }

          const { data, error } = await query;

          if (signal?.aborted) return;
          if (error) throw error;

          // Map Supabase rows to PLService shape
          const items: PLService[] = (data ?? []).map((row) => ({
            id: row.id,
            practice_id: row.practice_id,
            title: row.title,
            description: row.description ?? null,
            category: row.category ?? null,
            subcategory: row.subcategory ?? null,
            price: row.price ?? null,
            price_tier: row.price_tier ?? null,
            downtime: row.downtime ?? null,
            is_active: row.is_active ?? true,
            is_preferred: row.is_preferred ?? false,
            concerns_addressed: row.concerns_addressed ?? [],
            synergies: row.synergies ?? [],
            suggest_when: row.suggest_when ?? [],
            rationale_template: null,
            created_at: row.created_at ?? '',
            updated_at: row.updated_at ?? '',
          }));

          setServices({ items, total: items.length, page: 1, size: items.length, pages: 1 });
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Failed to load services:', error);
        }
      } finally {
        setIsLoadingServices(false);
      }
    },
    [practiceId, filters, setServices, setIsLoadingServices]
  );

  return { services, isLoading, loadServices };
};

/**
 * Hook to load products for selected practice or global library.
 *
 * Global Library → static unified data (globalLibraryUnified.ts, 353+ products)
 * Practice Library → Supabase pl_products table (Round 21: replaces localStorage stub)
 */
export const useProducts = () => {
  const products = usePracticeLibraryStore(selectors.selectProducts);
  const isLoading = usePracticeLibraryStore(selectors.selectIsLoadingProducts);
  const practiceId = usePracticeLibraryStore(selectors.selectSelectedPracticeId);
  const filters = usePracticeLibraryStore(selectors.selectFilters);
  const { setProducts, setIsLoadingProducts } = usePracticeLibraryActions();

  const loadProducts = useCallback(
    async (signal?: AbortSignal) => {
      if (!practiceId) return;

      setIsLoadingProducts(true);
      try {
        if (isGlobalLibrary(practiceId)) {
          // Global Library: load from static unified data (353+ products)
          let items = getUnifiedProducts().map((item) => convertToPLProduct(item, null));

          if (filters.search) {
            const q = filters.search.toLowerCase();
            items = items.filter(
              (item) =>
                item.title.toLowerCase().includes(q) ||
                item.description?.toLowerCase().includes(q) ||
                item.category?.toLowerCase().includes(q)
            );
          }
          if (filters.is_active !== null) {
            items = items.filter((item) => item.is_active === filters.is_active);
          }

          setProducts({ items, total: items.length, page: 1, size: items.length, pages: 1 });
        } else {
          // Practice Library: query Supabase pl_products table
          if (signal?.aborted) return;

          let query = supabase
            .from('pl_products')
            .select('*')
            .eq('practice_id', practiceId)
            .order('display_order', { ascending: true });

          if (filters.search) {
            query = query.ilike('title', `%${filters.search}%`);
          }
          if (filters.is_active !== null) {
            query = query.eq('is_active', filters.is_active);
          }

          const { data, error } = await query;

          if (signal?.aborted) return;
          if (error) throw error;

          // Map Supabase rows to PLProduct shape
          const items: PLProduct[] = (data ?? []).map((row) => ({
            id: row.id,
            practice_id: row.practice_id,
            title: row.title,
            description: row.description ?? null,
            category: row.category ?? null,
            price: row.price ?? null,
            is_active: row.is_active ?? true,
            is_preferred: row.is_preferred ?? false,
            concerns_addressed: row.concerns_addressed ?? [],
            suggest_when: row.suggest_when ?? [],
            created_at: row.created_at ?? '',
            updated_at: row.updated_at ?? '',
          }));

          setProducts({ items, total: items.length, page: 1, size: items.length, pages: 1 });
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Failed to load products:', error);
        }
      } finally {
        setIsLoadingProducts(false);
      }
    },
    [practiceId, filters, setProducts, setIsLoadingProducts]
  );

  return { products, isLoading, loadProducts };
};

/**
 * Hook to load packages for selected practice or global library
 */
export const usePackages = () => {
  const packages = usePracticeLibraryStore(selectors.selectPackages);
  const isLoading = usePracticeLibraryStore(selectors.selectIsLoadingPackages);
  const practiceId = usePracticeLibraryStore(selectors.selectSelectedPracticeId);
  const { setPackages, setIsLoadingPackages } = usePracticeLibraryActions();

  const loadPackages = useCallback(
    async (signal?: AbortSignal) => {
      if (!practiceId) return;

      setIsLoadingPackages(true);
      try {
        const apiPracticeId = isGlobalLibrary(practiceId) ? undefined : practiceId;
        const data = await practiceLibraryApi.getPLPackages(
          { practice_id: apiPracticeId },
          signal
        );
        setPackages(data);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Failed to load packages:', error);
        }
      } finally {
        setIsLoadingPackages(false);
      }
    },
    [practiceId, setPackages, setIsLoadingPackages]
  );

  return { packages, isLoading, loadPackages };
};

/**
 * Hook to load concerns for selected practice or global library
 */
export const useConcerns = () => {
  const concerns = usePracticeLibraryStore(selectors.selectConcerns);
  const isLoading = usePracticeLibraryStore(selectors.selectIsLoadingConcerns);
  const practiceId = usePracticeLibraryStore(selectors.selectSelectedPracticeId);
  const { setConcerns, setIsLoadingConcerns } = usePracticeLibraryActions();

  const loadConcerns = useCallback(
    async (signal?: AbortSignal) => {
      if (!practiceId) return;

      setIsLoadingConcerns(true);
      try {
        const apiPracticeId = isGlobalLibrary(practiceId) ? undefined : practiceId;
        const data = await practiceLibraryApi.getPLConcerns(
          { practice_id: apiPracticeId },
          signal
        );
        setConcerns(data);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Failed to load concerns:', error);
        }
      } finally {
        setIsLoadingConcerns(false);
      }
    },
    [practiceId, setConcerns, setIsLoadingConcerns]
  );

  return { concerns, isLoading, loadConcerns };
};

/**
 * Hook to load data for active tab when practice or filters change
 */
export const useLoadActiveTabData = () => {
  const activeTab = usePracticeLibraryStore(selectors.selectActiveTab);
  const practiceId = usePracticeLibraryStore(selectors.selectSelectedPracticeId);
  const filters = usePracticeLibraryStore(selectors.selectFilters);
  const { loadServices } = useServices();
  const { loadProducts } = useProducts();
  const { loadPackages } = usePackages();
  const { loadConcerns } = useConcerns();

  useEffect(() => {
    if (!practiceId) return;
    const controller = new AbortController();

    const loadData = async () => {
      switch (activeTab) {
        case 'services':
          await loadServices(controller.signal);
          break;
        case 'products':
          await loadProducts(controller.signal);
          break;
        case 'packages':
          await loadPackages(controller.signal);
          break;
        case 'concerns':
          await loadConcerns(controller.signal);
          break;
      }
    };

    loadData();
    return () => {
      controller.abort();
    };
  }, [activeTab, practiceId, filters, loadServices, loadProducts, loadPackages, loadConcerns]);
};

/**
 * Hook for modal states
 */
export const useModals = () => {
  const isCreateModalOpen = usePracticeLibraryStore(selectors.selectIsCreateModalOpen);
  const isEditModalOpen = usePracticeLibraryStore(selectors.selectIsEditModalOpen);
  const isImportModalOpen = usePracticeLibraryStore(selectors.selectIsImportModalOpen);
  const {
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openImportModal,
    closeImportModal,
  } = usePracticeLibraryActions();

  return {
    isCreateModalOpen,
    isEditModalOpen,
    isImportModalOpen,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openImportModal,
    closeImportModal,
  };
};

/**
 * Hook for library mode
 */
export const useLibraryMode = () => {
  const libraryMode = usePracticeLibraryStore(selectors.selectLibraryMode);
  const isGlobalLibraryMode = usePracticeLibraryStore(selectors.selectIsGlobalLibraryMode);
  const { setLibraryMode } = usePracticeLibraryActions();
  return { libraryMode, isGlobalLibraryMode, setLibraryMode };
};

/**
 * Hook for selected items
 */
export const useSelectedItems = () => {
  const selectedService = usePracticeLibraryStore(selectors.selectSelectedService);
  const selectedProduct = usePracticeLibraryStore(selectors.selectSelectedProduct);
  const selectedPackage = usePracticeLibraryStore(selectors.selectSelectedPackage);
  const selectedConcern = usePracticeLibraryStore(selectors.selectSelectedConcern);
  const {
    setSelectedService,
    setSelectedProduct,
    setSelectedPackage,
    setSelectedConcern,
  } = usePracticeLibraryActions();

  return {
    selectedService,
    selectedProduct,
    selectedPackage,
    selectedConcern,
    setSelectedService,
    setSelectedProduct,
    setSelectedPackage,
    setSelectedConcern,
  };
};
