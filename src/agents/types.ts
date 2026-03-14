/**
 * Shared Agent Interface Types
 *
 * All agents must implement these interfaces to ensure consistency
 * and enable the agent registry system.
 */

import type { ComponentType } from 'react';

// ============================================================================
// AGENT MODULE INTERFACE
// ============================================================================

export interface AgentModule {
  /** Unique identifier for this agent (e.g., 'hitl_verification') */
  id: string;

  /** Human-readable display name */
  name: string;

  /** Brief description of what this agent does */
  description: string;

  /** Semantic version (e.g., '1.0.0') */
  version: string;

  /** What type of input this agent requires */
  inputType: AgentInputType;

  /** Specific fields required from the input */
  requiredFields: string[];

  /** What this agent can do */
  capabilities: AgentCapabilities;

  /** Icon name from MUI icons (optional) */
  icon?: string;

  /** Category for grouping in UI */
  category?: AgentCategory;

  /** The main page component */
  Page: ComponentType<AgentPageProps>;
}

export type AgentInputType =
  | 'extraction_output'    // Raw Pass 1 + Pass 2 extraction
  | 'hitl_verified'        // HITL-verified data (from HITL agent)
  | 'tcp_output'           // TCP document (from TCP agent)
  | 'practice_library'     // Practice library data
  | 'custom';              // Custom input type

export type AgentCategory =
  | 'extraction'           // Works directly with extraction output
  | 'verification'         // Verification/HITL agents
  | 'generation'           // Generates documents (TCP, emails)
  | 'management'           // Management UIs (practice library)
  | 'analytics';           // Analytics/reporting agents

export interface AgentCapabilities {
  /** Can be accessed directly via /agents/{id} */
  canRunStandalone: boolean;

  /** Can be invoked from the RunDetail page */
  canRunFromRunDetail: boolean;

  /** Can be exported as a standalone deployable app */
  canBeShared: boolean;

  /** Requires practice library data to function */
  requiresPracticeLibrary?: boolean;

  /** Can chain to other agents */
  chainableOutputs?: string[];  // IDs of agents that can consume this output
}

// ============================================================================
// AGENT PAGE PROPS
// ============================================================================

export interface AgentPageProps {
  /** Run ID if invoked from a specific run */
  runId?: string;

  /** Pre-loaded extraction output (optimization) */
  extractionOutput?: ExtractionOutput;

  /** Pre-loaded HITL output (for chained agents) */
  hitlOutput?: HITLVerifiedOutput;

  /** Practice ID for context */
  practiceId?: string;

  /** Callback when agent completes successfully */
  onComplete?: (result: AgentOutput) => void;

  /** Callback when user cancels */
  onCancel?: () => void;

  /** Whether this is embedded in another page (affects layout) */
  embedded?: boolean;
}

// ============================================================================
// EXTRACTION OUTPUT (Input for most agents)
// ============================================================================

export interface ExtractionOutput {
  prompt_1: {
    parsed_json: Pass1Output;
    raw_response?: string;
  };
  prompt_2: {
    parsed_json: Pass2Output;
    raw_response?: string;
  };
}

export interface Pass1Output {
  extraction_version: '3.0';
  pass: 1;
  visit_context: {
    visit_type: VisitType;
    reason_for_visit: string;
    referred_by: string | null;
    motivating_event: string | null;
  };
  patient_goals: {
    primary_concern: string;
    secondary_concerns: string[];
    goals: string[];
    anticipated_outcomes: string[];
  };
  areas: {
    treatment_areas: string[];
    concern_areas: string[];
  };
  interests: {
    stated_interests: string[];
    future_interests: FutureInterest[];
  };
  offerings: Offering[];
}

export interface Pass2Output {
  extraction_version: '3.0';
  pass: 2;
  outcome: {
    status: OutcomeStatus;
    summary: string;
  };
  next_steps: NextStep[];
  patient_signals: {
    commitment_level: CommitmentLevel;
  };
  objections: Objection[];
  hesitations: Hesitation[];
  concerns: Concern[];
  visit_checklist: ChecklistItem[];
}

// ============================================================================
// SHARED TYPES
// ============================================================================

export type VisitType =
  | 'initial_consultation'
  | 'follow_up'
  | 'procedure'
  | 'treatment_visit'
  | 'consultation_only'
  | 'unknown';

export type OutcomeStatus =
  | 'treatment_performed'
  | 'booked'
  | 'agreed_pending_scheduling'
  | 'thinking'
  | 'follow_up_requested'
  | 'declined'
  | 'information_only';

export type CommitmentLevel =
  | 'committed'
  | 'interested'
  | 'considering'
  | 'uncertain'
  | 'not_interested';

export interface FutureInterest {
  interest: string;
  interest_level: 'high' | 'medium' | 'low' | null;
  evidence: string;
}

