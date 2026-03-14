/**
 * HITL State Hook
 *
 * Manages the complete state for the HITL verification workflow.
 * Now supports both client-side transformation and API-based analysis.
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ExtractionOutput, HITLVerifiedOutput, TCPSettings } from '../../types';
import type {
  HITLState,
  HITLDraft,
  HITLStep,
  ValidationError,
  TreatmentDraft,
  RecommendationDraft,
  ObjectionDraft,
  HesitationDraft,
  ConcernDraft,
  PatientSummaryDraft,
} from '../types';
import { transformExtractionToHITLDraft, convertDraftToOutput } from '../utils/transformExtraction';
import { runsApi, type HITLAnalyzeResponse, type HITLVerificationDraft } from '../../../apiServices/runs.api';

const INITIAL_STATE: HITLState = {
  currentStep: 'loading',
  loading: false,
  error: null,
  draft: null,
  isDirty: false,
  validationErrors: [],
};

/**
 * Transform API response draft to local draft format
 */
function transformApiDraftToLocal(apiDraft: HITLVerificationDraft): HITLDraft {
  return {
    patientSummary: {
      primaryConcern: {
        value: apiDraft.patient_voice.primary_concern,
        original: apiDraft.patient_voice.primary_concern,
        verified: false,
        edited: false,
      },
      secondaryConcerns: apiDraft.patient_voice.secondary_concerns.map(c => ({
        value: c,
        original: c,
        verified: false,
        edited: false,
      })),
      goals: apiDraft.patient_voice.goals.map(g => ({
        value: g,
        original: g,
        verified: false,
        edited: false,
      })),
      anticipatedOutcomes: apiDraft.patient_voice.expectations,
      timeline: {
        event: null,
        timeframe: null,
        urgency: 'medium' as const,
      },
    },
    treatments: apiDraft.treatment_plan_today.map(t => ({
      id: uuidv4(),
      name: t.name,
      area: t.area,
      details: t.details,
      cost: t.price_display || '',
      status: 'performed' as const,
      included: t.include,
      source: 'extraction' as const,
    })),
    recommendations: apiDraft.additional_recommendations.map(r => ({
      id: uuidv4(),
      name: r.name,
      type: r.type as 'service' | 'product' | 'package',
      rationale: r.rationale,
      priorityScore: r.priority_score,
      tier: r.priority_score >= 80 ? 1 : r.priority_score >= 60 ? 2 : r.priority_score >= 40 ? 3 : 4,
      patientReception: null,
      action: r.action,
      scores: {
        patientBenefit: Math.round(r.priority_score * 0.4),
        clinicalViability: Math.round(r.priority_score * 0.35),
        practiceValue: Math.round(r.priority_score * 0.25),
      },
      talkingPoints: [],
      synergies: [],
    })),
    needsAttention: {
      objections: apiDraft.objections_hesitations_concerns
        .filter(i => i.type === 'objection')
        .map(o => ({
          id: uuidv4(),
          type: 'other' as const,
          statement: o.statement,
          resolved: o.status === 'resolved',
          resolution_approach: null,
          status: o.status,
          suggestedResponse: o.suggested_response || null,
          suggestedResponseLoading: false,
          notes: '',
        })),
      hesitations: apiDraft.objections_hesitations_concerns
        .filter(i => i.type === 'hesitation')
        .map(h => ({
          id: uuidv4(),
          topic: 'Hesitation',
          statement: h.statement,
          resolved: h.status === 'resolved',
          resolution_approach: null,
          status: h.status,
          notes: '',
        })),
      concerns: apiDraft.objections_hesitations_concerns
        .filter(i => i.type === 'concern')
        .map(c => ({
          id: uuidv4(),
          concern: c.statement,
          raised_by: 'patient' as const,
          category: 'other' as const,
          addressed: c.status === 'resolved',
          response: null,
          status: c.status === 'resolved' ? 'addressed' as const : 'unaddressed' as const,
          notes: '',
        })),
    },
    checklist: {
      items: apiDraft.visit_checklist.flatMap(category =>
        category.items.map(item => ({
          itemId: item.item_id,
          itemLabel: item.item_label,
          category: category.category as 'safety' | 'clinical' | 'education' | 'closing',
          completed: item.completed,
          critical: item.critical,
          evidence: null,
          manuallyChecked: false,
        }))
      ),
      completionRate: 0,
      criticalItemsComplete: true,
    },
    settings: {
      language: 'English',
      language_level: 'Standard',
      perspective: 'Second Person',
      include_pricing: true,
      include_future: true,
    },
  };
}

