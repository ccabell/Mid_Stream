/**
 * Practice Library Types
 *
 * Aligned with A360's practice library data model and
 * HITL-TCP-Project requirements.
 */

// Global Library constant - used to identify global/shared items
export const GLOBAL_LIBRARY_ID = '__global__';

// Base timestamps type
export interface Timestamps {
  created_at: string;
  updated_at: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  size?: number;
}

export interface ListOfItems<T> {
  items: T[];
  total: number | null;
  page: number | null;
  size: number | null;
  pages: number | null;
}

// ============================================
// Practice
// ============================================

export interface Practice {
  id: string;
  name: string;
  is_active: boolean;
  config_level: PracticeConfigLevel;
  is_global?: boolean; // True for the Global Library entry
}

export type PracticeConfigLevel = 0 | 1 | 2 | 3;
// Level 0: No config (global defaults)
// Level 1: Basic (concern vocab, visit checklists)
// Level 2: Standard (+ service/product catalog)
// Level 3: Full (+ suggestion rules, brand voice)

// Global Library pseudo-practice entry
export const GLOBAL_LIBRARY_PRACTICE: Practice = {
  id: GLOBAL_LIBRARY_ID,
  name: 'Global Library',
  is_active: true,
  config_level: 3,
  is_global: true,
};

// Helper to check if a practice ID represents the global library
export const isGlobalLibrary = (practiceId: string | null): boolean => {
  return practiceId === GLOBAL_LIBRARY_ID || practiceId === null;
};

// Get the API practice_id parameter (null for global, actual ID for practices)
export const getApiPracticeId = (practiceId: string | null): string | null => {
  if (practiceId === GLOBAL_LIBRARY_ID) {
    return null; // API uses null for global items
  }
  return practiceId;
};

// ============================================
// Services (Practice Library)
// ============================================

export interface PLService extends Timestamps {
  id: string;
  practice_id: string;
  practice_name?: string;
  title: string;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  price: number | null;
  price_tier: PriceTier | null;
  downtime: string | null;
  is_active: boolean;
  is_preferred: boolean;
  concerns_addressed: string[];
  synergies: string[];
  suggest_when: string[];
  rationale_template: string | null;
}

export type PriceTier = '$' | '$$' | '$$$' | '$$$$' | '$$$$$';

export interface PLServiceSearchParams extends PaginationParams {
  is_active?: boolean;
  is_preferred?: boolean;
  search?: string;
  practice_id?: string;
  category?: string;
}

export interface CreatePLServicePayload {
  title: string;
  practice_id: string;
  description?: string | null;
  category?: string | null;
  subcategory?: string | null;
  price?: number | null;
  price_tier?: PriceTier | null;
  downtime?: string | null;
  is_active?: boolean;
  is_preferred?: boolean;
  concerns_addressed?: string[];
  synergies?: string[];
  suggest_when?: string[];
  rationale_template?: string | null;
}

export type UpdatePLServicePayload = Partial<CreatePLServicePayload>;

// ============================================
// Products (Practice Library)
// ============================================

export interface PLProduct extends Timestamps {
  id: string;
  practice_id: string;
  practice_name?: string;
  title: string;
  description: string | null;
  category: string | null;
  price: number | null;
  is_active: boolean;
  is_preferred: boolean;
  concerns_addressed: string[];
  suggest_when: string[];
}

export interface PLProductSearchParams extends PaginationParams {
  is_active?: boolean;
  is_preferred?: boolean;
  search?: string;
  practice_id?: string;
  category?: string;
}

export interface CreatePLProductPayload {
  title: string;
  practice_id: string;
  description?: string | null;
  category?: string | null;
  price?: number | null;
  is_active?: boolean;
  is_preferred?: boolean;
  concerns_addressed?: string[];
  suggest_when?: string[];
}

export type UpdatePLProductPayload = Partial<CreatePLProductPayload>;

// ============================================
// Packages (Practice Library)
// ============================================

export interface PLPackage extends Timestamps {
  id: string;
  practice_id: string;
  name: string;
  description: string | null;
  total_value: number;
  package_price: number;
  savings_amount: number;
  savings_percent: number;
  is_active: boolean;
  is_featured: boolean;
  items: PLPackageItem[];
  value_proposition: string | null;
}

export interface PLPackageItem {
  id: string;
  package_id: string;
  item_type: 'service' | 'product';
  item_id: string;
  item_title: string;
  quantity: number;
  unit_price: number;
}

export interface CreatePLPackagePayload {
  practice_id: string;
  name: string;
  description?: string | null;
  package_price: number;
  is_active?: boolean;
  is_featured?: boolean;
  items: Omit<PLPackageItem, 'id' | 'package_id'>[];
  value_proposition?: string | null;
}

export type UpdatePLPackagePayload = Partial<CreatePLPackagePayload>;

// ============================================
// Concerns (Practice Library)
// ============================================

export interface PLConcern extends Timestamps {
  id: string;
  practice_id: string;
  concern_id: string;
  label: string;
  category: ConcernCategory;
  maps_to_global: string | null;
  aliases: string[];
  related_services: string[];
  commonly_in_areas: string[];
}

export type ConcernCategory =
  | 'aging'
  | 'skin_quality'
  | 'pigmentation'
  | 'vascular'
  | 'acne'
  | 'scarring'
  | 'body'
  | 'hair'
  | 'wellness';

export interface CreatePLConcernPayload {
  practice_id: string;
  concern_id: string;
  label: string;
  category: ConcernCategory;
  maps_to_global?: string | null;
  aliases?: string[];
  related_services?: string[];
  commonly_in_areas?: string[];
}

export type UpdatePLConcernPayload = Partial<CreatePLConcernPayload>;

// ============================================
// Anatomy Areas (Practice Library)
// ============================================

export interface PLAnatomyArea {
  id: string;
  practice_id: string;
  area_id: string;
  label: string;
  category: AnatomyCategory;
  aliases: string[];
  related_concerns: string[];
}

export type AnatomyCategory =
  | 'face'
  | 'neck'
  | 'body'
  | 'scalp'
  | 'intimate';

// ============================================
// Visit Checklists
// ============================================

export type VisitType =
  | 'initial_consultation'
  | 'follow_up'
  | 'procedure'
  | 'treatment_visit'
  | 'consultation_only'
  | 'unknown';

export interface PLVisitChecklist {
  practice_id: string;
  visit_type: VisitType;
  extends_default: boolean;
  items: ChecklistItem[];
}

export interface ChecklistItem {
  item_id: string;
  item_order: number;
  item_label: string;
  category: ChecklistCategory;
  critical: boolean;
  default_checked: boolean;
}

export type ChecklistCategory =
  | 'safety'
  | 'clinical'
  | 'education'
  | 'closing';

// ============================================
// Suggestion Rules
// ============================================

export interface PLSuggestionRule {
  id: string;
  practice_id: string;
  service_id: string;
  priority_score: number;
  patient_benefit_weight: number;
  viability_weight: number;
  practice_value_weight: number;
  suggest_when_triggers: string[];
  rationale_template: string;
  synergy_services: string[];
}

// ============================================
// Global Library Types (read-only)
// ============================================

export interface GLService {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  is_active: boolean;
}

export interface GLProduct {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  is_active: boolean;
}

export interface GLConcern {
  concern_id: string;
  label: string;
  category: ConcernCategory;
  aliases: string[];
  commonly_in_areas: string[];
  typical_treatments: string[];
}

export interface GLAnatomyArea {
  area_id: string;
  label: string;
  category: AnatomyCategory;
  aliases: string[];
  related_concerns: string[];
}
