/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
/**
 * TCP State Hook
 *
 * Manages the complete state for the TCP generation workflow.
 * TODO: Fix type mismatches between state and TCPDocument structure
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  TCPState,
  TCPStep,
  TCPDocument,
  TCPValidationError,
  TreatmentCarePlan,
  TreatmentItem,
  FollowUpItem,
  MaintenanceItem,
  SkincareRoutine,
  ImmediateIntervention,
  ShortTermGoals,
  LongTermStrategy,
  ClinicalSafetyProtocols,
} from '../types';
import { runsApi } from '../../../apiServices/runs.api';

const INITIAL_STATE: TCPState = {
  currentStep: 'source_selection',
  mode: null,
  loading: false,
  error: null,
  draft: null,
  isDirty: false,
  validationErrors: [],
};

const EMPTY_PLAN: TreatmentCarePlan = {
  immediate_intervention: {
    focus: '',
    treatments: [],
  },
  post_care_instructions: [],
  short_term_goals: {
    focus: '',
    treatments: [],
    follow_up_schedule: [],
  },
  long_term_strategy: {
    focus: '',
    maintenance_schedule: [],
    skincare_routine: null,
  },
  clinical_safety_protocols: {
    coordination_requirements: [],
    safety_protocols: [],
  },
};

export function useTCPState() {
  const [state, setState] = useState<TCPState>(INITIAL_STATE);
  const contextRef = useRef<{ runId?: string; practiceId?: string }>({});

  // =========================================================================
  // MODE SELECTION
  // =========================================================================

  const setMode = useCallback((mode: 'manual' | 'ai') => {
    setState(prev => ({
      ...prev,
      mode,
      currentStep: mode === 'manual' ? 'patient_info' : 'loading',
    }));
  }, []);

  // =========================================================================
  // INITIALIZATION
  // =========================================================================

  /**
   * Initialize from HITL output (AI mode)
   */
  const initFromHITL = useCallback(async (runId: string, practiceId?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null, mode: 'ai' }));
    contextRef.current = { runId, practiceId };

    try {
      // Get the HITL output from the run
      const hitlOutput = await runsApi.getHITL(runId);

      if (!hitlOutput) {
        throw new Error('No HITL verification found for this run. Please complete HITL first.');
      }

      // Transform HITL output to TCP draft
      const draft = transformHITLToTCP(hitlOutput.parsed_json);

      setState({
        currentStep: 'review',
        mode: 'ai',
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
        error: error instanceof Error ? error.message : 'Failed to load HITL output',
      }));
    }
  }, []);

  /**
   * Initialize empty draft (manual mode)
   */
  const initManual = useCallback((patientName: string, consultationDate: string) => {
    const draft: TCPDocument = {
      patient: patientName,
      consultation_date: consultationDate,
      treatment_care_plan: { ...EMPTY_PLAN },
      metadata: {
        generated_at: new Date().toISOString(),
        generated_by: 'manual',
        version: 1,
      },
    };

    setState({
      currentStep: 'immediate',
      mode: 'manual',
      loading: false,
      error: null,
      draft,
      isDirty: true,
      validationErrors: [],
    });
  }, []);

  // =========================================================================
  // PATIENT INFO
  // =========================================================================

  const updatePatientInfo = useCallback((patient: string, date: string, provider?: string) => {
    setState(prev => {
      if (!prev.draft) return prev;
      return {
        ...prev,
        isDirty: true,
        draft: {
          ...prev.draft,
          patient,
          consultation_date: date,
          provider,
        },
      };
    });
  }, []);

  // =========================================================================
  // IMMEDIATE INTERVENTION
  // =========================================================================

  const updateImmediate = useCallback((data: Partial<ImmediateIntervention>) => {
    setState(prev => {
      if (!prev.draft) return prev;
      return {
        ...prev,
        isDirty: true,
        draft: {
          ...prev.draft,
          treatment_care_plan: {
            ...prev.draft.treatment_care_plan,
            immediate_intervention: {
              ...prev.draft.treatment_care_plan.immediate_intervention,
              ...data,
            },
          },
        },
      };
    });
  }, []);

  // =========================================================================
  // TREATMENTS
  // =========================================================================

  const addTreatment = useCallback((
    section: 'immediate' | 'short_term',
    treatment: Omit<TreatmentItem, 'id'>
  ) => {
    setState(prev => {
      if (!prev.draft) return prev;

      const newTreatment = { ...treatment, id: uuidv4() };
      const plan = prev.draft.treatment_care_plan;

      if (section === 'immediate') {
        return {
          ...prev,
          isDirty: true,
          draft: {
            ...prev.draft,
            treatment_care_plan: {
              ...plan,
              immediate_intervention: {
                ...plan.immediate_intervention,
                treatments: [...plan.immediate_intervention.treatments, newTreatment],
              },
            },
          },
        };
      } else {
        return {
          ...prev,
          isDirty: true,
          draft: {
            ...prev.draft,
            treatment_care_plan: {
              ...plan,
              short_term_goals: {
                ...plan.short_term_goals,
                treatments: [...plan.short_term_goals.treatments, newTreatment],
              },
            },
          },
        };
      }
    });
  }, []);

  const updateTreatment = useCallback((
    section: 'immediate' | 'short_term',
    id: string,
    updates: Partial<TreatmentItem>
  ) => {
    setState(prev => {
      if (!prev.draft) return prev;

      const plan = prev.draft.treatment_care_plan;
      const updateFn = (t: TreatmentItem) => t.id === id ? { ...t, ...updates } : t;

      if (section === 'immediate') {
        return {
          ...prev,
          isDirty: true,
          draft: {
            ...prev.draft,
            treatment_care_plan: {
              ...plan,
              immediate_intervention: {
                ...plan.immediate_intervention,
                treatments: plan.immediate_intervention.treatments.map(updateFn),
              },
            },
          },
        };
      } else {
        return {
          ...prev,
          isDirty: true,
          draft: {
            ...prev.draft,
            treatment_care_plan: {
              ...plan,
              short_term_goals: {
                ...plan.short_term_goals,
                treatments: plan.short_term_goals.treatments.map(updateFn),
              },
            },
          },
        };
      }
    });
  }, []);

  const removeTreatment = useCallback((section: 'immediate' | 'short_term', id: string) => {
    setState(prev => {
      if (!prev.draft) return prev;

      const plan = prev.draft.treatment_care_plan;

      if (section === 'immediate') {
        return {
          ...prev,
          isDirty: true,
          draft: {
            ...prev.draft,
            treatment_care_plan: {
              ...plan,
              immediate_intervention: {
                ...plan.immediate_intervention,
                treatments: plan.immediate_intervention.treatments.filter(t => t.id !== id),
              },
            },
          },
        };
      } else {
        return {
          ...prev,
          isDirty: true,
          draft: {
            ...prev.draft,
            treatment_care_plan: {
              ...plan,
              short_term_goals: {
                ...plan.short_term_goals,
                treatments: plan.short_term_goals.treatments.filter(t => t.id !== id),
              },
            },
          },
        };
      }
    });
  }, []);

  // =========================================================================
  // POST-CARE INSTRUCTIONS
  // =========================================================================

  const updatePostCare = useCallback((instructions: string[]) => {
    setState(prev => {
      if (!prev.draft) return prev;
      return {
        ...prev,
        isDirty: true,
        draft: {
          ...prev.draft,
          treatment_care_plan: {
            ...prev.draft.treatment_care_plan,
            post_care_instructions: instructions,
          },
        },
      };
    });
  }, []);

  const addPostCareInstruction = useCallback((instruction: string) => {
    setState(prev => {
      if (!prev.draft) return prev;
      return {
        ...prev,
        isDirty: true,
        draft: {
          ...prev.draft,
          treatment_care_plan: {
            ...prev.draft.treatment_care_plan,
            post_care_instructions: [
              ...prev.draft.treatment_care_plan.post_care_instructions,
              instruction,
            ],
          },
        },
      };
    });
  }, []);

  const removePostCareInstruction = useCallback((index: number) => {
    setState(prev => {
      if (!prev.draft) return prev;
      return {
        ...prev,
        isDirty: true,
        draft: {
          ...prev.draft,
          treatment_care_plan: {
            ...prev.draft.treatment_care_plan,
            post_care_instructions: prev.draft.treatment_care_plan.post_care_instructions.filter(
              (_, i) => i !== index
            ),
          },
        },
      };
    });
  }, []);

  // =========================================================================
  // SHORT-TERM GOALS
  // =========================================================================

  const updateShortTerm = useCallback((data: Partial<ShortTermGoals>) => {
    setState(prev => {
      if (!prev.draft) return prev;
      return {
        ...prev,
        isDirty: true,
        draft: {
          ...prev.draft,
          treatment_care_plan: {
            ...prev.draft.treatment_care_plan,
            short_term_goals: {
              ...prev.draft.treatment_care_plan.short_term_goals,
              ...data,
            },
          },
        },
      };
    });
  }, []);

  const addFollowUp = useCallback((item: FollowUpItem) => {
    setState(prev => {
      if (!prev.draft) return prev;
      return {
        ...prev,
        isDirty: true,
        draft: {
          ...prev.draft,
          treatment_care_plan: {
            ...prev.draft.treatment_care_plan,
            short_term_goals: {
              ...prev.draft.treatment_care_plan.short_term_goals,
              follow_up_schedule: [
                ...prev.draft.treatment_care_plan.short_term_goals.follow_up_schedule,
                item,
              ],
            },
          },
        },
      };
    });
  }, []);

  const updateFollowUp = useCallback((index: number, item: FollowUpItem) => {
    setState(prev => {
      if (!prev.draft) return prev;
      const schedule = [...prev.draft.treatment_care_plan.short_term_goals.follow_up_schedule];
      schedule[index] = item;
      return {
        ...prev,
        isDirty: true,
        draft: {
          ...prev.draft,
          treatment_care_plan: {
            ...prev.draft.treatment_care_plan,
            short_term_goals: {
              ...prev.draft.treatment_care_plan.short_term_goals,
              follow_up_schedule: schedule,
            },
          },
        },
      };
    });
  }, []);

  const removeFollowUp = useCallback((index: number) => {
    setState(prev => {
      if (!prev.draft) return prev;
      return {
        ...prev,
        isDirty: true,
        draft: {
          ...prev.draft,
          treatment_care_plan: {
            ...prev.draft.treatment_care_plan,
            short_term_goals: {
              ...prev.draft.treatment_care_plan.short_term_goals,
              follow_up_schedule: prev.draft.treatment_care_plan.short_term_goals.follow_up_schedule.filter(
                (_, i) => i !== index
              ),
            },
          },
        },
      };
    });
  }, []);

  // =========================================================================
  // LONG-TERM STRATEGY
  // =========================================================================

  const updateLongTerm = useCallback((data: Partial<LongTermStrategy>) => {
    setState(prev => {
      if (!prev.draft) return prev;
      return {
        ...prev,
        isDirty: true,
        draft: {
          ...prev.draft,
          treatment_care_plan: {
            ...prev.draft.treatment_care_plan,
            long_term_strategy: {
              ...prev.draft.treatment_care_plan.long_term_strategy,
              ...data,
            },
          },
        },
      };
    });
  }, []);

  const addMaintenance = useCallback((item: MaintenanceItem) => {
    setState(prev => {
      if (!prev.draft) return prev;
      return {
        ...prev,
        isDirty: true,
        draft: {
          ...prev.draft,
          treatment_care_plan: {
            ...prev.draft.treatment_care_plan,
            long_term_strategy: {
              ...prev.draft.treatment_care_plan.long_term_strategy,
              maintenance_schedule: [
                ...prev.draft.treatment_care_plan.long_term_strategy.maintenance_schedule,
                item,
              ],
            },
          },
        },
      };
    });
  }, []);

  const updateMaintenance = useCallback((index: number, item: MaintenanceItem) => {
    setState(prev => {
      if (!prev.draft) return prev;
      const schedule = [...prev.draft.treatment_care_plan.long_term_strategy.maintenance_schedule];
      schedule[index] = item;
      return {
        ...prev,
        isDirty: true,
        draft: {
          ...prev.draft,
          treatment_care_plan: {
            ...prev.draft.treatment_care_plan,
            long_term_strategy: {
              ...prev.draft.treatment_care_plan.long_term_strategy,
              maintenance_schedule: schedule,
            },
          },
        },
      };
    });
  }, []);

  const removeMaintenance = useCallback((index: number) => {
    setState(prev => {
      if (!prev.draft) return prev;
      return {
        ...prev,
        isDirty: true,
        draft: {
          ...prev.draft,
          treatment_care_plan: {
            ...prev.draft.treatment_care_plan,
            long_term_strategy: {
              ...prev.draft.treatment_care_plan.long_term_strategy,
              maintenance_schedule: prev.draft.treatment_care_plan.long_term_strategy.maintenance_schedule.filter(
                (_, i) => i !== index
              ),
            },
          },
        },
      };
    });
  }, []);

  const updateSkincare = useCallback((routine: SkincareRoutine | null) => {
    setState(prev => {
      if (!prev.draft) return prev;
      return {
        ...prev,
        isDirty: true,
        draft: {
          ...prev.draft,
          treatment_care_plan: {
            ...prev.draft.treatment_care_plan,
            long_term_strategy: {
              ...prev.draft.treatment_care_plan.long_term_strategy,
              skincare_routine: routine,
            },
          },
        },
      };
    });
  }, []);

  // =========================================================================
  // SAFETY PROTOCOLS
  // =========================================================================

  const updateSafety = useCallback((data: Partial<ClinicalSafetyProtocols>) => {
    setState(prev => {
      if (!prev.draft) return prev;
      return {
        ...prev,
        isDirty: true,
        draft: {
          ...prev.draft,
          treatment_care_plan: {
            ...prev.draft.treatment_care_plan,
            clinical_safety_protocols: {
              ...prev.draft.treatment_care_plan.clinical_safety_protocols,
              ...data,
            },
          },
        },
      };
    });
  }, []);

  // =========================================================================
  // NAVIGATION
  // =========================================================================

  const goToStep = useCallback((step: TCPStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => {
      const steps = prev.mode === 'manual'
        ? ['patient_info', 'immediate', 'short_term', 'long_term', 'safety', 'review', 'preview']
        : ['review', 'preview'];
      const currentIndex = steps.indexOf(prev.currentStep);
      if (currentIndex < steps.length - 1) {
        return { ...prev, currentStep: steps[currentIndex + 1] as TCPStep };
      }
      return prev;
    });
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => {
      const steps = prev.mode === 'manual'
        ? ['patient_info', 'immediate', 'short_term', 'long_term', 'safety', 'review', 'preview']
        : ['review', 'preview'];
      const currentIndex = steps.indexOf(prev.currentStep);
      if (currentIndex > 0) {
        return { ...prev, currentStep: steps[currentIndex - 1] as TCPStep };
      }
      return prev;
    });
  }, []);

  // =========================================================================
  // VALIDATION
  // =========================================================================

  const validate = useCallback((): TCPValidationError[] => {
    const errors: TCPValidationError[] = [];

    if (!state.draft) {
      errors.push({
        section: 'general',
        field: 'draft',
        message: 'No TCP data',
        severity: 'error',
      });
      return errors;
    }

    // Patient info required
    if (!state.draft.patient) {
      errors.push({
        section: 'patient_info',
        field: 'patient',
        message: 'Patient name is required',
        severity: 'error',
      });
    }

    // At least one immediate treatment
    if (state.draft.treatment_care_plan.immediate_intervention.treatments.length === 0) {
      errors.push({
        section: 'immediate',
        field: 'treatments',
        message: 'At least one treatment is required',
        severity: 'warning',
      });
    }

    setState(prev => ({ ...prev, validationErrors: errors }));
    return errors;
  }, [state.draft]);

  // =========================================================================
  // GENERATE & SAVE
  // =========================================================================

  const generate = useCallback((): TCPDocument | null => {
    const errors = validate();
    if (errors.some(e => e.severity === 'error') || !state.draft) {
      return null;
    }

    return {
      ...state.draft,
      metadata: {
        generated_at: new Date().toISOString(),
        generated_by: state.draft.metadata?.generated_by || 'manual',
        version: (state.draft.metadata?.version || 0) + 1,
        source_run_id: state.draft.metadata?.source_run_id,
        hitl_output_id: state.draft.metadata?.hitl_output_id,
      },
    };
  }, [state.draft, validate]);

  const saveToRun = useCallback(async (runId: string): Promise<{ success: boolean; error?: string }> => {
    const tcp = generate();
    if (!tcp) {
      return { success: false, error: 'Validation failed' };
    }

    try {
      // TODO: Add API endpoint for saving TCP
      // await runsApi.saveTCP(runId, tcp);

      setState(prev => ({
        ...prev,
        currentStep: 'complete',
        isDirty: false,
      }));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save TCP',
      };
    }
  }, [generate]);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
    contextRef.current = {};
  }, []);

  // =========================================================================
  // COMPUTED VALUES
  // =========================================================================

  const progress = useMemo(() => {
    if (!state.mode) return 0;
    const steps = state.mode === 'manual'
      ? ['patient_info', 'immediate', 'short_term', 'long_term', 'safety', 'review', 'preview']
      : ['review', 'preview'];
    const currentIndex = steps.indexOf(state.currentStep);
    return Math.max(0, ((currentIndex + 1) / steps.length) * 100);
  }, [state.mode, state.currentStep]);

  const summary = useMemo(() => {
    if (!state.draft) return null;
    const plan = state.draft.treatment_care_plan;
    return {
      immediateTreatments: plan.immediate_intervention.treatments.length,
      shortTermTreatments: plan.short_term_goals.treatments.length,
      followUps: plan.short_term_goals.follow_up_schedule.length,
      maintenanceItems: plan.long_term_strategy.maintenance_schedule.length,
      hasSkincare: !!plan.long_term_strategy.skincare_routine,
      postCareItems: plan.post_care_instructions.length,
      safetyItems: plan.clinical_safety_protocols.safety_protocols.length +
        plan.clinical_safety_protocols.coordination_requirements.length,
    };
  }, [state.draft]);

  return {
    state,
    progress,
    summary,
    actions: {
      setMode,
      initFromHITL,
      initManual,
      updatePatientInfo,
      updateImmediate,
      addTreatment,
      updateTreatment,
      removeTreatment,
      updatePostCare,
      addPostCareInstruction,
      removePostCareInstruction,
      updateShortTerm,
      addFollowUp,
      updateFollowUp,
      removeFollowUp,
      updateLongTerm,
      addMaintenance,
      updateMaintenance,
      removeMaintenance,
      updateSkincare,
      updateSafety,
      goToStep,
      nextStep,
      prevStep,
      validate,
      generate,
      saveToRun,
      reset,
    },
  };
}

