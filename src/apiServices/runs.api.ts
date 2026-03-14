import { client } from './client';
import type { Run } from './types';
import type { HITLVerifiedOutput, RunHITLOutput } from '../agents/types';

// ============================================================================
// HITL API TYPES
// ============================================================================

export interface HITLSubmitRequest {
  prompt_name: string;
  practice_id?: string;
  verified_by: string;
  verified_output: HITLVerifiedOutput;
}

export interface HITLSubmitResponse {
  success: boolean;
  run_id: string;
  prompt_hitl: RunHITLOutput;
}

export interface HITLAnalyzeRequest {
  practice_id?: string;
}

export interface HITLAnalyzeResponse {
  run_id: string;
  practice_id?: string;
  success?: boolean;
  parse_error?: string;
  verification_questions: HITLVerificationQuestion[];
  draft: HITLVerificationDraft;
  library_files_loaded?: number;
}

export interface HITLVerificationQuestion {
  id: string;
  section: string;
  question: string;
  type: 'confirm' | 'select' | 'edit' | 'multi_select';
  options?: { label: string; value: string }[];
  default_value?: unknown;
  required: boolean;
}

export interface HITLVerificationDraft {
  consultation_summary: {
    one_liner: string;
    visit_type: string;
    outcome_status: string;
  };
  patient_voice: {
    primary_concern: string;
    secondary_concerns: string[];
    goals: string[];
    expectations: string[];
  };
  treatment_plan_today: Array<{
    name: string;
    area: string;
    details: string;
    price_display?: string;
    include: boolean;
  }>;
  additional_recommendations: Array<{
    name: string;
    type: string;
    rationale: string;
    priority_score: number;
    action: 'include' | 'future' | 'dismissed' | null;
  }>;
  objections_hesitations_concerns: Array<{
    type: 'objection' | 'hesitation' | 'concern';
    statement: string;
    status: 'resolved' | 'partially_resolved' | 'unresolved';
    suggested_response?: string;
  }>;
  visit_checklist: Array<{
    category: string;
    items: Array<{
      item_id: string;
      item_label: string;
      completed: boolean | null;
      critical: boolean;
    }>;
  }>;
}

// ============================================================================
// RUNS API
// ============================================================================

export const runsApi = {
  list: (params?: { transcript_id?: string; limit?: number; offset?: number }) =>
    client
      .get<{ data: Run[]; total: number } | Run[]>('/runs', { params })
      .then((r) => {
        const d = r.data;
        return Array.isArray(d) ? d : (d as { data: Run[] }).data ?? [];
      }),

  getById: (runId: string) =>
    client.get<Run>(`/runs/${runId}`).then((r) => r.data),

  getNeighbors: (runId: string) =>
    client
      .get<{ prev_run_id: string | null; next_run_id: string | null }>(
        `/runs/neighbors?run_id=${encodeURIComponent(runId)}`
      )
      .then((r) => r.data),

  update: (
    runId: string,
    body: { notes?: string | null; hitl_feedback?: Record<string, string> }
  ) => client.patch<Run>(`/runs/${runId}`, body).then((r) => r.data),

  // ============================================================================
  // HITL ENDPOINTS
  // ============================================================================

  /**
   * Get HITL output for a run (if it exists)
   */
  getHITL: (runId: string) =>
    client.get<RunHITLOutput | null>(`/runs/${runId}/hitl`).then((r) => r.data),

  /**
   * Submit HITL verification output
   */
  saveHITL: (runId: string, data: HITLSubmitRequest) =>
    client.post<HITLSubmitResponse>(`/runs/${runId}/hitl`, data).then((r) => r.data),

  /**
   * Analyze extraction and generate HITL verification questions/draft
   * Uses the HITL prompt with practice library context
   */
  analyzeForHITL: (runId: string, data?: HITLAnalyzeRequest) =>
    client.post<HITLAnalyzeResponse>(`/runs/${runId}/hitl/analyze`, data ?? {}).then((r) => r.data),
};
