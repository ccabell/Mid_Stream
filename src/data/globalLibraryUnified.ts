/**
 * Unified Global Library Data Layer
 *
 * Provides a common interface for accessing global library items from multiple sources:
 * - globalLibraryFromSupabase.ts (353 products from A360 Hub)
 * - globalLibrary.ts (manual entries with detailed metadata)
 *
 * This unified layer handles the differences between data formats and provides
 * consistent access for matching, display, and import workflows.
 */

import {
  globalProducts as supabaseProducts,
  globalServices as supabaseServices,
  type GlobalProduct as SupabaseProduct,
  type GlobalService as SupabaseService,
} from './globalLibraryFromSupabase';

import {
  globalProducts as manualProducts,
  globalServices as manualServices,
  type GlobalProduct as ManualProduct,
  type GlobalService as ManualService,
} from './globalLibrary';

import type { PLProduct, PLService } from 'apiServices/practiceLibrary/types';

/**
 * Unified item interface for global library items
 */
export interface UnifiedGlobalItem {
  id: string;
  name: string;
  type: 'product' | 'service';
  description: string | null;
  category: string | null;
  manufacturer: string | null;
  brandName: string | null;
  price: number | null;
  aliases: string[];
  isActive: boolean;
  source: 'supabase' | 'manual';
  // Original data for detailed view
  originalData: SupabaseProduct | ManualProduct | SupabaseService | ManualService;
}

/**
 * Convert Supabase product to unified format
 */
function convertSupabaseProduct(product: SupabaseProduct): UnifiedGlobalItem {
  return {
    id: product.id,
    name: product.name,
    type: 'product',
    description: product.description,
    category: product.category_id,
    manufacturer: product.manufacturer,
    brandName: product.brand_name,
    price: product.base_price,
    aliases: [], // Supabase products don't have aliases
    isActive: product.is_active,
    source: 'supabase',
    originalData: product,
  };
}

/**
 * Convert manual product to unified format
 */
function convertManualProduct(product: ManualProduct): UnifiedGlobalItem {
  return {
    id: product.id,
    name: product.name,
    type: 'product',
    description: product.description,
    category: product.category_code,
    manufacturer: product.manufacturer,
    brandName: product.brand_name,
    price: product.base_price,
    aliases: product.aliases ?? [],
    isActive: product.is_active,
    source: 'manual',
    originalData: product,
  };
}

/**
 * Convert Supabase service to unified format
 */
function convertSupabaseService(service: SupabaseService): UnifiedGlobalItem {
  return {
    id: service.id,
    name: service.name,
    type: 'service',
    description: service.description,
    category: service.category_id,
    manufacturer: null,
    brandName: null,
    price: service.base_price,
    aliases: [],
    isActive: service.is_active,
    source: 'supabase',
    originalData: service,
  };
}

/**
 * Convert manual service to unified format
 */
function convertManualService(service: ManualService): UnifiedGlobalItem {
  return {
    id: service.id,
    name: service.name,
    type: 'service',
    description: service.description,
    category: service.category_code,
    manufacturer: null,
    brandName: null,
    price: service.base_price,
    aliases: service.aliases ?? [],
    isActive: service.is_active,
    source: 'manual',
    originalData: service,
  };
}

/**
 * Get all unified products from both sources
 * Supabase products are primary (353 items), manual products supplement
 */
export function getUnifiedProducts(): UnifiedGlobalItem[] {
  const supabaseItems = supabaseProducts.map(convertSupabaseProduct);
  const manualItems = manualProducts.map(convertManualProduct);

  // Use Supabase as primary, add manual items that don't exist in Supabase
  const supabaseNames = new Set(supabaseItems.map((item) => item.name.toLowerCase()));
  const uniqueManualItems = manualItems.filter(
    (item) => !supabaseNames.has(item.name.toLowerCase())
  );

  return [...supabaseItems, ...uniqueManualItems];
}

