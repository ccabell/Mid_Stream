/**
 * Standardized Anatomy Areas & Patient Concerns
 *
 * Global definitions for anatomy areas and concerns that practices can select from.
 * This enables consistent AI outputs by providing a controlled vocabulary.
 */

// ============================================================================
// ANATOMY AREAS
// ============================================================================

export type AnatomyRegion = 'face' | 'body' | 'skin';

export interface AnatomyArea {
  id: string;
  name: string;
  region: AnatomyRegion;
  subAreas?: string[];
  aliases: string[];
}

export const globalAnatomyAreas: AnatomyArea[] = [
  // Face Region
  {
    id: 'forehead',
    name: 'Forehead',
    region: 'face',
    subAreas: ['Glabella', 'Frontalis', 'Brow'],
    aliases: ['brow', 'brow area', 'upper face'],
  },
  {
    id: 'temples',
    name: 'Temples',
    region: 'face',
    aliases: ['temple area', 'temporal region'],
  },
  {
    id: 'periorbital',
    name: 'Periorbital Area',
    region: 'face',
    subAreas: ["Crow's Feet", 'Under Eyes', 'Upper Eyelids', 'Lower Eyelids', 'Tear Troughs'],
    aliases: ['eye area', 'around eyes', 'eyes', 'under eye'],
  },
  {
    id: 'nose',
    name: 'Nose',
    region: 'face',
    subAreas: ['Nasal Bridge', 'Nasal Tip', 'Nostrils'],
    aliases: ['nasal area'],
  },
  {
    id: 'cheeks',
    name: 'Cheeks',
    region: 'face',
    subAreas: ['Malar', 'Submalar', 'Zygomatic'],
    aliases: ['mid-face', 'midface', 'cheek area'],
  },
  {
    id: 'nasolabial',
    name: 'Nasolabial Folds',
    region: 'face',
    aliases: ['smile lines', 'laugh lines', 'nasolabial area', 'NLF'],
  },
  {
    id: 'lips',
    name: 'Lips',
    region: 'face',
    subAreas: ['Upper Lip', 'Lower Lip', 'Vermillion Border', 'Cupid\'s Bow', 'Philtrum'],
    aliases: ['mouth', 'lip area', 'perioral'],
  },
  {
    id: 'marionette',
    name: 'Marionette Lines',
    region: 'face',
    aliases: ['marionette folds', 'oral commissure'],
  },
  {
    id: 'chin',
    name: 'Chin',
    region: 'face',
    subAreas: ['Mentalis', 'Prejowl Sulcus'],
    aliases: ['mentum', 'chin area'],
  },
  {
    id: 'jawline',
    name: 'Jawline',
    region: 'face',
    subAreas: ['Mandibular Angle', 'Jowls'],
    aliases: ['jaw', 'lower face', 'mandible'],
  },
  {
    id: 'neck',
    name: 'Neck',
    region: 'face',
    subAreas: ['Platysma', 'Tech Neck', 'Neck Bands', 'Submental'],
    aliases: ['neck area', 'cervical'],
  },

  // Body Region
  {
    id: 'abdomen',
    name: 'Abdomen',
    region: 'body',
    subAreas: ['Upper Abdomen', 'Lower Abdomen', 'Umbilical'],
    aliases: ['stomach', 'belly', 'tummy', 'abs', 'abdominal area'],
  },
  {
    id: 'flanks',
    name: 'Flanks',
    region: 'body',
    aliases: ['love handles', 'sides', 'waist'],
  },
  {
    id: 'back',
    name: 'Back',
    region: 'body',
    subAreas: ['Upper Back', 'Lower Back', 'Bra Fat'],
    aliases: ['back area', 'posterior'],
  },
  {
    id: 'arms',
    name: 'Arms',
    region: 'body',
    subAreas: ['Upper Arms', 'Forearms', 'Axilla'],
    aliases: ['arm area', 'bat wings'],
  },
  {
    id: 'thighs',
    name: 'Thighs',
    region: 'body',
    subAreas: ['Inner Thighs', 'Outer Thighs', 'Anterior Thighs'],
    aliases: ['legs', 'upper legs', 'thigh area'],
  },
  {
    id: 'knees',
    name: 'Knees',
    region: 'body',
    aliases: ['knee area', 'above knee'],
  },
  {
    id: 'buttocks',
    name: 'Buttocks',
    region: 'body',
    subAreas: ['Banana Roll'],
    aliases: ['glutes', 'butt', 'gluteal area', 'booty'],
  },
  {
    id: 'chest',
    name: 'Chest',
    region: 'body',
    subAreas: ['Pectorals', 'Breast'],
    aliases: ['chest area', 'pecs'],
  },

  // Skin-Focused Areas
  {
    id: 'full_face',
    name: 'Full Face',
    region: 'skin',
    aliases: ['entire face', 'whole face', 'face'],
  },
  {
    id: 'decolletage',
    name: 'Décolletage',
    region: 'skin',
    aliases: ['decollete', 'chest area', 'upper chest', 'neckline'],
  },
  {
    id: 'hands',
    name: 'Hands',
    region: 'skin',
    aliases: ['hand area', 'back of hands'],
  },
  {
    id: 'scalp',
    name: 'Scalp',
    region: 'skin',
    aliases: ['head', 'hairline'],
  },
];

