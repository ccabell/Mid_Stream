/**
 * Practice Library Export Utilities
 *
 * Transforms Mid_Stream practice library data to A360-compatible JSON format
 * and provides download functionality.
 */

import type {
  PLService,
  PLProduct,
  PLPackage,
  PLConcern,
  Practice,
} from 'apiServices/practiceLibrary/types';

// ============================================
// A360 Export Format Types
// ============================================

export interface A360TreatmentInstructions {
  pretreatment: string | null;
  posttreatment: string | null;
}

export interface A360ProductDetails {
  manufacturer: string;
  technology: string;
  name: string;
  marketing_name: string | null;
  description: string;
  practice_information: string | null;
}

export interface A360PricingDetails {
  unit_of_measure: string;
  individual_price: string;
  package_price: string | null;
}

export interface A360TreatmentDetails {
  anatomy_areas: string[];
  skin_types: string[];
  timing: string | null;
  instructions: A360TreatmentInstructions | null;
}

export interface A360RegulatoryDetails {
  fda_approved_uses: string;
  off_label_usages: string[];
}

export interface A360PracticeOffering {
  product_details: A360ProductDetails;
  pricing_details: A360PricingDetails;
  treatment_details: A360TreatmentDetails;
  regulatory_details: A360RegulatoryDetails;
}

export interface A360CustomizationParameters {
  global: {
    language: string;
  };
}

export interface A360PracticeSummary {
  customizationParameters: A360CustomizationParameters;
  practice_offerings: A360PracticeOffering[];
}

// ============================================
// Mid_Stream Export Format (extended)
// ============================================

export interface MidStreamLibraryExport {
  version: string;
  exported_at: string;
  practice: {
    id: string;
    name: string;
    is_global: boolean;
  };
  services: PLService[];
  products: PLProduct[];
  packages: PLPackage[];
  concerns: PLConcern[];
}

// ============================================
// Transformers
// ============================================

/**
 * Transform a PLService to A360 PracticeOffering format
 */
function serviceToA360Offering(service: PLService): A360PracticeOffering {
  return {
    product_details: {
      manufacturer: 'Practice',
      technology: service.category ?? 'Service',
      name: service.title,
      marketing_name: null,
      description: service.description ?? '',
      practice_information: service.rationale_template ?? null,
    },
    pricing_details: {
      unit_of_measure: 'per treatment',
      individual_price: service.price ? `$${service.price.toFixed(2)}` : 'Contact for pricing',
      package_price: null,
    },
    treatment_details: {
      anatomy_areas: service.concerns_addressed ?? [],
      skin_types: ['All skin types'],
      timing: service.downtime ? `Downtime: ${service.downtime}` : null,
      instructions: null,
    },
    regulatory_details: {
      fda_approved_uses: 'Consult provider for approved uses',
      off_label_usages: [],
    },
  };
}

/**
 * Transform a PLProduct to A360 PracticeOffering format
 */
function productToA360Offering(product: PLProduct): A360PracticeOffering {
  return {
    product_details: {
      manufacturer: 'Various',
      technology: product.category ?? 'Product',
      name: product.title,
      marketing_name: null,
      description: product.description ?? '',
      practice_information: null,
    },
    pricing_details: {
      unit_of_measure: 'per unit',
      individual_price: product.price ? `$${product.price.toFixed(2)}` : 'Contact for pricing',
      package_price: null,
    },
    treatment_details: {
      anatomy_areas: product.concerns_addressed ?? [],
      skin_types: ['All skin types'],
      timing: null,
      instructions: null,
    },
    regulatory_details: {
      fda_approved_uses: 'See product documentation',
      off_label_usages: [],
    },
  };
}

/**
 * Transform practice library data to A360 PracticeSummary format
 */
export function toA360Format(
  services: PLService[],
  products: PLProduct[]
): A360PracticeSummary {
  const offerings: A360PracticeOffering[] = [
    ...services.filter((s) => s.is_active).map(serviceToA360Offering),
    ...products.filter((p) => p.is_active).map(productToA360Offering),
  ];

  return {
    customizationParameters: {
      global: {
        language: 'English',
      },
    },
    practice_offerings: offerings,
  };
}

/**
 * Create a full Mid_Stream export with all library data
 */
export function toMidStreamFormat(
  practice: Practice,
  services: PLService[],
  products: PLProduct[],
  packages: PLPackage[],
  concerns: PLConcern[]
): MidStreamLibraryExport {
  return {
    version: '1.0',
    exported_at: new Date().toISOString(),
    practice: {
      id: practice.id,
      name: practice.name,
      is_global: practice.is_global ?? false,
    },
    services,
    products,
    packages,
    concerns,
  };
}

// ============================================
// Download Functions
// ============================================

/**
 * Trigger a file download with the given content
 */
export function downloadJson(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Generate a safe filename from practice name
 */
export function generateFilename(practiceName: string, format: 'a360' | 'midstream'): string {
  const safeName = practiceName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

  const timestamp = new Date().toISOString().split('T')[0];

  if (format === 'a360') {
    return `${safeName}_practice_offerings_${timestamp}.json`;
  }
  return `${safeName}_library_export_${timestamp}.json`;
}

// ============================================
// Export Functions (high-level)
// ============================================

export interface ExportOptions {
  format: 'a360' | 'midstream';
  includeInactive?: boolean;
}

/**
 * Export practice library and trigger download
 */
export function exportPracticeLibrary(
  practice: Practice,
  services: PLService[],
  products: PLProduct[],
  packages: PLPackage[],
  concerns: PLConcern[],
  options: ExportOptions = { format: 'midstream' }
): void {
  const { format, includeInactive = false } = options;

  // Filter inactive items if needed
  const filteredServices = includeInactive ? services : services.filter((s) => s.is_active);
  const filteredProducts = includeInactive ? products : products.filter((p) => p.is_active);
  const filteredPackages = includeInactive ? packages : packages.filter((p) => p.is_active);

  let data: unknown;
  let filename: string;

  if (format === 'a360') {
    data = toA360Format(filteredServices, filteredProducts);
    filename = generateFilename(practice.name, 'a360');
  } else {
    data = toMidStreamFormat(
      practice,
      filteredServices,
      filteredProducts,
      filteredPackages,
      concerns
    );
    filename = generateFilename(practice.name, 'midstream');
  }

  downloadJson(data, filename);
}
