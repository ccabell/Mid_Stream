/**
 * Practice Library Store Types
 */

import type {
  ListOfItems,
  PLService,
  PLProduct,
  PLPackage,
  PLConcern,
  Practice,
} from 'apiServices/practiceLibrary/types';
import type { ParsedItem } from 'utils/fileParser';
import type { MatchResult, SelectedMatch } from 'utils/stringMatcher';

export type LibraryMode = 'global' | 'practice';

export type LibraryTab = 'services' | 'products' | 'packages' | 'concerns' | 'configuration';

/**
 * Practice-specific configuration for anatomy areas and concerns.
 * This enables standardized AI outputs by defining the practice's vocabulary.
 */
export interface PracticeConfiguration {
  selectedAnatomyAreas: string[];
  selectedConcerns: string[];
  customAnatomyAreas: string[];
  customConcerns: string[];
}

export type PLServicesData = ListOfItems<PLService>;
export type PLProductsData = ListOfItems<PLProduct>;
export type PLPackagesData = ListOfItems<PLPackage>;
export type PLConcernsData = ListOfItems<PLConcern>;

export interface PracticeLibraryFilters {
  search: string;
  is_active: boolean | null;
  is_preferred: boolean | null;
  category: string | null;
}

export interface PracticeLibraryState {
  // Selected practice
  selectedPracticeId: string | null;
  selectedPractice: Practice | null;
  practices: Practice[];

  // Library mode (global vs practice-specific)
  libraryMode: LibraryMode;

  // Active tab
  activeTab: LibraryTab;

  // Filters
  filters: PracticeLibraryFilters;

  // Data
  services: PLServicesData;
  products: PLProductsData;
  packages: PLPackagesData;
  concerns: PLConcernsData;

  // Loading states
  isLoadingPractices: boolean;
  isLoadingServices: boolean;
  isLoadingProducts: boolean;
  isLoadingPackages: boolean;
  isLoadingConcerns: boolean;

  // Selected items for editing
  selectedService: PLService | null;
  selectedProduct: PLProduct | null;
  selectedPackage: PLPackage | null;
  selectedConcern: PLConcern | null;

  // Modal states
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isImportModalOpen: boolean;

  // Import workflow state
  importStep: 0 | 1 | 2; // 0: upload, 1: review, 2: confirm
  importFile: File | null;
  parsedItems: ParsedItem[];
  matchResults: MatchResult[];
  selectedMatches: SelectedMatch[];
  isMatching: boolean;

  // Practice configuration (anatomy areas & concerns)
  practiceConfig: PracticeConfiguration | null;
  isLoadingConfig: boolean;
}

export interface PracticeLibraryActions {
  // Practice selection
  setPractices: (practices: Practice[]) => void;
  setSelectedPracticeId: (id: string | null) => void;
  setSelectedPractice: (practice: Practice | null) => void;

  // Library mode
  setLibraryMode: (mode: LibraryMode) => void;

  // Tab
  setActiveTab: (tab: LibraryTab) => void;

  // Filters
  setFilters: (filters: Partial<PracticeLibraryFilters>) => void;
  resetFilters: () => void;

  // Data setters
  setServices: (data: PLServicesData) => void;
  setProducts: (data: PLProductsData) => void;
  setPackages: (data: PLPackagesData) => void;
  setConcerns: (data: PLConcernsData) => void;

  // Loading states
  setIsLoadingPractices: (loading: boolean) => void;
  setIsLoadingServices: (loading: boolean) => void;
  setIsLoadingProducts: (loading: boolean) => void;
  setIsLoadingPackages: (loading: boolean) => void;
  setIsLoadingConcerns: (loading: boolean) => void;

  // Selected items
  setSelectedService: (service: PLService | null) => void;
  setSelectedProduct: (product: PLProduct | null) => void;
  setSelectedPackage: (pkg: PLPackage | null) => void;
  setSelectedConcern: (concern: PLConcern | null) => void;

  // Modals
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: () => void;
  closeEditModal: () => void;
  openImportModal: () => void;
  closeImportModal: () => void;

  // Import workflow
  setImportStep: (step: 0 | 1 | 2) => void;
  setImportFile: (file: File | null) => void;
  setParsedItems: (items: ParsedItem[]) => void;
  setMatchResults: (results: MatchResult[]) => void;
  setSelectedMatches: (matches: SelectedMatch[]) => void;
  updateSelectedMatch: (index: number, match: SelectedMatch) => void;
  setIsMatching: (loading: boolean) => void;
  resetImportState: () => void;

  // Practice configuration
  setPracticeConfig: (config: PracticeConfiguration | null) => void;
  updateSelectedAnatomyAreas: (areaIds: string[]) => void;
  updateSelectedConcerns: (concernIds: string[]) => void;
  addCustomAnatomyArea: (area: string) => void;
  removeCustomAnatomyArea: (area: string) => void;
  addCustomConcern: (concern: string) => void;
  removeCustomConcern: (concern: string) => void;
  setIsLoadingConfig: (loading: boolean) => void;
  savePracticeConfig: () => void;
  loadPracticeConfig: (practiceId: string) => void;

  // Reset
  reset: () => void;
}

export type PracticeLibraryStore = PracticeLibraryState & { actions: PracticeLibraryActions };
