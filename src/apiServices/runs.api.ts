import { client } from './client';
import type { Run } from './types';
import type { HITLVerifiedOutput, RunHITLOutput } from '../agents/types';

// ============================================================================
// VERSION CONTROL TYPES (Production Pattern)
// ============================================================================

export interface VersionInfo {
  version: number;
  lastModified: string;
  lastModifiedBy: string;
  checksum?: string;
}

export interface ConflictError {
  status: 409;
  message: string;
  serverVersion: number;
  localVersion: number;
  serverLastModified: string;
  serverLastModifiedBy: string;
}

export interface HITLVersionedResponse {
  version: number;
  lastModified: string;
  lastModifiedBy: string;
}

// ============================================================================
// HITL API TYPES
// ============================================================================

export interface HITLSubmitRequest {
  prompt_name: string;
  practice_id?: string;
  verified_by: string;
  verified_output: HITLVerifiedOutput;
  // Production pattern: version for conflict detection
  expected_version?: number;
  expert_id?: string;
  edit_history?: Array<{
    edit_type: string;
    section: string;
    field_path: string;
    timestamp: string;
  }>;
}

export interface HITLSubmitResponse {
  success: boolean;
  run_id: string;
  prompt_hitl: RunHITLOutput;
  // Production pattern: version info in response
  version?: number;
  lastModified?: string;
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
   * Get current HITL version info for conflict detection
   */
  getHITLVersion: (runId: string) =>
    client.get<HITLVersionedResponse>(`/runs/${runId}/hitl/version`).then((r) => r.data),

  /**
   * Submit HITL verification output with version control
   * Throws ConflictError (409) if version mismatch detected
   */
  saveHITL: async (
    runId: string,
    data: HITLSubmitRequest,
    options?: { expertId?: string; expectedVersion?: number }
  ): Promise<HITLSubmitResponse> => {
    const headers: Record<string, string> = {};

    // Production pattern: Add expert attribution header
    if (options?.expertId) {
      headers['X-Expert-Id'] = options.expertId;
    }

    // Production pattern: Add version header for conflict detection
    if (options?.expectedVersion !== undefined) {
      headers['If-Match'] = `"${options.expectedVersion}"`;
    }

    try {
      const response = await client.post<HITLSubmitResponse>(
        `/runs/${runId}/hitl`,
        {
          ...data,
          expected_version: options?.expectedVersion,
          expert_id: options?.expertId,
        },
        { headers }
      );
      return response.data;
    } catch (error: unknown) {
      // Check for version conflict (409)
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        (error as { response?: { status?: number } }).response?.status === 409
      ) {
        const conflictData = (error as { response?: { data?: ConflictError } }).response?.data;
        const conflictError = new Error(conflictData?.message || 'Version conflict detected') as Error & ConflictError;
        conflictError.status = 409;
        conflictError.serverVersion = conflictData?.serverVersion ?? 0;
        conflictError.localVersion = conflictData?.localVersion ?? 0;
        conflictError.serverLastModified = conflictData?.serverLastModified ?? '';
        conflictError.serverLastModifiedBy = conflictData?.serverLastModifiedBy ?? '';
        throw conflictError;
      }
      throw error;
    }
  },

  /**
   * Analyze extraction and generate HITL verification questions/draft
   * Uses the HITL prompt with practice library context
   */
  analyzeForHITL: (runId: string, data?: HITLAnalyzeRequest) =>
    client.post<HITLAnalyzeResponse>(`/runs/${runId}/hitl/analyze`, data ?? {}).then((r) => r.data),
};
