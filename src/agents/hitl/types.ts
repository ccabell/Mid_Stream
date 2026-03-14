/**
 * HITL Agent Types
 *
 * Types specific to the HITL verification workflow.
 */

import type {
  ExtractionOutput,
  HITLVerifiedOutput,
  VerifiedTreatment,
  VerifiedRecommendation,
  VerifiedObjection,
  VerifiedHesitation,
  VerifiedConcern,
  VerifiedChecklistItem,
  TCPSettings,
  Offering,
  Objection,
  Hesitation,
  Concern,
} from '../types';

// ============================================================================
// HITL STATE
// ============================================================================

export interface HITLState {
  /** Current step in the verification flow */
  currentStep: HITLStep;

  /** Loading state */
  loading: boolean;

  /** Error message if any */
  error: string | null;

  /** Working draft of verified data */
  draft: HITLDraft | null;

  /** Whether any changes have been made */
  isDirty: boolean;

  /** Validation errors */
  validationErrors: ValidationError[];
}

export type HITLStep =
  | 'loading'
  | 'patient_summary'
  | 'treatments'
  | 'recommendations'
  | 'needs_attention'
  | 'checklist'
  | 'review'
  | 'complete';

export interface ValidationError {
  section: HITLStep;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

// ============================================================================
// HITL DRAFT (Working State)
// ============================================================================

export interface HITLDraft {
  /** Patient summary with verification status */
  patientSummary: PatientSummaryDraft;

  /** Today's treatments */
  treatments: TreatmentDraft[];

  /** AI recommendations with actions */
  recommendations: RecommendationDraft[];

  /** Items needing attention */
  needsAttention: NeedsAttentionDraft;

  /** Visit checklist */
  checklist: ChecklistDraft;

  /** TCP generation settings */
  settings: TCPSettings;
}

export interface PatientSummaryDraft {
  primaryConcern: VerifiableField<string>;
  secondaryConcerns: VerifiableField<string>[];
  goals: VerifiableField<string>[];
  anticipatedOutcomes: string[];
  timeline: {
    event: string | null;
    timeframe: string | null;
    urgency: 'high' | 'medium' | 'low';
  };
}

export interface VerifiableField<T> {
  value: T;
  original: T;
  verified: boolean;
  edited: boolean;
}

export interface TreatmentDraft {
  id: string;
  name: string;
  area: string;
  details: string;
  cost: string;
  status: 'performed' | 'scheduled' | 'agreed';
  included: boolean;
  source: 'extraction' | 'manual';
}

export interface RecommendationDraft {
  id: string;
  name: string;
  type: 'service' | 'product' | 'package';
  rationale: string;
  priorityScore: number;
  tier: 1 | 2 | 3 | 4;
  patientReception: string | null;
  action: 'include' | 'future' | 'dismissed' | null;
  scores: {
    patientBenefit: number;
    clinicalViability: number;
    practiceValue: number;
  };
  talkingPoints: string[];
  synergies: string[];
}

export interface NeedsAttentionDraft {
  objections: ObjectionDraft[];
  hesitations: HesitationDraft[];
  concerns: ConcernDraft[];
}

export interface ObjectionDraft extends Objection {
  id: string;
  status: 'resolved' | 'partially_resolved' | 'unresolved';
  suggestedResponse: string | null;
  suggestedResponseLoading: boolean;
  notes: string;
}

export interface HesitationDraft extends Hesitation {
  id: string;
  status: 'resolved' | 'partially_resolved' | 'unresolved';
  notes: string;
}

export interface ConcernDraft extends Concern {
  id: string;
  status: 'addressed' | 'acknowledged' | 'unaddressed';
  notes: string;
}

export interface ChecklistDraft {
  items: ChecklistItemDraft[];
  completionRate: number;
  criticalItemsComplete: boolean;
}

export interface ChecklistItemDraft {
  itemId: string;
  itemLabel: string;
  category: 'safety' | 'clinical' | 'education' | 'closing';
  completed: boolean | null;
  critical: boolean;
  evidence: string | null;
  manuallyChecked: boolean;
}

// ============================================================================
// ACTIONS
// ============================================================================

export interface HITLActions {
  /** Initialize HITL from extraction output */
  initFromExtraction: (extraction: ExtractionOutput, practiceId: string) => void;

  /** Update patient summary field */
  updatePatientSummary: (field: keyof PatientSummaryDraft, value: unknown) => void;

  /** Verify a field */
  verifyField: (section: string, fieldPath: string) => void;

  /** Verify all fields in a section */
  verifyAllInSection: (section: string) => void;

  /** Update treatment */
  updateTreatment: (id: string, updates: Partial<TreatmentDraft>) => void;

  /** Add manual treatment */
  addTreatment: (treatment: Omit<TreatmentDraft, 'id' | 'source'>) => void;

  /** Remove treatment */
  removeTreatment: (id: string) => void;

  /** Set recommendation action */
  setRecommendationAction: (id: string, action: RecommendationDraft['action']) => void;

  /** Update objection status */
  updateObjectionStatus: (id: string, status: ObjectionDraft['status']) => void;

  /** Request suggested response for objection */
  requestSuggestedResponse: (id: string) => Promise<void>;

  /** Update hesitation status */
  updateHesitationStatus: (id: string, status: HesitationDraft['status']) => void;

  /** Update concern status */
  updateConcernStatus: (id: string, status: ConcernDraft['status']) => void;

  /** Toggle checklist item */
  toggleChecklistItem: (itemId: string) => void;

  /** Update TCP settings */
  updateSettings: (settings: Partial<TCPSettings>) => void;

  /** Validate current state */
  validate: () => ValidationError[];

  /** Submit and generate HITL output */
  submit: () => HITLVerifiedOutput | null;

  /** Reset state */
  reset: () => void;

  /** Go to step */
  goToStep: (step: HITLStep) => void;
}

// ============================================================================
// OBJECTION TYPES (for icons and display)
// ============================================================================

export const OBJECTION_ICONS: Record<Objection['type'], string> = {
  price: '💲',
  timing: '⏰',
  fear: '😰',
  partner: '👥',
  results: '🎯',
  trust: '🤝',
  other: '❓',
};

export const OBJECTION_LABELS: Record<Objection['type'], string> = {
  price: 'Price Objection',
  timing: 'Timing Objection',
  fear: 'Fear/Anxiety',
  partner: 'Partner Consultation',
  results: 'Results Concern',
  trust: 'Trust Issue',
  other: 'Other Objection',
};

// ============================================================================
// COMMITMENT LEVEL DISPLAY
// ============================================================================

export const COMMITMENT_COLORS: Record<string, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
  committed: 'success',
  interested: 'info',
  considering: 'warning',
  uncertain: 'warning',
  not_interested: 'error',
};

export const COMMITMENT_LABELS: Record<string, string> = {
  committed: 'Committed',
  interested: 'Interested',
  considering: 'Considering',
  uncertain: 'Uncertain',
  not_interested: 'Not Interested',
};
