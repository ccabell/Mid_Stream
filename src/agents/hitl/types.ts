/**
 * HITL Agent Types
 *
 * Types specific to the HITL verification workflow.
 * Aligned with A360 production patterns for version control,
 * edit tracking, and clinical review gating.
 */

import type {
  ExtractionOutput,
  HITLVerifiedOutput,
  TCPSettings,
  Objection,
  Hesitation,
  Concern,
} from '../types';

// ============================================================================
// EDIT TRACKING (Production Pattern)
// ============================================================================

/**
 * Types of edits that can be made during HITL verification.
 * Aligned with production ai_output_manual_edits model.
 */
export type EditType =
  | 'CONTENT_MODIFICATION'   // General content edit
  | 'CLINICAL_CORRECTION'    // Provider correction of clinical info
  | 'FORMATTING_ADJUSTMENT'  // Style/format changes
  | 'ERROR_CORRECTION'       // Fixing extraction errors
  | 'ADDITION'               // Adding new content
  | 'DELETION'               // Removing content
  | 'REORDER'                // Changing order/priority
  | 'VERIFICATION';          // Marking as verified without changes

/**
 * A single edit record for audit trail
 */
export interface EditRecord {
  id: string;
  timestamp: string;
  editType: EditType;
  section: string;
  fieldPath: string;
  previousValue: unknown;
  newValue: unknown;
  expertId: string;
  expertName: string;
  reason?: string;
}

/**
 * Version metadata for conflict detection
 */
export interface VersionInfo {
  version: number;
  lastModified: string;
  lastModifiedBy: string;
  checksum?: string;
}

/**
 * Expert attribution for edits
 */
export interface ExpertInfo {
  id: string;
  name: string;
  role: 'provider' | 'staff' | 'admin';
  clinicalCredentials?: string;
}

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

  // === Production Patterns ===

  /** Version info for conflict detection */
  versionInfo: VersionInfo | null;

  /** Edit history for audit trail */
  editHistory: EditRecord[];

  /** Current expert making edits */
  currentExpert: ExpertInfo | null;

  /** Whether clinical review is required before TCP generation */
  clinicalReviewRequired: boolean;

  /** Whether clinical review has been completed */
  clinicalReviewCompleted: boolean;

  /** ID of clinician who completed review */
  clinicalReviewedBy: string | null;

  /** Timestamp of clinical review */
  clinicalReviewedAt: string | null;

  /** Conflict state - set when version mismatch detected */
  conflictState: ConflictState | null;
}

/**
 * State when a version conflict is detected (409 response)
 */
export interface ConflictState {
  serverVersion: number;
  localVersion: number;
  serverLastModified: string;
  serverLastModifiedBy: string;
  message: string;
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
  /** Initialize HITL from API analysis (recommended - uses AI + practice library) */
  initFromApi: (runId: string, practiceId?: string) => Promise<void>;

  /** Initialize HITL from extraction output (client-side fallback) */
  initFromExtraction: (extraction: ExtractionOutput, practiceId: string, runId?: string) => void;

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

  /** Submit and generate HITL output (local only) */
  submit: () => HITLVerifiedOutput | null;

  /** Save HITL verification to the run via API */
  saveToRun: (verifiedBy: string, promptName?: string) => Promise<{ success: boolean; error?: string }>;

  /** Reset state */
  reset: () => void;

  /** Go to step */
  goToStep: (step: HITLStep) => void;

  // === Production Pattern Actions ===

  /** Set the current expert making edits */
  setCurrentExpert: (expert: ExpertInfo) => void;

  /** Complete clinical review */
  completeClinicalReview: (reviewerId: string) => void;

  /** Handle version conflict - reload server data */
  resolveConflict: (strategy: 'reload' | 'force') => Promise<void>;

  /** Get edit history for audit */
  getEditHistory: () => EditRecord[];

  /** Check if save would cause conflict (optimistic locking) */
  checkForConflict: () => Promise<boolean>;
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
