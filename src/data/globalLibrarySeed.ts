/**
 * Global Library Seed Data
 *
 * Mock data for the Global Library. This can be used to seed the database
 * or as fallback data when the API is unavailable.
 */

import { GLOBAL_LIBRARY_ID, type PLService, type PLProduct, type PLPackage, type PLConcern } from 'apiServices/practiceLibrary/types';

// ============================================
// Global Services (5 samples)
// ============================================

export const globalServices: Omit<PLService, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    practice_id: GLOBAL_LIBRARY_ID,
    practice_name: 'Global Library',
    title: 'Botox Treatment',
    description: 'Botulinum toxin injection for wrinkle reduction and facial rejuvenation. Targets dynamic wrinkles caused by muscle movement.',
    category: 'Injectables',
    subcategory: 'Neurotoxins',
    price: 12,
    price_tier: '$$',
    downtime: 'None to minimal',
    is_active: true,
    is_preferred: true,
    concerns_addressed: ['wrinkles', 'fine_lines', 'crows_feet', 'forehead_lines'],
    synergies: [],
    suggest_when: ['patient mentions wrinkles', 'patient concerned about aging'],
    rationale_template: 'Based on your concerns about {concern}, Botox can help by relaxing the muscles that cause dynamic wrinkles.',
  },
  {
    practice_id: GLOBAL_LIBRARY_ID,
    practice_name: 'Global Library',
    title: 'Dermal Filler - Juvederm',
    description: 'Hyaluronic acid dermal filler for volume restoration and facial contouring. Ideal for lips, cheeks, and nasolabial folds.',
    category: 'Injectables',
    subcategory: 'Dermal Fillers',
    price: 650,
    price_tier: '$$$',
    downtime: '24-48 hours mild swelling',
    is_active: true,
    is_preferred: true,
    concerns_addressed: ['volume_loss', 'thin_lips', 'nasolabial_folds', 'marionette_lines'],
    synergies: [],
    suggest_when: ['patient mentions volume loss', 'patient wants lip enhancement'],
    rationale_template: 'Juvederm can restore lost volume and enhance your {area} for a more youthful appearance.',
  },
  {
    practice_id: GLOBAL_LIBRARY_ID,
    practice_name: 'Global Library',
    title: 'Chemical Peel - Medium Depth',
    description: 'TCA-based chemical peel for skin resurfacing. Addresses pigmentation, fine lines, and skin texture.',
    category: 'Skin Treatments',
    subcategory: 'Chemical Peels',
    price: 350,
    price_tier: '$$',
    downtime: '5-7 days peeling',
    is_active: true,
    is_preferred: false,
    concerns_addressed: ['pigmentation', 'sun_damage', 'skin_texture', 'fine_lines'],
    synergies: [],
    suggest_when: ['patient has sun damage', 'patient concerned about skin texture'],
    rationale_template: 'A medium-depth peel can significantly improve your skin texture and address the {concern} you mentioned.',
  },
  {
    practice_id: GLOBAL_LIBRARY_ID,
    practice_name: 'Global Library',
    title: 'Laser Hair Removal',
    description: 'Permanent hair reduction using advanced laser technology. Safe for most skin types.',
    category: 'Laser Treatments',
    subcategory: 'Hair Removal',
    price: 200,
    price_tier: '$$',
    downtime: 'None',
    is_active: true,
    is_preferred: false,
    concerns_addressed: ['unwanted_hair', 'ingrown_hairs'],
    synergies: [],
    suggest_when: ['patient mentions unwanted hair', 'patient tired of shaving'],
    rationale_template: 'Laser hair removal provides long-term reduction of unwanted hair in the {area} area.',
  },
  {
    practice_id: GLOBAL_LIBRARY_ID,
    practice_name: 'Global Library',
    title: 'HydraFacial',
    description: 'Multi-step treatment combining cleansing, exfoliation, extraction, and hydration. Instant glow with no downtime.',
    category: 'Skin Treatments',
    subcategory: 'Facials',
    price: 175,
    price_tier: '$$',
    downtime: 'None',
    is_active: true,
    is_preferred: true,
    concerns_addressed: ['dull_skin', 'congested_pores', 'dehydration', 'fine_lines'],
    synergies: [],
    suggest_when: ['patient wants instant results', 'patient has event coming up'],
    rationale_template: 'HydraFacial is perfect for achieving an immediate glow while addressing your {concern} concerns.',
  },
];

// ============================================
// Global Products (5 samples)
// ============================================

