/**
 * TCP Runner State Hook
 *
 * Manages the complete state for the TCP Runner streaming workflow.
 * Handles sequential section generation with real-time streaming.
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import type {
  TCPRunnerState,
  TCPRunnerStep,
  TCPRunnerInput,
  TCPSectionId,
  SectionStatus,
  SectionContent,
  TokenUsage,
  StreamingConfig,
  TCPDocument,
} from '../types';
import {
  INITIAL_TCP_RUNNER_STATE,
  SECTION_ORDER,
  createInitialSectionState,
} from '../types';
import { streamLLMResponse } from '../services/streamingClient';
import { buildSectionPrompt } from '../services/promptBuilder';
import { parseSectionResponse } from '../services/responseParser';

/** Step order for navigation */
const STEP_ORDER: TCPRunnerStep[] = [
  'input_selection',
  'config',
  'generating',
  'review',
  'preview',
  'complete',
];

/**
 * TCP Runner state management hook
 */
export function useTCPRunnerState() {
  const [state, setState] = useState<TCPRunnerState>(INITIAL_TCP_RUNNER_STATE);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ============================================================================
  // NAVIGATION
  // ============================================================================

  const goToStep = useCallback((step: TCPRunnerStep) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => {
      const currentIndex = STEP_ORDER.indexOf(prev.currentStep);
      const nextIndex = Math.min(currentIndex + 1, STEP_ORDER.length - 1);
      const nextStepValue = STEP_ORDER[nextIndex];
      return { ...prev, currentStep: nextStepValue ?? prev.currentStep };
    });
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => {
      const currentIndex = STEP_ORDER.indexOf(prev.currentStep);
      const prevIndex = Math.max(currentIndex - 1, 0);
      const prevStepValue = STEP_ORDER[prevIndex];
      return { ...prev, currentStep: prevStepValue ?? prev.currentStep };
    });
  }, []);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  const setInput = useCallback((input: TCPRunnerInput) => {
    setState((prev) => {
      // Extract patient info from input
      let patientName = prev.patientName;
      let practiceName = prev.practiceName;

      if (input.type === 'hitl') {
        patientName = input.data.verified_by || 'Patient';
      } else if (input.type === 'extraction') {
        // Try to get from extraction
        patientName = 'Patient';
      }

      return {
        ...prev,
        input,
        patientName,
        practiceName,
        currentStep: 'config',
      };
    });
  }, []);

  const setConfig = useCallback((config: StreamingConfig) => {
    setState((prev) => ({
      ...prev,
      config,
    }));
  }, []);

  const setPatientInfo = useCallback(
    (info: {
      patientName?: string;
      consultationDate?: string;
      providerName?: string;
      practiceName?: string;
    }) => {
      setState((prev) => ({
        ...prev,
        patientName: info.patientName ?? prev.patientName,
        consultationDate: info.consultationDate ?? prev.consultationDate,
        providerName: info.providerName ?? prev.providerName,
        practiceName: info.practiceName ?? prev.practiceName,
      }));
    },
    []
  );

  // ============================================================================
  // SECTION UPDATES (called during streaming)
  // ============================================================================

  const appendStreamingText = useCallback((sectionId: TCPSectionId, text: string) => {
    setState((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionId]: {
          ...prev.sections[sectionId],
          streamingText: prev.sections[sectionId].streamingText + text,
        },
      },
    }));
  }, []);

  const setSectionStatus = useCallback((sectionId: TCPSectionId, status: SectionStatus) => {
    setState((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionId]: {
          ...prev.sections[sectionId],
          status,
        },
      },
    }));
  }, []);

  const setSectionContent = useCallback(
    (sectionId: TCPSectionId, content: SectionContent) => {
      setState((prev) => ({
        ...prev,
        sections: {
          ...prev.sections,
          [sectionId]: {
            ...prev.sections[sectionId],
            parsedContent: content,
            completedAt: new Date().toISOString(),
          },
        },
        completedSections: prev.completedSections + 1,
      }));
    },
    []
  );

  const setSectionError = useCallback((sectionId: TCPSectionId, error: string) => {
    setState((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionId]: {
          ...prev.sections[sectionId],
          status: 'error',
          error,
        },
      },
    }));
  }, []);

  const setSectionTokenUsage = useCallback((sectionId: TCPSectionId, usage: TokenUsage) => {
    setState((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionId]: {
          ...prev.sections[sectionId],
          tokenUsage: usage,
        },
      },
      totalTokens: {
        promptTokens: prev.totalTokens.promptTokens + usage.promptTokens,
        completionTokens: prev.totalTokens.completionTokens + usage.completionTokens,
      },
    }));
  }, []);

  // ============================================================================
  // GENERATION CONTROL
  // ============================================================================

  const generateSection = useCallback(
    async (sectionId: TCPSectionId): Promise<boolean> => {
      const { input, config, sections, patientName } = state;
      if (!input || !config) return false;

      const abortController = abortControllerRef.current;
      if (abortController?.signal.aborted) return false;

      // Start section
      setState((prev) => ({
        ...prev,
        currentSection: sectionId,
        sections: {
          ...prev.sections,
          [sectionId]: {
            ...prev.sections[sectionId],
            status: 'streaming',
            streamingText: '',
            error: null,
            startedAt: new Date().toISOString(),
          },
        },
      }));

      try {
        const messages = buildSectionPrompt(sectionId, input, sections, patientName);

        await streamLLMResponse(
          {
            provider: config.provider,
            model: config.model,
            apiKey: config.apiKey,
            messages,
            temperature: config.temperature,
            maxTokens: config.maxTokens,
            abortSignal: abortController?.signal,
          },
          {
            onToken: (token) => {
              appendStreamingText(sectionId, token);
            },
            onComplete: (fullText) => {
              const parsed = parseSectionResponse(sectionId, fullText);
              if (parsed) {
                setSectionContent(sectionId, parsed);
                setSectionStatus(sectionId, 'completed');
              } else {
                setSectionError(sectionId, 'Failed to parse response');
              }
            },
            onError: (error) => {
              setSectionError(sectionId, error.message);
            },
            onUsage: (usage) => {
              setSectionTokenUsage(sectionId, usage);
            },
          }
        );

        // Check if completed successfully
        const updatedState = state;
        return updatedState.sections[sectionId].status === 'completed';
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          setSectionError(sectionId, error.message);
        }
        return false;
      }
    },
    [
      state,
      appendStreamingText,
      setSectionStatus,
      setSectionContent,
      setSectionError,
      setSectionTokenUsage,
    ]
  );

  const startGeneration = useCallback(async () => {
    const { input, config } = state;
    if (!input || !config) {
      setState((prev) => ({
        ...prev,
        globalError: 'Missing input or configuration',
      }));
      return;
    }

    // Create abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setState((prev) => ({
      ...prev,
      isGenerating: true,
      currentStep: 'generating',
      globalError: null,
      completedSections: 0,
      // Reset all sections
      sections: {
        immediate: createInitialSectionState('immediate'),
        short_term: createInitialSectionState('short_term'),
        long_term: createInitialSectionState('long_term'),
        safety: createInitialSectionState('safety'),
        summary: createInitialSectionState('summary'),
      },
    }));

    // Generate sections sequentially
    for (const sectionId of SECTION_ORDER) {
      if (abortController.signal.aborted) break;

      const success = await generateSection(sectionId);
      if (!success && !abortController.signal.aborted) {
        // Section failed, stop generation
        break;
      }

      // Small delay between sections for UX
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Clean up
    abortControllerRef.current = null;

    setState((prev) => ({
      ...prev,
      isGenerating: false,
      currentSection: null,
      currentStep: prev.completedSections === 5 ? 'review' : 'generating',
    }));
  }, [state, generateSection]);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      isGenerating: false,
      currentSection: null,
    }));
  }, []);

  const retrySection = useCallback(
    async (sectionId: TCPSectionId) => {
      const { config } = state;
      if (!config) return;

      // Create new abort controller for this retry
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setState((prev) => ({
        ...prev,
        isGenerating: true,
        sections: {
          ...prev.sections,
          [sectionId]: createInitialSectionState(sectionId),
        },
      }));

      await generateSection(sectionId);

      abortControllerRef.current = null;

      setState((prev) => ({
        ...prev,
        isGenerating: false,
        currentSection: null,
      }));
    },
    [state, generateSection]
  );

  const retryAllFailed = useCallback(async () => {
    const failedSections = SECTION_ORDER.filter(
      (id) => state.sections[id].status === 'error'
    );

    for (const sectionId of failedSections) {
      await retrySection(sectionId);
    }
  }, [state.sections, retrySection]);

  // ============================================================================
  // EDITING
  // ============================================================================

  const startEditing = useCallback((sectionId: TCPSectionId) => {
    setState((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionId]: {
          ...prev.sections[sectionId],
          status: 'editing',
        },
      },
    }));
  }, []);

  const saveEdit = useCallback((sectionId: TCPSectionId, content: SectionContent) => {
    setState((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionId]: {
          ...prev.sections[sectionId],
          status: 'completed',
          editedContent: content,
          isEdited: true,
        },
      },
    }));
  }, []);

  const cancelEdit = useCallback((sectionId: TCPSectionId) => {
    setState((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionId]: {
          ...prev.sections[sectionId],
          status: 'completed',
        },
      },
    }));
  }, []);

  const resetSection = useCallback((sectionId: TCPSectionId) => {
    setState((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionId]: {
          ...prev.sections[sectionId],
          editedContent: null,
          isEdited: false,
        },
      },
    }));
  }, []);

  // ============================================================================
  // FINALIZATION
  // ============================================================================

  const finalizeTCP = useCallback((): TCPDocument | null => {
    const { sections, patientName, consultationDate, providerName, practiceName, input } =
      state;

    // Check all sections are complete
    const allComplete = SECTION_ORDER.every(
      (id) => sections[id].status === 'completed'
    );
    if (!allComplete) return null;

    // Get content (prefer edited if available)
    const getContent = (id: TCPSectionId) =>
      sections[id].editedContent || sections[id].parsedContent;

    const immediate = getContent('immediate');
    const shortTerm = getContent('short_term');
    const longTerm = getContent('long_term');
    const safety = getContent('safety');

    if (!immediate || !shortTerm || !longTerm || !safety) return null;

    const tcp: TCPDocument = {
      patient: patientName,
      consultation_date: consultationDate,
      provider: providerName || undefined,
      practice_name: practiceName || undefined,
      treatment_care_plan: {
        immediate_intervention: immediate as TCPDocument['treatment_care_plan']['immediate_intervention'],
        post_care_instructions: [], // TODO: Extract from immediate
        short_term_goals: shortTerm as TCPDocument['treatment_care_plan']['short_term_goals'],
        long_term_strategy: longTerm as TCPDocument['treatment_care_plan']['long_term_strategy'],
        clinical_safety_protocols: safety as TCPDocument['treatment_care_plan']['clinical_safety_protocols'],
      },
      metadata: {
        generated_at: new Date().toISOString(),
        generated_by: 'ai',
        source_run_id: input?.runId,
        version: 1,
      },
    };

    setState((prev) => ({
      ...prev,
      finalTCP: tcp,
      currentStep: 'complete',
    }));

    return tcp;
  }, [state]);

  const saveToRun = useCallback(
    async (runId: string): Promise<{ success: boolean; error?: string }> => {
      const tcp = state.finalTCP || finalizeTCP();
      if (!tcp) {
        return { success: false, error: 'No TCP to save' };
      }

      // TODO: Implement actual API call
      // await runsApi.saveTCP(runId, tcp);

      console.log('Would save TCP to run:', runId, tcp);
      return { success: true };
    },
    [state.finalTCP, finalizeTCP]
  );

  // ============================================================================
  // RESET
  // ============================================================================

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState(INITIAL_TCP_RUNNER_STATE);
  }, []);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const progress = useMemo(() => {
    return (state.completedSections / state.totalSections) * 100;
  }, [state.completedSections, state.totalSections]);

  const hasErrors = useMemo(() => {
    return SECTION_ORDER.some((id) => state.sections[id].status === 'error');
  }, [state.sections]);

  const allComplete = useMemo(() => {
    return SECTION_ORDER.every((id) => state.sections[id].status === 'completed');
  }, [state.sections]);

  const canGenerate = useMemo(() => {
    return state.input !== null && state.config !== null && !state.isGenerating;
  }, [state.input, state.config, state.isGenerating]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    state,
    progress,
    hasErrors,
    allComplete,
    canGenerate,
    actions: {
      // Navigation
      goToStep,
      nextStep,
      prevStep,

      // Initialization
      setInput,
      setConfig,
      setPatientInfo,

      // Generation
      startGeneration,
      stopGeneration,
      retrySection,
      retryAllFailed,

      // Section updates
      appendStreamingText,
      setSectionStatus,
      setSectionContent,
      setSectionError,
      setSectionTokenUsage,

      // Editing
      startEditing,
      saveEdit,
      cancelEdit,
      resetSection,

      // Finalization
      finalizeTCP,
      saveToRun,

      // Reset
      reset,
    },
  };
}
