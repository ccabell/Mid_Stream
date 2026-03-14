/**
 * TCP (Treatment Care Plan) Agent Types
 *
 * Types for the TCP generation workflow.
 * Matches the production A360 TCP structure.
 */

// ============================================================================
// TCP CONTENT STRUCTURE (matches production)
// ============================================================================

export interface TreatmentCarePlan {
  /** Treatments for today's visit */
  immediate_intervention: ImmediateIntervention;

  /** Post-care instructions */
  post_care_instructions: string[];

  /** Goals and treatments for coming weeks */
  short_term_goals: ShortTermGoals;

  /** Long-term maintenance and routines */
  long_term_strategy: LongTermStrategy;

  /** Safety and coordination requirements */
  clinical_safety_protocols: ClinicalSafetyProtocols;
}

export interface ImmediateIntervention {
  focus: string;
  treatments: TreatmentItem[];
}

export interface TreatmentItem {
  id?: string;
  name: string;
  description: string;
  details: string;
  cost: string;
  area?: string;
  quantity?: string;
}

export interface ShortTermGoals {
  focus: string;
  treatments: TreatmentItem[];
  follow_up_schedule: FollowUpItem[];
}

export interface FollowUpItem {
  event: string;
  date: string;
  notes?: string;
}

export interface LongTermStrategy {
  focus: string;
  maintenance_schedule: MaintenanceItem[];
  skincare_routine: SkincareRoutine | null;
}

export interface MaintenanceItem {
  treatment: string;
  frequency: string;
  notes?: string;
}

export interface SkincareRoutine {
  morning: SkincareStep[];
  evening: SkincareStep[];
}

export interface SkincareStep {
  step: number;
  product: string;
  instructions: string;
  cost?: string;
}

export interface ClinicalSafetyProtocols {
  coordination_requirements: string[];
  safety_protocols: string[];
}

// ============================================================================
// TCP DOCUMENT (Full output)
// ============================================================================

/** Alias for TCPDocument used in editing contexts */
export type TCPDraft = TCPDocument;

export interface TCPDocument {
  /** Patient name */
  patient: string;

  /** Consultation date */
  consultation_date: string;

  /** Provider name */
  provider?: string;

  /** Practice name */
  practice_name?: string;

  /** The care plan content */
  treatment_care_plan: TreatmentCarePlan;

  /** Generation metadata */
  metadata?: {
    generated_at: string;
    generated_by: 'manual' | 'ai';
    source_run_id?: string;
    hitl_output_id?: string;
    version: number;
  };
}

// ============================================================================
// TCP STATE
// ============================================================================

export type TCPStep =
  | 'loading'
  | 'source_selection'  // Choose manual vs AI-generated
  | 'patient_info'      // Enter patient details (manual)
  | 'immediate'         // Immediate intervention
  | 'short_term'        // Short-term goals
  | 'long_term'         // Long-term strategy
  | 'safety'            // Safety protocols
  | 'review'            // Review before generating
  | 'preview'           // Preview generated TCP
  | 'complete';

export interface TCPState {
  /** Current step in the workflow */
  currentStep: TCPStep;

  /** Generation mode */
  mode: 'manual' | 'ai' | null;

  /** Loading state */
  loading: boolean;

  /** Error message */
  error: string | null;

  /** Working draft */
  draft: TCPDocument | null;

  /** Has unsaved changes */
  isDirty: boolean;

  /** Validation errors */
  validationErrors: TCPValidationError[];
}

export interface TCPValidationError {
  section: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

// ============================================================================
// TCP GENERATION OPTIONS
// ============================================================================

export interface TCPGenerationOptions {
  /** Include pricing in the TCP */
  include_pricing: boolean;

  /** Include future recommendations */
  include_future: boolean;

  /** Language for the document */
  language: string;

  /** Reading level */
  language_level: 'Plain' | 'Standard' | 'Expert';

  /** Narrative perspective */
  perspective: 'First Person' | 'Second Person' | 'Third Person';

  /** Include skincare routine */
  include_skincare: boolean;

  /** Include follow-up schedule */
  include_follow_up: boolean;
}

export const DEFAULT_TCP_OPTIONS: TCPGenerationOptions = {
  include_pricing: true,
  include_future: true,
  language: 'English',
  language_level: 'Standard',
  perspective: 'Second Person',
  include_skincare: true,
  include_follow_up: true,
};

// ============================================================================
// TCP ACTIONS
// ============================================================================

export interface TCPActions {
  /** Set generation mode */
  setMode: (mode: 'manual' | 'ai') => void;

  /** Initialize from HITL output (AI mode) */
  initFromHITL: (runId: string, practiceId?: string) => Promise<void>;

  /** Initialize empty draft (manual mode) */
  initManual: (patientName: string, consultationDate: string) => void;

  /** Update patient info */
  updatePatientInfo: (patient: string, date: string, provider?: string) => void;

  /** Update immediate intervention */
  updateImmediate: (data: Partial<ImmediateIntervention>) => void;

  /** Add/update/remove treatment */
  addTreatment: (section: 'immediate' | 'short_term', treatment: Omit<TreatmentItem, 'id'>) => void;
  updateTreatment: (section: 'immediate' | 'short_term', id: string, updates: Partial<TreatmentItem>) => void;
  removeTreatment: (section: 'immediate' | 'short_term', id: string) => void;

  /** Update post-care instructions */
  updatePostCare: (instructions: string[]) => void;
  addPostCareInstruction: (instruction: string) => void;
  removePostCareInstruction: (index: number) => void;

  /** Update short-term goals */
  updateShortTerm: (data: Partial<ShortTermGoals>) => void;

  /** Update follow-up schedule */
  addFollowUp: (item: FollowUpItem) => void;
  updateFollowUp: (index: number, item: FollowUpItem) => void;
  removeFollowUp: (index: number) => void;

  /** Update long-term strategy */
  updateLongTerm: (data: Partial<LongTermStrategy>) => void;

  /** Update maintenance schedule */
  addMaintenance: (item: MaintenanceItem) => void;
  updateMaintenance: (index: number, item: MaintenanceItem) => void;
  removeMaintenance: (index: number) => void;

  /** Update skincare routine */
  updateSkincare: (routine: SkincareRoutine | null) => void;

  /** Update safety protocols */
  updateSafety: (data: Partial<ClinicalSafetyProtocols>) => void;

  /** Navigation */
  goToStep: (step: TCPStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  /** Validation */
  validate: () => TCPValidationError[];

  /** Generate final TCP */
  generate: () => TCPDocument | null;

  /** Save TCP to run */
  saveToRun: (runId: string) => Promise<{ success: boolean; error?: string }>;

  /** Reset state */
  reset: () => void;
}

// ============================================================================
// DISPLAY HELPERS
// ============================================================================

export const STEP_LABELS: Record<TCPStep, string> = {
  loading: 'Loading',
  source_selection: 'Choose Source',
  patient_info: 'Patient Info',
  immediate: 'Immediate Intervention',
  short_term: 'Short-term Goals',
  long_term: 'Long-term Strategy',
  safety: 'Safety Protocols',
  review: 'Review',
  preview: 'Preview',
  complete: 'Complete',
};

export const MANUAL_STEPS: TCPStep[] = [
  'patient_info',
  'immediate',
  'short_term',
  'long_term',
  'safety',
  'review',
  'preview',
];

export const AI_STEPS: TCPStep[] = [
  'review',
  'preview',
];