/**
 * Get all unified services from both sources
 */
export function getUnifiedServices(): UnifiedGlobalItem[] {
  const supabaseItems = supabaseServices.map(convertSupabaseService);
  const manualItems = manualServices.map(convertManualService);

  // Manual services are more comprehensive, use them as primary
  // Supabase only has 2 services currently
  const manualNames = new Set(manualItems.map((item) => item.name.toLowerCase()));
  const uniqueSupabaseItems = supabaseItems.filter(
    (item) => !manualNames.has(item.name.toLowerCase())
  );

  return [...manualItems, ...uniqueSupabaseItems];
}

/**
 * Get all unified items (products + services)
 */
export function getAllGlobalItems(): UnifiedGlobalItem[] {
  return [...getUnifiedProducts(), ...getUnifiedServices()];
}

/**
 * Search unified items by name, manufacturer, or brand
 */
export function searchGlobalItems(query: string): UnifiedGlobalItem[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return getAllGlobalItems();

  return getAllGlobalItems().filter((item) => {
    // Search in name
    if (item.name.toLowerCase().includes(normalizedQuery)) return true;
    // Search in manufacturer
    if (item.manufacturer?.toLowerCase().includes(normalizedQuery)) return true;
    // Search in brand
    if (item.brandName?.toLowerCase().includes(normalizedQuery)) return true;
    // Search in description
    if (item.description?.toLowerCase().includes(normalizedQuery)) return true;
    // Search in aliases
    if (item.aliases.some((alias) => alias.toLowerCase().includes(normalizedQuery))) return true;
    return false;
  });
}

/**
 * Get unique manufacturers from products
 */
export function getManufacturers(): string[] {
  const manufacturers = new Set<string>();
  for (const product of getUnifiedProducts()) {
    if (product.manufacturer) {
      manufacturers.add(product.manufacturer);
    }
  }
  return Array.from(manufacturers).sort();
}

/**
 * Convert unified product to PLProduct format for display in ProductsList
 */
export function convertToPLProduct(item: UnifiedGlobalItem, practiceId?: string | null): PLProduct {
  return {
    id: item.id,
    practice_id: practiceId ?? null,
    title: item.name,
    description: item.description,
    category: item.category ?? item.manufacturer,
    price: item.price,
    is_active: item.isActive,
    is_preferred: false,
    concerns_addressed: [],
    suggest_when: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Convert unified service to PLService format for display in ServicesList
 */
export function convertToPLService(item: UnifiedGlobalItem, practiceId?: string | null): PLService {
  const originalService = item.originalData as ManualService | SupabaseService;

  return {
    id: item.id,
    practice_id: practiceId ?? null,
    title: item.name,
    description: item.description,
    category: item.category,
    subcategory: null,
    price: item.price,
    price_tier: null,
    downtime: null,
    is_active: item.isActive,
    is_preferred: false,
    concerns_addressed: [],
    synergies: [],
    suggest_when: [],
    rationale_template: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Get products grouped by manufacturer
 */
export function getProductsByManufacturer(): Map<string, UnifiedGlobalItem[]> {
  const byManufacturer = new Map<string, UnifiedGlobalItem[]>();

  for (const product of getUnifiedProducts()) {
    const manufacturer = product.manufacturer ?? 'Unknown';
    if (!byManufacturer.has(manufacturer)) {
      byManufacturer.set(manufacturer, []);
    }
    byManufacturer.get(manufacturer)?.push(product);
  }

  return byManufacturer;
}

// Export counts for debugging
export const UNIFIED_COUNTS = {
  get supabaseProducts() {
    return supabaseProducts.length;
  },
  get manualProducts() {
    return manualProducts.length;
  },
  get supabaseServices() {
    return supabaseServices.length;
  },
  get manualServices() {
    return manualServices.length;
  },
  get totalProducts() {
    return getUnifiedProducts().length;
  },
  get totalServices() {
    return getUnifiedServices().length;
  },
};
