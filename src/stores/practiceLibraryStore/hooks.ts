/**
 * Practice Library Store Hooks
 *
 * Custom hooks for working with the practice library store
 */

import { useCallback, useEffect } from 'react';
import { usePracticeLibraryStore } from './store';
import * as selectors from './selectors';
import * as practiceLibraryApi from 'apiServices/practiceLibrary';
import type { LibraryTab } from './types';

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
      // This would call the practices API
      // const data = await practicesApi.list();
      // setPractices(data);
    } catch (error) {
      console.error('Failed to load practices:', error);
    } finally {
      setIsLoadingPractices(false);
    }
  }, [setPractices, setIsLoadingPractices]);

  return { practices, isLoading, loadPractices, setSelectedPractice };
};

/**
 * Hook to load services for selected practice
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
        const data = await practiceLibraryApi.getPLServices(
          {
            practice_id: practiceId,
            search: filters.search || undefined,
            is_active: filters.is_active ?? undefined,
            is_preferred: filters.is_preferred ?? undefined,
            category: filters.category ?? undefined,
          },
          signal
        );
        setServices(data);
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
 * Hook to load products for selected practice
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
        const data = await practiceLibraryApi.getPLProducts(
          {
            practice_id: practiceId,
            search: filters.search || undefined,
            is_active: filters.is_active ?? undefined,
            is_preferred: filters.is_preferred ?? undefined,
            category: filters.category ?? undefined,
          },
          signal
        );
        setProducts(data);
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
 * Hook to load packages for selected practice
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
        const data = await practiceLibraryApi.getPLPackages(
          { practice_id: practiceId },
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
 * Hook to load concerns for selected practice
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
        const data = await practiceLibraryApi.getPLConcerns(
          { practice_id: practiceId },
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