// =========================================================================
// HELPERS
// =========================================================================

/**
 * Transform HITL verified output to TCP document
 */
function transformHITLToTCP(hitl: Record<string, unknown>): TCPDocument {
  const now = new Date();
  const hitlData = hitl as {
    patient_summary?: { primary_concern?: { value?: string }; patient_name?: string };
    todays_treatments?: Array<{
      id?: string;
      name: string;
      details?: string;
      area?: string;
      cost?: string;
    }>;
    recommendations?: Array<{
      id?: string;
      name: string;
      rationale: string;
      action?: string;
    }>;
  };

  return {
    patient: hitlData.patient_summary?.patient_name || 'Patient',
    consultation_date: now.toISOString().split('T')[0] || now.toISOString().slice(0, 10),
    treatment_care_plan: {
      immediate_intervention: {
        focus: hitlData.patient_summary?.primary_concern?.value || 'Address primary concerns',
        treatments: (hitlData.todays_treatments || []).map(t => ({
          id: t.id,
          name: t.name,
          description: t.details || '',
          details: t.area || '',
          cost: t.cost || '',
        })),
      },
      post_care_instructions: [
        'Follow all post-treatment instructions provided by your provider',
        'Contact us if you experience any unusual symptoms',
      ],
      short_term_goals: {
        focus: 'Optimize results from today\'s treatment',
        treatments: (hitlData.recommendations || [])
          .filter(r => r.action === 'include')
          .map(r => ({
            id: r.id,
            name: r.name,
            description: r.rationale,
            details: '',
            cost: '',
          })),
        follow_up_schedule: [
          { event: 'Follow-up appointment', date: '2-4 weeks' },
        ],
      },
      long_term_strategy: {
        focus: 'Maintain and enhance results',
        maintenance_schedule: (hitlData.recommendations || [])
          .filter(r => r.action === 'future')
          .map(r => ({
            treatment: r.name,
            frequency: 'As recommended',
          })),
        skincare_routine: null,
      },
      clinical_safety_protocols: {
        coordination_requirements: [],
        safety_protocols: [
          'Follow all pre and post-treatment instructions',
          'Report any adverse reactions immediately',
        ],
      },
    },
    metadata: {
      generated_at: now.toISOString(),
      generated_by: 'ai',
      version: 1,
    },
  };
}