export interface Offering {
  name: string;
  type: 'product' | 'service' | 'package';
  disposition: 'performed' | 'scheduled' | 'discussed' | 'recommended' | 'mentioned';
  area: string | null;
  quantity: string | null;
  value: number | null;
  guidance_discovery: GuidanceDiscovery;
}

export interface GuidanceDiscovery {
  provider_guided: boolean;
  guidance_type: 'enhancement' | 'complementary' | 'bundled' | 'maintenance' | 'adjunctive' | null;
  patient_reception: 'engaged' | 'curious' | 'hesitant' | 'passed' | 'unexplored' | null;
  reception_evidence: string | null;
  guidance_rationale: 'concern_alignment' | 'treatment_synergy' | 'value_creation' | 'timing_opportunity' | null;
}

export interface NextStep {
  action: string;
  timeframe: string | null;
  owner: 'patient' | 'staff' | 'provider' | null;
}

export interface Objection {
  id?: string;
  type: 'price' | 'timing' | 'fear' | 'partner' | 'results' | 'trust' | 'other';
  statement: string;
  resolved: boolean | null;
  resolution_approach: string | null;
}

export interface Hesitation {
  id?: string;
  topic: string;
  statement: string;
  resolved: boolean | null;
  resolution_approach: string | null;
}

export interface Concern {
  id?: string;
  concern: string;
  raised_by: 'patient' | 'provider';
  category: 'clinical' | 'practical' | 'safety' | 'financial' | 'other';
  addressed: boolean | null;
  response: string | null;
}

export interface ChecklistItem {
  item_id: string;
  item_label: string;
  category: 'safety' | 'clinical' | 'education' | 'closing';
  completed: boolean | null;
  critical: boolean;
  evidence: string | null;
}

// ============================================================================
// HITL VERIFIED OUTPUT (Output of HITL agent, input for TCP agent)
// ============================================================================

export interface HITLVerifiedOutput {
  verified_at: string;
  verified_by: string;

  patient_summary: {
    primary_concern: VerifiedItem<string>;
    secondary_concerns: VerifiedItem<string>[];
    goals: VerifiedItem<string>[];
    timeline: {
      event: string | null;
      timeframe: string | null;
      urgency: 'high' | 'medium' | 'low';
    };
  };

  todays_treatments: VerifiedTreatment[];
  recommendations: VerifiedRecommendation[];

  needs_attention: {
    objections: VerifiedObjection[];
    hesitations: VerifiedHesitation[];
    concerns: VerifiedConcern[];
  };

  checklist: {
    completion_rate: number;
    critical_items_complete: boolean;
    items: VerifiedChecklistItem[];
  };

  settings: TCPSettings;
}

export interface VerifiedItem<T> {
  value: T;
  verified: boolean;
  edited?: boolean;
  original?: T;
}

export interface VerifiedTreatment {
  id: string;
  name: string;
  area: string;
  details: string;
  cost: string;
  status: 'performed' | 'scheduled' | 'agreed';
  included: boolean;
}

export interface VerifiedRecommendation {
  id: string;
  name: string;
  type: 'service' | 'product' | 'package';
  rationale: string;
  action: 'include' | 'future' | 'dismissed' | null;
  included: boolean;
}

export interface VerifiedObjection extends Objection {
  status: 'resolved' | 'partially_resolved' | 'unresolved';
  suggested_response?: string;
}

export interface VerifiedHesitation extends Hesitation {
  status: 'resolved' | 'partially_resolved' | 'unresolved';
}

export interface VerifiedConcern extends Concern {
  status: 'addressed' | 'acknowledged' | 'unaddressed';
}

export interface VerifiedChecklistItem extends ChecklistItem {
  manually_checked?: boolean;
}

export interface TCPSettings {
  language: string;
  language_level: 'Plain' | 'Standard' | 'Expert';
  perspective: 'First Person' | 'Second Person' | 'Third Person';
  include_pricing: boolean;
  include_future: boolean;
}

// ============================================================================
// AGENT OUTPUT (Generic output wrapper)
// ============================================================================

