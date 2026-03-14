/**
 * TCP Generation Page
 *
 * Main page for generating Treatment Care Plans.
 * Supports two modes:
 * 1. Manual questionnaire - step-by-step form
 * 2. AI-generated - from HITL verified output
 */

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EditIcon from '@mui/icons-material/Edit';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import type { AgentPageProps } from '../types';
import { useTCPState } from './hooks/useTCPState';
import { STEP_LABELS, MANUAL_STEPS, AI_STEPS } from './types';
import {
  SourceSelector,
  PatientInfoSection,
  ImmediateSection,
  ShortTermSection,
  LongTermSection,
  SafetySection,
  ReviewSection,
  TCPPreview,
} from './components';

export function TCPPage({
  runId,
  hitlOutput,
  practiceId,
  onComplete,
  onCancel,
  embedded,
}: AgentPageProps) {
  const { state, progress, summary, actions } = useTCPState();

  // Auto-initialize from HITL output if available
  useEffect(() => {
    if (hitlOutput && runId) {
      actions.initFromHITL(runId, practiceId);
    }
  }, [hitlOutput, runId, practiceId, actions]);

  // Get current step index for stepper
  const getSteps = () => {
    if (!state.mode) return [];
    return state.mode === 'manual' ? MANUAL_STEPS : AI_STEPS;
  };

  const steps = getSteps();
  const currentStepIndex = steps.indexOf(state.currentStep);

  // Handlers
  const handleModeSelect = (mode: 'manual' | 'ai') => {
    actions.setMode(mode);
    if (mode === 'ai' && runId) {
      actions.initFromHITL(runId, practiceId);
    }
  };

  const handleNext = () => {
    actions.nextStep();
  };

  const handleBack = () => {
    if (currentStepIndex === 0) {
      if (state.mode === 'manual') {
        actions.reset();
      } else {
        onCancel?.();
      }
    } else {
      actions.prevStep();
    }
  };

  const handleGenerate = async () => {
    const tcp = actions.generate();
    if (tcp && onComplete) {
      onComplete({
        agent_id: 'tcp_generator',
        run_id: runId || '',
        output: tcp,
        status: 'completed',
        created_at: new Date().toISOString(),
      });
    }
  };

  // Loading state
  if (state.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography color="text.secondary">Loading...</Typography>
        </Stack>
      </Box>
    );
  }

  // Error state
  if (state.error) {
    return (
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        {state.error}
      </Alert>
    );
  }

  // Source selection
  if (!state.mode) {
    return (
      <Box sx={{ p: embedded ? 0 : 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Generate Treatment Care Plan
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Choose how you want to create the TCP
        </Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* AI-Generated Option */}
          <Card sx={{ flex: 1 }}>
            <CardActionArea
              onClick={() => handleModeSelect('ai')}
              disabled={!runId || !hitlOutput}
              sx={{ height: '100%' }}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <AutoAwesomeIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  AI-Generated
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Generate TCP automatically from HITL verified output. Faster and more accurate.
                </Typography>
                {runId && hitlOutput ? (
                  <Chip label="HITL Complete" color="success" size="small" />
                ) : (
                  <Chip label="Requires HITL" color="warning" size="small" />
                )}
              </CardContent>
            </CardActionArea>
          </Card>

          {/* Manual Option */}
          <Card sx={{ flex: 1 }}>
            <CardActionArea onClick={() => handleModeSelect('manual')} sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <EditIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Manual Entry
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Build the TCP step by step using a questionnaire. Full control over content.
                </Typography>
                <Chip label="Always Available" color="default" size="small" />
              </CardContent>
            </CardActionArea>
          </Card>
        </Stack>

        {onCancel && (
          <Box sx={{ mt: 4 }}>
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ p: embedded ? 0 : 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Treatment Care Plan
            </Typography>
            <Stack direction="row" spacing={1} mt={1}>
              <Chip
                icon={state.mode === 'ai' ? <AutoAwesomeIcon /> : <EditIcon />}
                label={state.mode === 'ai' ? 'AI-Generated' : 'Manual Entry'}
                size="small"
                variant="outlined"
              />
              {summary && (
                <>
                  <Chip
                    label={`${summary.immediateTreatments + summary.shortTermTreatments} treatments`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={`${summary.followUps} follow-ups`}
                    size="small"
                    variant="outlined"
                  />
                </>
              )}
            </Stack>
          </Box>
        </Stack>
      </Box>

      {/* Stepper */}
      {steps.length > 0 && (
        <Stepper activeStep={currentStepIndex} sx={{ mb: 4 }}>
          {steps.map((step, index) => (
            <Step key={step} completed={index < currentStepIndex}>
              <StepLabel>{STEP_LABELS[step]}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}

      {/* Validation Errors */}
      {state.validationErrors.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {state.validationErrors.map((error, index) => (
            <Alert key={index} severity={error.severity} sx={{ mb: 1 }}>
              {error.message}
            </Alert>
          ))}
        </Box>
      )}

      {/* Content */}
      <Box sx={{ mb: 4 }}>
        {state.currentStep === 'patient_info' && (
          <PatientInfoSection
            patient={state.draft?.patient || ''}
            date={state.draft?.consultation_date || ''}
            provider={state.draft?.provider}
            onUpdate={actions.updatePatientInfo}
            onSubmit={() => actions.initManual(
              state.draft?.patient || 'Patient',
              state.draft?.consultation_date || new Date().toISOString().slice(0, 10)
            )}
          />
        )}

        {state.currentStep === 'immediate' && state.draft && (
          <ImmediateSection
            data={state.draft.treatment_care_plan.immediate_intervention}
            postCare={state.draft.treatment_care_plan.post_care_instructions}
            onUpdateImmediate={actions.updateImmediate}
            onAddTreatment={(t) => actions.addTreatment('immediate', t)}
            onUpdateTreatment={(id, t) => actions.updateTreatment('immediate', id, t)}
            onRemoveTreatment={(id) => actions.removeTreatment('immediate', id)}
            onUpdatePostCare={actions.updatePostCare}
          />
        )}

        {state.currentStep === 'short_term' && state.draft && (
          <ShortTermSection
            data={state.draft.treatment_care_plan.short_term_goals}
            onUpdate={actions.updateShortTerm}
            onAddTreatment={(t) => actions.addTreatment('short_term', t)}
            onUpdateTreatment={(id, t) => actions.updateTreatment('short_term', id, t)}
            onRemoveTreatment={(id) => actions.removeTreatment('short_term', id)}
            onAddFollowUp={actions.addFollowUp}
            onUpdateFollowUp={actions.updateFollowUp}
            onRemoveFollowUp={actions.removeFollowUp}
          />
        )}

        {state.currentStep === 'long_term' && state.draft && (
          <LongTermSection
            data={state.draft.treatment_care_plan.long_term_strategy}
            onUpdate={actions.updateLongTerm}
            onAddMaintenance={actions.addMaintenance}
            onUpdateMaintenance={actions.updateMaintenance}
            onRemoveMaintenance={actions.removeMaintenance}
            onUpdateSkincare={actions.updateSkincare}
          />
        )}

        {state.currentStep === 'safety' && state.draft && (
          <SafetySection
            data={state.draft.treatment_care_plan.clinical_safety_protocols}
            onUpdate={actions.updateSafety}
          />
        )}

        {state.currentStep === 'review' && state.draft && (
          <ReviewSection draft={state.draft} />
        )}

        {state.currentStep === 'preview' && state.draft && (
          <TCPPreview document={state.draft} />
        )}
      </Box>

      {/* Navigation */}
      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          {currentStepIndex === 0 ? 'Cancel' : 'Back'}
        </Button>

        {state.currentStep === 'preview' ? (
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={handleGenerate}
          >
            Generate TCP
          </Button>
        ) : (
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={handleNext}
          >
            Next
          </Button>
        )}
      </Stack>
    </Box>
  );
}
