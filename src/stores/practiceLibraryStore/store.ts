/**
 * Practice Library Store
 *
 * Manages practice library state following A360 patterns
 */

import { createTypedStore } from '../createTypedStore';
import type {
  PracticeLibraryState,
  PracticeLibraryStore,
  PracticeLibraryFilters,
} from './types';

const defaultFilters: PracticeLibraryFilters = {
  search: '',
  is_active: null,
  is_preferred: null,
  category: null,
};

const emptyListData = {
  items: [],
  total: null,
  page: null,
  size: null,
  pages: null,
};

const initialState: PracticeLibraryState = {
  // Selected practice
  selectedPracticeId: null,
  selectedPractice: null,
  practices: [],

  // Active tab
  activeTab: 'services',

  // Filters
  filters: defaultFilters,

  // Data
  services: emptyListData,
  products: emptyListData,
  packages: emptyListData,
  concerns: emptyListData,

  // Loading states
  isLoadingPractices: false,
  isLoadingServices: false,
  isLoadingProducts: false,
  isLoadingPackages: false,
  isLoadingConcerns: false,

  // Selected items
  selectedService: null,
  selectedProduct: null,
  selectedPackage: null,
  selectedConcern: null,

  // Modal states
  isCreateModalOpen: false,
  isEditModalOpen: false,
  isImportModalOpen: false,
};

export const usePracticeLibraryStore = createTypedStore<PracticeLibraryStore, PracticeLibraryState>(
  (set) => ({
    ...initialState,
    actions: {
      // Practice selection
      setPractices: (practices) => {
        set((state) => {
          state.practices = practices;
        });
      },
      setSelectedPracticeId: (id) => {
        set((state) => {
          state.selectedPracticeId = id;
        });
      },
      setSelectedPractice: (practice) => {
        set((state) => {
          state.selectedPractice = practice;
          state.selectedPracticeId = practice?.id ?? null;
        });
      },

      // Tab
      setActiveTab: (tab) => {
        set((state) => {
          state.activeTab = tab;
        });
      },

      // Filters
      setFilters: (filters) => {
        set((state) => {
          state.filters = { ...state.filters, ...filters };
        });
      },
      resetFilters: () => {
        set((state) => {
          state.filters = defaultFilters;
        });
      },

      // Data setters
      setServices: (data) => {
        set((state) => {
          state.services = data;
        });
      },
      setProducts: (data) => {
        set((state) => {
          state.products = data;
        });
      },
      setPackages: (data) => {
        set((state) => {
          state.packages = data;
        });
      },
      setConcerns: (data) => {
        set((state) => {
          state.concerns = data;
        });
      },

      // Loading states
      setIsLoadingPractices: (loading) => {
        set((state) => {
          state.isLoadingPractices = loading;
        });
      },
      setIsLoadingServices: (loading) => {
        set((state) => {
          state.isLoadingServices = loading;
        });
      },
      setIsLoadingProducts: (loading) => {
        set((state) => {
          state.isLoadingProducts = loading;
        });
      },
      setIsLoadingPackages: (loading) => {
        set((state) => {
          state.isLoadingPackages = loading;
        });
      },
      setIsLoadingConcerns: (loading) => {
        set((state) => {
          state.isLoadingConcerns = loading;
        });
      },

      // Selected items
      setSelectedService: (service) => {
        set((state) => {
          state.selectedService = service;
        });
      },
      setSelectedProduct: (product) => {
        set((state) => {
          state.selectedProduct = product;
        });
      },
      setSelectedPackage: (pkg) => {
        set((state) => {
          state.selectedPackage = pkg;
        });
      },
      setSelectedConcern: (concern) => {
        set((state) => {
          state.selectedConcern = concern;
        });
      },

      // Modals
      openCreateModal: () => {
        set((state) => {
          state.isCreateModalOpen = true;
        });
      },
      closeCreateModal: () => {
        set((state) => {
          state.isCreateModalOpen = false;
        });
      },
      openEditModal: () => {
        set((state) => {
          state.isEditModalOpen = true;
        });
      },
      closeEditModal: () => {
        set((state) => {
          state.isEditModalOpen = false;
        });
      },
      openImportModal: () => {
        set((state) => {
          state.isImportModalOpen = true;
        });
      },
      closeImportModal: () => {
        set((state) => {
          state.isImportModalOpen = false;
        });
      },

      // Reset
      reset: () => {
        set(() => initialState);
      },
    },
  }),
  {
    persistOptions: {
      name: 'practice-library-store',
    },
  }
);