export interface AgentOutput {
  agent_id: string;
  run_id: string;
  input_ref?: string;  // Reference to input (e.g., HITL output ID for TCP)
  output: object;
  status: 'completed' | 'partial' | 'failed';
  created_at: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// PRACTICE LIBRARY TYPES
// ============================================================================

export interface PracticeLibrary {
  practice_id: string;
  practice_name: string;
  offerings: PracticeOffering[];
  concerns: PracticeConcern[];
  checklists: PracticeChecklist[];
  suggestion_rules?: string;  // Markdown content
  settings: PracticeSettings;
}

export interface PracticeOffering {
  id: string;
  name: string;
  type: 'service' | 'product' | 'package';
  category: string;
  price: number | null;
  price_display: string | null;
  concerns_addressed: string[];
  synergies: string[];
  suggest_when: string[];
  education_url?: string;
}

export interface PracticeConcern {
  id: string;
  label: string;
  category: string;
  aliases: string[];
  related_offerings: string[];
}

export interface PracticeChecklist {
  visit_type: VisitType;
  items: {
    item_id: string;
    item_order: number;
    item_label: string;
    category: 'safety' | 'clinical' | 'education' | 'closing';
    critical: boolean;
  }[];
}

export interface PracticeSettings {
  include_pricing: boolean;
  pricing_display: 'exact' | 'range' | 'none';
  language_level: 'Plain' | 'Standard' | 'Expert';
  brand_voice?: string;
}

// ============================================================================
// PRACTICE LIBRARY - FLEXIBLE FILE-BASED SYSTEM
// ============================================================================

/**
 * Supported file types for practice library documents
 */
export type PracticeLibraryFileType = 'md' | 'json' | 'csv' | 'txt';

/**
 * Tags that describe what a file provides (for filtering)
 */
export type PracticeLibraryTag =
  | 'offerings'      // Products, services, packages
  | 'concerns'       // Patient concerns vocabulary
  | 'checklists'     // Visit checklists
  | 'suggestions'    // Suggestion rules
  | 'aftercare'      // Aftercare instructions
  | 'sales'          // Sales excellence guidance
  | 'pricing'        // Pricing information
  | 'education'      // Patient education content
  | 'protocols'      // Treatment protocols
  | 'templates'      // Document templates
  | 'reference';     // General reference material

/**
 * Reference to a practice library file
 */
export interface PracticeLibraryFile {
  /** Filename (e.g., "CaloSpa_Concerns.csv") */
  filename: string;

  /** File type */
  type: PracticeLibraryFileType;

  /** Relative path from practice library root */
  path: string;

  /** Human-readable description */
  description?: string;

  /** Tags describing what this file provides */
  tags?: PracticeLibraryTag[];

  /** Whether this is a shared file (applies to all practices) */
  shared?: boolean;
}

/**
 * Practice library manifest - lists all available files for a practice
 *
 * Each practice folder should have a manifest.json file listing its contents.
 * Shared files (in the root) are automatically available to all practices.
 */
export interface PracticeLibraryManifest {
  /** Practice identifier */
  practiceId: string;

  /** Display name */
  practiceName: string;

  /** Practice-specific files */
  files: PracticeLibraryFile[];

  /** Shared files to include (filenames from root practice-library folder) */
  includeShared?: string[];

  /** When this manifest was last updated */
  lastUpdated?: string;
}

/**
 * How agents request practice library data
 *
 * Agents can request files by:
 * - Specific filenames
 * - Tags (e.g., "concerns", "suggestions")
 * - Or request all files
 */
export interface PracticeLibraryRequest {
  /** Practice identifier */
  practiceId: string;

  /** Request specific files by filename */
  files?: string[];

  /** Request files by tag (e.g., ["concerns", "suggestions"]) */
  tags?: PracticeLibraryTag[];

  /** Include shared files (SALES_EXCELLENCE_REFERENCE.md, etc.) */
  includeShared?: boolean;

  /** Load all available files for this practice */
  loadAll?: boolean;
}

/**
 * A loaded file with its content
 */
export interface LoadedPracticeFile {
  /** Original filename */
  filename: string;

  /** File type */
  type: PracticeLibraryFileType;

  /** Raw content as string */
  content: string;

  /** For JSON files, the parsed object */
  parsed?: unknown;

  /** For CSV files, parsed rows */
  rows?: Record<string, string>[];

  /** Tags this file provides */
  tags?: PracticeLibraryTag[];

  /** Whether this is a shared file */
  shared?: boolean;

  /** Any error that occurred loading this file */
  error?: string;
}

/**
 * Loaded practice library data returned to agents
 */
export interface PracticeLibraryData {
  /** Practice identifier */
  practiceId: string;

  /** Display name */
  practiceName: string;

  /** All loaded files */
  files: LoadedPracticeFile[];

  /** Quick access: files indexed by filename */
  byFilename: Record<string, LoadedPracticeFile>;

  /** Quick access: files indexed by tag */
  byTag: Record<PracticeLibraryTag, LoadedPracticeFile[]>;

  /** Settings if available */
  settings?: PracticeSettings;
}

// ============================================================================
// PRACTICE LIBRARY - LEGACY STRUCTURED TYPES (for typed access)
// ============================================================================

/**
 * These types are still available for agents that want typed access
 * to specific data structures. The loader can parse JSON files into
 * these types when the structure matches.
 */

/**
 * Aftercare template by treatment category
 */
export interface AftercarePTemplate {
  category: string;
  immediate: string[];
  first_24_hours: string[];
  first_week: string[];
  avoid: string[];
}