// ============================================================================
// CONCERNS
// ============================================================================

export type ConcernCategory =
  | 'aging'
  | 'skin_quality'
  | 'pigmentation'
  | 'vascular'
  | 'body_contouring'
  | 'hair';

export interface Concern {
  id: string;
  name: string;
  category: ConcernCategory;
  description: string;
  aliases: string[];
  relatedAreas: string[];
}

export const globalConcerns: Concern[] = [
  // Aging Concerns
  {
    id: 'wrinkles',
    name: 'Wrinkles & Fine Lines',
    category: 'aging',
    description: 'Static and dynamic wrinkles, fine lines, and creases',
    aliases: ['lines', 'creases', 'fine lines', 'expression lines', 'dynamic wrinkles'],
    relatedAreas: ['forehead', 'periorbital', 'lips', 'nasolabial', 'marionette'],
  },
  {
    id: 'volume_loss',
    name: 'Volume Loss',
    category: 'aging',
    description: 'Facial fat pad atrophy and hollowing',
    aliases: ['hollowing', 'deflation', 'sunken', 'gaunt', 'facial wasting'],
    relatedAreas: ['cheeks', 'temples', 'lips', 'chin', 'hands'],
  },
  {
    id: 'skin_laxity',
    name: 'Skin Laxity',
    category: 'aging',
    description: 'Loss of skin elasticity and firmness',
    aliases: ['sagging', 'drooping', 'loose skin', 'crepey skin'],
    relatedAreas: ['cheeks', 'neck', 'jawline', 'arms', 'abdomen'],
  },
  {
    id: 'jowls',
    name: 'Jowls',
    category: 'aging',
    description: 'Sagging skin along the jawline',
    aliases: ['jowling', 'jawline sagging'],
    relatedAreas: ['jawline', 'chin'],
  },
  {
    id: 'neck_bands',
    name: 'Neck Bands',
    category: 'aging',
    description: 'Platysmal bands and neck laxity',
    aliases: ['platysmal bands', 'turkey neck', 'neck lines'],
    relatedAreas: ['neck'],
  },
  {
    id: 'thin_lips',
    name: 'Thin Lips',
    category: 'aging',
    description: 'Loss of lip volume and definition',
    aliases: ['lip thinning', 'deflated lips', 'flat lips'],
    relatedAreas: ['lips'],
  },

  // Skin Quality Concerns
  {
    id: 'acne',
    name: 'Acne & Acne Scarring',
    category: 'skin_quality',
    description: 'Active acne and post-acne scarring',
    aliases: ['breakouts', 'pimples', 'blemishes', 'acne scars', 'ice pick scars', 'boxcar scars'],
    relatedAreas: ['full_face', 'back', 'chest'],
  },
  {
    id: 'texture',
    name: 'Skin Texture',
    category: 'skin_quality',
    description: 'Rough, uneven, or bumpy skin texture',
    aliases: ['rough skin', 'bumpy skin', 'uneven texture', 'keratosis pilaris'],
    relatedAreas: ['full_face', 'arms'],
  },
  {
    id: 'pores',
    name: 'Enlarged Pores',
    category: 'skin_quality',
    description: 'Visible, enlarged, or congested pores',
    aliases: ['large pores', 'open pores', 'congested pores', 'blackheads'],
    relatedAreas: ['nose', 'cheeks', 'chin'],
  },
  {
    id: 'dullness',
    name: 'Dull Skin',
    category: 'skin_quality',
    description: 'Lack of radiance and glow',
    aliases: ['dull complexion', 'lackluster skin', 'tired skin', 'sallow'],
    relatedAreas: ['full_face'],
  },
  {
    id: 'dehydration',
    name: 'Dehydration',
    category: 'skin_quality',
    description: 'Lack of skin hydration and moisture',
    aliases: ['dry skin', 'dehydrated skin', 'flaky skin', 'tight skin'],
    relatedAreas: ['full_face', 'hands', 'decolletage'],
  },
  {
    id: 'oily_skin',
    name: 'Oily Skin',
    category: 'skin_quality',
    description: 'Excess sebum production',
    aliases: ['shiny skin', 'greasy skin', 'sebaceous'],
    relatedAreas: ['full_face', 'nose', 'forehead'],
  },

  // Pigmentation Concerns
  {
    id: 'sun_damage',
    name: 'Sun Damage',
    category: 'pigmentation',
    description: 'UV-induced skin changes and photodamage',
    aliases: ['photodamage', 'sun spots', 'solar damage'],
    relatedAreas: ['full_face', 'decolletage', 'hands'],
  },
  {
    id: 'melasma',
    name: 'Melasma',
    category: 'pigmentation',
    description: 'Hormone-related hyperpigmentation patches',
    aliases: ['pregnancy mask', 'chloasma', 'hormone spots'],
    relatedAreas: ['cheeks', 'forehead', 'lips'],
  },
  {
    id: 'age_spots',
    name: 'Age Spots',
    category: 'pigmentation',
    description: 'Lentigines and liver spots',
    aliases: ['liver spots', 'brown spots', 'lentigines', 'dark spots'],
    relatedAreas: ['full_face', 'hands', 'decolletage'],
  },
  {
    id: 'uneven_tone',
    name: 'Uneven Skin Tone',
    category: 'pigmentation',
    description: 'Irregular skin coloration and discoloration',
    aliases: ['discoloration', 'blotchy skin', 'hyperpigmentation', 'PIH'],
    relatedAreas: ['full_face'],
  },
  {
    id: 'dark_circles',
    name: 'Dark Circles',
    category: 'pigmentation',
    description: 'Periorbital hyperpigmentation',
    aliases: ['under eye circles', 'dark under eyes', 'periorbital darkening'],
    relatedAreas: ['periorbital'],
  },

  // Vascular Concerns
  {
    id: 'redness',
    name: 'Facial Redness',
    category: 'vascular',
    description: 'General facial erythema and flushing',
    aliases: ['flushing', 'erythema', 'red face', 'blotchy redness'],
    relatedAreas: ['cheeks', 'nose', 'full_face'],
  },
  {
    id: 'rosacea',
    name: 'Rosacea',
    category: 'vascular',
    description: 'Chronic facial redness with flushing',
    aliases: ['acne rosacea', 'facial rosacea'],
    relatedAreas: ['cheeks', 'nose', 'chin', 'forehead'],
  },
  {
    id: 'spider_veins',
    name: 'Spider Veins',
    category: 'vascular',
    description: 'Visible small blood vessels',
    aliases: ['telangiectasia', 'broken capillaries', 'thread veins'],
    relatedAreas: ['nose', 'cheeks', 'thighs'],
  },
  {
    id: 'broken_capillaries',
    name: 'Broken Capillaries',
    category: 'vascular',
    description: 'Dilated or damaged small blood vessels',
    aliases: ['capillary damage', 'facial veins'],
    relatedAreas: ['nose', 'cheeks'],
  },

  // Body Contouring Concerns
  {
    id: 'stubborn_fat',
    name: 'Stubborn Fat',
    category: 'body_contouring',
    description: 'Diet and exercise resistant fat deposits',
    aliases: ['fat pockets', 'bulges', 'resistant fat', 'localized fat'],
    relatedAreas: ['abdomen', 'flanks', 'thighs', 'arms', 'chin'],
  },
  {
    id: 'cellulite',
    name: 'Cellulite',
    category: 'body_contouring',
    description: 'Dimpled skin appearance',
    aliases: ['orange peel', 'cottage cheese skin', 'dimpling'],
    relatedAreas: ['thighs', 'buttocks', 'abdomen'],
  },
  {
    id: 'body_laxity',
    name: 'Body Skin Laxity',
    category: 'body_contouring',
    description: 'Loose or sagging body skin',
    aliases: ['loose body skin', 'post-weight loss skin'],
    relatedAreas: ['abdomen', 'arms', 'thighs'],
  },
  {
    id: 'muscle_definition',
    name: 'Muscle Definition',
    category: 'body_contouring',
    description: 'Desire for improved muscle tone and definition',
    aliases: ['muscle tone', 'toning', 'sculpting', 'body sculpting'],
    relatedAreas: ['abdomen', 'buttocks', 'arms', 'thighs'],
  },
  {
    id: 'double_chin',
    name: 'Double Chin',
    category: 'body_contouring',
    description: 'Submental fullness and fat',
    aliases: ['submental fat', 'chin fat', 'neck fat'],
    relatedAreas: ['chin', 'neck'],
  },

  // Hair Concerns
  {
    id: 'hair_loss',
    name: 'Hair Loss',
    category: 'hair',
    description: 'Thinning hair or hair loss',
    aliases: ['thinning hair', 'alopecia', 'balding', 'receding hairline'],
    relatedAreas: ['scalp'],
  },
  {
    id: 'unwanted_hair',
    name: 'Unwanted Hair',
    category: 'hair',
    description: 'Excess or unwanted body/facial hair',
    aliases: ['excess hair', 'facial hair', 'body hair', 'hirsutism'],
    relatedAreas: ['full_face', 'lips', 'chin', 'arms', 'thighs', 'back'],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getAnatomyAreasByRegion(region: AnatomyRegion): AnatomyArea[] {
  return globalAnatomyAreas.filter((area) => area.region === region);
}

export function getConcernsByCategory(category: ConcernCategory): Concern[] {
  return globalConcerns.filter((concern) => concern.category === category);
}

export function getAnatomyAreaById(id: string): AnatomyArea | undefined {
  return globalAnatomyAreas.find((area) => area.id === id);
}

export function getConcernById(id: string): Concern | undefined {
  return globalConcerns.find((concern) => concern.id === id);
}

export const anatomyRegionLabels: Record<AnatomyRegion, string> = {
  face: 'Face',
  body: 'Body',
  skin: 'Skin',
};

export const concernCategoryLabels: Record<ConcernCategory, string> = {
  aging: 'Aging',
  skin_quality: 'Skin Quality',
  pigmentation: 'Pigmentation',
  vascular: 'Vascular',
  body_contouring: 'Body Contouring',
  hair: 'Hair',
};