export function useHITLState() {
  const [state, setState] = useState<HITLState>(INITIAL_STATE);

  // Store run ID and practice ID for saving
  const contextRef = useRef<{ runId?: string; practiceId?: string }>({});

  /**
   * Initialize from API analysis (recommended)
   * Calls the HITL analyze endpoint which uses AI + practice library
   */
  const initFromApi = useCallback(async (
    runId: string,
    practiceId?: string
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    contextRef.current = { runId, practiceId };

    try {
      const response = await runsApi.analyzeForHITL(runId, { practice_id: practiceId });

      // Check if the API returned a success flag
      if ('success' in response && !response.success) {
        const errorMsg = (response as { parse_error?: string }).parse_error || 'Analysis failed';
        throw new Error(errorMsg);
      }

      const draft = transformApiDraftToLocal(response.draft);

      // Recalculate checklist stats
      const completedCount = draft.checklist.items.filter(i => i.completed === true).length;
      draft.checklist.completionRate = draft.checklist.items.length > 0
        ? completedCount / draft.checklist.items.length
        : 1;
      draft.checklist.criticalItemsComplete = draft.checklist.items
        .filter(i => i.critical)
        .every(i => i.completed === true);

      setState({
        currentStep: 'patient_summary',
        loading: false,
        error: null,
        draft,
        isDirty: false,
        validationErrors: [],
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to analyze extraction',
      }));
    }
  }, []);

  /**
   * Initialize from extraction output (client-side fallback)
   * Use this when API is unavailable or for testing
   */
  const initFromExtraction = useCallback((
    extraction: ExtractionOutput,
    practiceId: string,
    runId?: string
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    contextRef.current = { runId, practiceId };

    try {
      const draft = transformExtractionToHITLDraft(extraction);

      setState({
        currentStep: 'patient_summary',
        loading: false,
        error: null,
        draft,
        isDirty: false,
        validationErrors: [],
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize HITL',
      }));
    }
  }, []);

  /**
   * Update a field in patient summary
   */
  const updatePatientSummary = useCallback((
    field: keyof PatientSummaryDraft,
    value: unknown
  ) => {
    setState(prev => {
      if (!prev.draft) return prev;

      return {
        ...prev,
        isDirty: true,
        draft: {
          ...prev.draft,
          patientSummary: {
            ...prev.draft.patientSummary,
            [field]: value,
          },
        },
      };
    });
  }, []);

  /**
   * Verify a field
   */
  const verifyField = useCallback((section: string, fieldPath: string) => {
    setState(prev => {
      if (!prev.draft) return prev;

      const newDraft = { ...prev.draft };

      if (section === 'patientSummary') {
        const parts = fieldPath.split('.');
        if (parts[0] === 'primaryConcern') {
          newDraft.patientSummary = {
            ...newDraft.patientSummary,
            primaryConcern: {
              ...newDraft.patientSummary.primaryConcern,
              verified: true,
            },
          };
        } else if (parts[0] === 'secondaryConcerns' && parts[1]) {
          const index = parseInt(parts[1], 10);
          const newConcerns = [...newDraft.patientSummary.secondaryConcerns];
          newConcerns[index] = { ...newConcerns[index], verified: true };
          newDraft.patientSummary = {
            ...newDraft.patientSummary,
            secondaryConcerns: newConcerns,
          };
        } else if (parts[0] === 'goals' && parts[1]) {
          const index = parseInt(parts[1], 10);
          const newGoals = [...newDraft.patientSummary.goals];
          newGoals[index] = { ...newGoals[index], verified: true };
          newDraft.patientSummary = {
            ...newDraft.patientSummary,
            goals: newGoals,
          };
        }
      }

      return {
        ...prev,
        isDirty: true,
        draft: newDraft,
      };
    });
  }, []);

  /**
   * Verify all fields in a section
   */
  const verifyAllInSection = useCallback((section: string) => {
    setState(prev => {
      if (!prev.draft) return prev;

      const newDraft = { ...prev.draft };

      if (section === 'patientSummary') {
        newDraft.patientSummary = {
          ...newDraft.patientSummary,
          primaryConcern: { ...newDraft.patientSummary.primaryConcern, verified: true },
          secondaryConcerns: newDraft.patientSummary.secondaryConcerns.map(c => ({
            ...c,
            verified: true,
          })),
          goals: newDraft.patientSummary.goals.map(g => ({
            ...g,
            verified: true,
          })),
        };
      }

      return {
        ...prev,
        isDirty: true,
        draft: newDraft,
      };
    });
  }, []);

  /**
   * Update a treatment
   */
  const updateTreatment = useCallback((
    id: string,
    updates: Partial<TreatmentDraft>
  ) => {
    setState(prev => {
      if (!prev.draft) return prev;

      return {
        ...prev,
        isDirty: true,
        draft: {
          ...prev.draft,
          treatments: prev.draft.treatments.map(t =>
            t.id === id ? { ...t, ...updates } : t
          ),
        },
      };
    });
  }, []);

  /**
   * Add a new treatment
   */
  const addTreatment = useCallback((
    treatment: Omit<TreatmentDraft, 'id' | 'source'>
  ) => {
    setState(prev => {
      if (!prev.draft) return prev;

      return {
        ...prev,
        isDirty: true,
        draft: {
          ...prev.draft,
          treatments: [
            ...prev.draft.treatments,
            { ...treatment, id: uuidv4(), source: 'manual' as const },
          ],
        },
      };
    });
  }, []);

  /**
   * Remove a treatment
   */
  const removeTreatment = useCallback((id: string) => {
    setState(prev => {
      if (!prev.draft) return prev;

      return {
        ...prev,
        isDirty: true,
        draft: {
          ...prev.draft,
          treatments: prev.draft.treatments.filter(t => t.id !== id),
        },
      };
    });
  }, []);

  /**
   * Set recommendation action
   */
  const setRecommendationAction = useCallback((
    id: string,
    action: RecommendationDraft['action']
  ) => {
    setState(prev => {
      if (!prev.draft) return prev;

      return {
        ...prev,
        isDirty: true,
        draft: {
          ...prev.draft,
          recommendations: prev.draft.recommendations.map(r =>
            r.id === id ? { ...r, action } : r
          ),
        },
      };
    });
  }, []);

  /**
   * Update objection status
   */
  const updateObjectionStatus = useCallback((
    id: string,
    status: ObjectionDraft['status']
  ) => {
    setState(prev => {
      if (!prev.draft) return prev;

      return {
        ...prev,
        isDirty: true,
        draft: {
          ...prev.draft,
          needsAttention: {
            ...prev.draft.needsAttention,
            objections: prev.draft.needsAttention.objections.map(o =>
              o.id === id ? { ...o, status } : o
            ),
          },
        },
      };
    });
  }, []);

  /**
   * Request suggested response (mock for now)
   */
  const requestSuggestedResponse = useCallback(async (id: string) => {
    setState(prev => {
      if (!prev.draft) return prev;

      return {
        ...prev,
        draft: {
          ...prev.draft,
          needsAttention: {
            ...prev.draft.needsAttention,
            objections: prev.draft.needsAttention.objections.map(o =>
              o.id === id ? { ...o, suggestedResponseLoading: true } : o
            ),
          },
        },
      };
    });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setState(prev => {
      if (!prev.draft) return prev;

      const objection = prev.draft.needsAttention.objections.find(o => o.id === id);
      const response = generateSuggestedResponse(objection);

      return {
        ...prev,
        draft: {
          ...prev.draft,
          needsAttention: {
            ...prev.draft.needsAttention,
            objections: prev.draft.needsAttention.objections.map(o =>
              o.id === id
                ? { ...o, suggestedResponseLoading: false, suggestedResponse: response }
                : o
            ),
          },
        },
      };
    });
  }, []);

  /**
   * Update hesitation status
   */
  const updateHesitationStatus = useCallback((
    id: string,
    status: HesitationDraft['status']
  ) => {
    setState(prev => {
      if (!prev.draft) return prev;

      return {
        ...prev,
        isDirty: true,
        draft: {
          ...prev.draft,
          needsAttention: {
            ...prev.draft.needsAttention,
            hesitations: prev.draft.needsAttention.hesitations.map(h =>
              h.id === id ? { ...h, status } : h
            ),
          },
        },
      };
    });
  }, []);

  /**
   * Update concern status
   */
  const updateConcernStatus = useCallback((
    id: string,
    status: ConcernDraft['status']
  ) => {
    setState(prev => {
      if (!prev.draft) return prev;

      return {
        ...prev,
        isDirty: true,
        draft: {
          ...prev.draft,
          needsAttention: {
            ...prev.draft.needsAttention,
            concerns: prev.draft.needsAttention.concerns.map(c =>
              c.id === id ? { ...c, status } : c
            ),
          },
        },
      };
    });
  }, []);

  /**
   * Toggle checklist item
   */
  const toggleChecklistItem = useCallback((itemId: string) => {
    setState(prev => {
      if (!prev.draft) return prev;

      const newItems = prev.draft.checklist.items.map(item =>
        item.itemId === itemId
          ? { ...item, completed: !item.completed, manuallyChecked: true }
          : item
      );

      const completedCount = newItems.filter(i => i.completed === true).length;
      const completionRate = newItems.length > 0 ? completedCount / newItems.length : 1;
      const criticalItemsComplete = newItems
        .filter(i => i.critical)
        .every(i => i.completed === true);

      return {
        ...prev,
        isDirty: true,
        draft: {
          ...prev.draft,
          checklist: {
            items: newItems,
            completionRate,
            criticalItemsComplete,
          },
        },
      };
    });
  }, []);

  /**
   * Update TCP settings
   */
  const updateSettings = useCallback((settings: Partial<TCPSettings>) => {
    setState(prev => {
      if (!prev.draft) return prev;

      return {
        ...prev,
        isDirty: true,
        draft: {
          ...prev.draft,
          settings: { ...prev.draft.settings, ...settings },
        },
      };
    });
  }, []);

  /**
   * Validate current state
   */
  const validate = useCallback((): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!state.draft) {
      errors.push({
        section: 'loading',
        field: 'draft',
        message: 'No data to verify',
        severity: 'error',
      });
      return errors;
    }

    // Check for at least one included treatment
    const includedTreatments = state.draft.treatments.filter(t => t.included);
    if (includedTreatments.length === 0) {
      errors.push({
        section: 'treatments',
        field: 'included',
        message: 'Please include at least one treatment',
        severity: 'error',
      });
    }

    // Check critical checklist items
    if (!state.draft.checklist.criticalItemsComplete) {
      errors.push({
        section: 'checklist',
        field: 'critical',
        message: 'Critical safety items must be completed',
        severity: 'error',
      });
    }

    // Warning for unverified primary concern
    if (!state.draft.patientSummary.primaryConcern.verified) {
      errors.push({
        section: 'patient_summary',
        field: 'primaryConcern',
        message: 'Consider verifying patient\'s primary concern',
        severity: 'warning',
      });
    }

    // Warning for unresolved objections
    const unresolvedObjections = state.draft.needsAttention.objections
      .filter(o => o.status === 'unresolved');
    if (unresolvedObjections.length > 0) {
      errors.push({
        section: 'needs_attention',
        field: 'objections',
        message: `${unresolvedObjections.length} unresolved objection(s)`,
        severity: 'warning',
      });
    }

    setState(prev => ({ ...prev, validationErrors: errors }));
    return errors;
  }, [state.draft]);

  /**
   * Submit and generate output (local only)
   */
  const submit = useCallback((): HITLVerifiedOutput | null => {
    const errors = validate();
    const hasErrors = errors.some(e => e.severity === 'error');

    if (hasErrors || !state.draft) {
      return null;
    }

    // Convert draft to output format
    return convertDraftToOutput(state.draft, 'current-user');
  }, [state.draft, validate]);

  /**
   * Save HITL verification to the run via API
   * This persists the verified output back to the run record
   */
  const saveToRun = useCallback(async (
    verifiedBy: string,
    promptName: string = 'hitl_verification'
  ): Promise<{ success: boolean; error?: string }> => {
    const output = submit();
    if (!output) {
      return { success: false, error: 'Validation failed - cannot save' };
    }

    const { runId, practiceId } = contextRef.current;
    if (!runId) {
      return { success: false, error: 'No run ID available' };
    }

    try {
      await runsApi.saveHITL(runId, {
        prompt_name: promptName,
        practice_id: practiceId,
        verified_by: verifiedBy,
        verified_output: output,
      });

      setState(prev => ({
        ...prev,
        currentStep: 'complete',
        isDirty: false,
      }));

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save HITL output';
      return { success: false, error: message };
    }
  }, [submit]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  /**
   * Go to specific step
   */
  const goToStep = useCallback((step: HITLStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  // Computed values
  const progress = useMemo(() => {
    if (!state.draft) return 0;

    const steps: HITLStep[] = ['patient_summary', 'treatments', 'recommendations', 'needs_attention', 'checklist'];
    const currentIndex = steps.indexOf(state.currentStep);
    return Math.max(0, (currentIndex / steps.length) * 100);
  }, [state.draft, state.currentStep]);

  const summary = useMemo(() => {
    if (!state.draft) return null;

    return {
      treatmentsCount: state.draft.treatments.filter(t => t.included).length,
      recommendationsCount: state.draft.recommendations.filter(r => r.action === 'include').length,
      futureCount: state.draft.recommendations.filter(r => r.action === 'future').length,
      unresolvedCount:
        state.draft.needsAttention.objections.filter(o => o.status === 'unresolved').length +
        state.draft.needsAttention.hesitations.filter(h => h.status === 'unresolved').length +
        state.draft.needsAttention.concerns.filter(c => c.status === 'unaddressed').length,
      checklistCompletion: Math.round(state.draft.checklist.completionRate * 100),
    };
  }, [state.draft]);

  return {
    state,
    progress,
    summary,
    actions: {
      // Initialization
      initFromApi,
      initFromExtraction,
      // Patient summary
      updatePatientSummary,
      verifyField,
      verifyAllInSection,
      // Treatments
      updateTreatment,
      addTreatment,
      removeTreatment,
      // Recommendations
      setRecommendationAction,
      // Needs attention
      updateObjectionStatus,
      requestSuggestedResponse,
      updateHesitationStatus,
      updateConcernStatus,
      // Checklist
      toggleChecklistItem,
      // Settings
      updateSettings,
      // Validation & submission
      validate,
      submit,
      saveToRun,
      // Navigation
      reset,
      goToStep,
    },
  };
}

/**
 * Generate a suggested response based on objection type
 */
function generateSuggestedResponse(objection: ObjectionDraft | undefined): string {
  if (!objection) return '';

  const responses: Record<string, string> = {
    price: `I completely understand - aesthetic treatments are an investment. Many patients find that when they factor in longevity and results, the value becomes clear. We offer payment plans through CareCredit, and our membership saves you 10% on everything. Would you like me to show you those options?`,
    timing: `I hear you - timing is important. The good news is that treatments like this typically have minimal downtime. We could schedule around your important dates to ensure you look your best when it matters most.`,
    fear: `It's completely normal to feel a bit nervous. Most patients find the actual experience much more comfortable than expected. We use techniques to minimize discomfort, and I'll walk you through everything step by step.`,
    partner: `Of course - that's a thoughtful approach. Would it help if I provided some information you could share with them? I'm also happy to schedule a time for them to join a consultation.`,
    results: `Great question - realistic expectations are important to me too. Based on similar patients I've treated, here's what you can typically expect... I can also show you some before/after photos if that would help.`,
    trust: `I appreciate you being open about that. Building trust is important. I'd be happy to share my credentials, walk through my experience with this treatment, or connect you with patients who've had similar concerns.`,
    other: `I want to make sure we address any concerns you have. Can you tell me more about what's on your mind?`,
  };

  return responses[objection.type] || responses.other;
}
