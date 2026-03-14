/**
 * Practice Library Store Selectors
 *
 * Provides memoized selectors for store state
 */

import type { PracticeLibraryStore } from './types';

// Practice selectors
export const selectPractices = (state: PracticeLibraryStore) => state.practices;
export const selectSelectedPracticeId = (state: PracticeLibraryStore) => state.selectedPracticeId;
export const selectSelectedPractice = (state: PracticeLibraryStore) => state.selectedPractice;
export const selectIsLoadingPractices = (state: PracticeLibraryStore) => state.isLoadingPractices;

// Library mode selectors
export const selectLibraryMode = (state: PracticeLibraryStore) => state.libraryMode;
export const selectIsGlobalLibraryMode = (state: PracticeLibraryStore) => state.libraryMode === 'global';

// Tab selector
export const selectActiveTab = (state: PracticeLibraryStore) => state.activeTab;

// Filter selectors
export const selectFilters = (state: PracticeLibraryStore) => state.filters;
export const selectSearchFilter = (state: PracticeLibraryStore) => state.filters.search;
export const selectIsActiveFilter = (state: PracticeLibraryStore) => state.filters.is_active;
export const selectCategoryFilter = (state: PracticeLibraryStore) => state.filters.category;

// Data selectors
export const selectServices = (state: PracticeLibraryStore) => state.services;
export const selectProducts = (state: PracticeLibraryStore) => state.products;
export const selectPackages = (state: PracticeLibraryStore) => state.packages;
export const selectConcerns = (state: PracticeLibraryStore) => state.concerns;

// Items selectors
export const selectServiceItems = (state: PracticeLibraryStore) => state.services.items;
export const selectProductItems = (state: PracticeLibraryStore) => state.products.items;
export const selectPackageItems = (state: PracticeLibraryStore) => state.packages.items;
export const selectConcernItems = (state: PracticeLibraryStore) => state.concerns.items;

// Loading selectors
export const selectIsLoadingServices = (state: PracticeLibraryStore) => state.isLoadingServices;
export const selectIsLoadingProducts = (state: PracticeLibraryStore) => state.isLoadingProducts;
export const selectIsLoadingPackages = (state: PracticeLibraryStore) => state.isLoadingPackages;
export const selectIsLoadingConcerns = (state: PracticeLibraryStore) => state.isLoadingConcerns;

// Selected item selectors
export const selectSelectedService = (state: PracticeLibraryStore) => state.selectedService;
export const selectSelectedProduct = (state: PracticeLibraryStore) => state.selectedProduct;
export const selectSelectedPackage = (state: PracticeLibraryStore) => state.selectedPackage;
export const selectSelectedConcern = (state: PracticeLibraryStore) => state.selectedConcern;

// Modal selectors
export const selectIsCreateModalOpen = (state: PracticeLibraryStore) => state.isCreateModalOpen;
export const selectIsEditModalOpen = (state: PracticeLibraryStore) => state.isEditModalOpen;
export const selectIsImportModalOpen = (state: PracticeLibraryStore) => state.isImportModalOpen;

// Computed selectors
export const selectCurrentTabLoading = (state: PracticeLibraryStore) => {
  switch (state.activeTab) {
    case 'services':
      return state.isLoadingServices;
    case 'products':
      return state.isLoadingProducts;
    case 'packages':
      return state.isLoadingPackages;
    case 'concerns':
      return state.isLoadingConcerns;
    default:
      return false;
  }
};

export const selectCurrentTabItemCount = (state: PracticeLibraryStore) => {
  switch (state.activeTab) {
    case 'services':
      return state.services.total ?? state.services.items.length;
    case 'products':
      return state.products.total ?? state.products.items.length;
    case 'packages':
      return state.packages.total ?? state.packages.items.length;
    case 'concerns':
      return state.concerns.total ?? state.concerns.items.length;
    default:
      return 0;
  }
};

// Action selector
export const selectActions = (state: PracticeLibraryStore) => state.actions;