export const globalProducts: Omit<PLProduct, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    practice_id: GLOBAL_LIBRARY_ID,
    practice_name: 'Global Library',
    title: 'Botox (Allergan)',
    description: 'OnabotulinumtoxinA - FDA approved neurotoxin for cosmetic use. Industry standard for wrinkle treatment.',
    category: 'Neurotoxins',
    price: 12,
    is_active: true,
    is_preferred: true,
    concerns_addressed: ['wrinkles', 'fine_lines', 'hyperhidrosis'],
    suggest_when: ['dynamic wrinkles present', 'patient requests Botox by name'],
  },
  {
    practice_id: GLOBAL_LIBRARY_ID,
    practice_name: 'Global Library',
    title: 'Juvederm Ultra XC',
    description: 'Hyaluronic acid filler with lidocaine. Ideal for lip augmentation and perioral lines.',
    category: 'Dermal Fillers',
    price: 550,
    is_active: true,
    is_preferred: true,
    concerns_addressed: ['thin_lips', 'perioral_lines', 'lip_asymmetry'],
    suggest_when: ['patient wants lip enhancement', 'lip volume loss noted'],
  },
  {
    practice_id: GLOBAL_LIBRARY_ID,
    practice_name: 'Global Library',
    title: 'Juvederm Voluma XC',
    description: 'Hyaluronic acid filler designed for cheek augmentation and mid-face volume restoration.',
    category: 'Dermal Fillers',
    price: 850,
    is_active: true,
    is_preferred: true,
    concerns_addressed: ['cheek_volume_loss', 'midface_sagging', 'facial_contour'],
    suggest_when: ['midface volume loss', 'patient wants cheek enhancement'],
  },
  {
    practice_id: GLOBAL_LIBRARY_ID,
    practice_name: 'Global Library',
    title: 'Dysport',
    description: 'AbobotulinumtoxinA - Alternative neurotoxin with faster onset. Good for larger treatment areas.',
    category: 'Neurotoxins',
    price: 4,
    is_active: true,
    is_preferred: false,
    concerns_addressed: ['wrinkles', 'fine_lines', 'forehead_lines'],
    suggest_when: ['patient prefers Dysport', 'larger treatment area needed'],
  },
  {
    practice_id: GLOBAL_LIBRARY_ID,
    practice_name: 'Global Library',
    title: 'Restylane Lyft',
    description: 'Hyaluronic acid filler for cheeks and hands. FDA approved for hand rejuvenation.',
    category: 'Dermal Fillers',
    price: 750,
    is_active: true,
    is_preferred: false,
    concerns_addressed: ['cheek_volume_loss', 'hand_rejuvenation', 'facial_contour'],
    suggest_when: ['hand volume loss noted', 'patient wants cheek lift'],
  },
];

// ============================================
// Global Concerns (sample categories)
// ============================================

export const globalConcerns: Omit<PLConcern, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    practice_id: GLOBAL_LIBRARY_ID,
    concern_id: 'wrinkles',
    label: 'Wrinkles & Fine Lines',
    category: 'aging',
    maps_to_global: null,
    aliases: ['lines', 'creases', 'crow\'s feet', 'forehead lines'],
    related_services: [],
    commonly_in_areas: ['forehead', 'around eyes', 'between brows'],
  },
  {
    practice_id: GLOBAL_LIBRARY_ID,
    concern_id: 'volume_loss',
    label: 'Volume Loss',
    category: 'aging',
    maps_to_global: null,
    aliases: ['hollow cheeks', 'sunken', 'deflated'],
    related_services: [],
    commonly_in_areas: ['cheeks', 'temples', 'under eyes'],
  },
  {
    practice_id: GLOBAL_LIBRARY_ID,
    concern_id: 'pigmentation',
    label: 'Pigmentation & Sun Damage',
    category: 'pigmentation',
    maps_to_global: null,
    aliases: ['dark spots', 'sun spots', 'melasma', 'uneven tone'],
    related_services: [],
    commonly_in_areas: ['face', 'hands', 'chest'],
  },
  {
    practice_id: GLOBAL_LIBRARY_ID,
    concern_id: 'acne_scarring',
    label: 'Acne Scarring',
    category: 'scarring',
    maps_to_global: null,
    aliases: ['acne scars', 'pitting', 'ice pick scars', 'boxcar scars'],
    related_services: [],
    commonly_in_areas: ['cheeks', 'forehead', 'chin'],
  },
  {
    practice_id: GLOBAL_LIBRARY_ID,
    concern_id: 'skin_laxity',
    label: 'Skin Laxity',
    category: 'aging',
    maps_to_global: null,
    aliases: ['sagging skin', 'loose skin', 'jowls'],
    related_services: [],
    commonly_in_areas: ['jawline', 'neck', 'cheeks'],
  },
];

// ============================================
// Global Packages (sample bundles)
// ============================================

export const globalPackages: Omit<PLPackage, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    practice_id: GLOBAL_LIBRARY_ID,
    name: 'Anti-Aging Essentials',
    description: 'Complete wrinkle treatment package combining neurotoxin and filler for comprehensive facial rejuvenation.',
    total_value: 1200,
    package_price: 999,
    savings_amount: 201,
    savings_percent: 16.75,
    is_active: true,
    is_featured: true,
    items: [],
    value_proposition: 'Save over $200 on our most popular anti-aging combination.',
  },
  {
    practice_id: GLOBAL_LIBRARY_ID,
    name: 'Glow Package',
    description: 'Skin refresher package with HydraFacial and chemical peel for radiant, healthy skin.',
    total_value: 525,
    package_price: 449,
    savings_amount: 76,
    savings_percent: 14.5,
    is_active: true,
    is_featured: false,
    items: [],
    value_proposition: 'Achieve your best skin with this comprehensive treatment combo.',
  },
];

// ============================================
// Export all seed data
// ============================================

export const globalLibrarySeedData = {
  services: globalServices,
  products: globalProducts,
  concerns: globalConcerns,
  packages: globalPackages,
};

export default globalLibrarySeedData;
