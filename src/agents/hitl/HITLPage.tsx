/**
 * HITL Verification Page
 *
 * Main page component for the Human-In-The-Loop verification workflow.
 */

import { useEffect, useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import type { AgentPageProps, AgentOutput } from '../types';
import { useHITLState } from './hooks';
import {
  PatientSummarySection,
  TreatmentsSection,
  RecommendationsSection,
  NeedsAttentionSection,
  ChecklistSection,
  TCPSettingsPanel,
  ClinicalReviewSection,
} from './components';
import type { HITLStep } from './types';
import { COMMITMENT_COLORS, COMMITMENT_LABELS } from './types';

const STEPS: { key: HITLStep; label: string }[] = [
  { key: 'patient_summary', label: 'Patient Summary' },
  { key: 'treatments', label: 'Treatments' },
  { key: 'recommendations', label: 'Recommendations' },
  { key: 'needs_attention', label: 'Needs Attention' },
  { key: 'checklist', label: 'Checklist' },
  { key: 'review', label: 'Review & Approve' },
];

export function HITLPage({
  runId,
  extractionOutput,
  practiceId,
  onComplete,
  onCancel,
  embedded,
}: AgentPageProps) {
  const { state, summary, actions } = useHITLState();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Initialize HITL state
  // Prefer API-based initialization when runId is available (AI + practice library)
  // Fall back to client-side extraction when API fails or runId is not available
  useEffect(() => {
    const initialize = async () => {
      console.log('[HITL Page] Initializing...', { runId, hasExtraction: !!extractionOutput, practiceId });

      if (runId && extractionOutput) {
        try {
          // Try API-based analysis first
          console.log('[HITL Page] Trying API-based analysis...');
          await actions.initFromApi(runId, practiceId);
          console.log('[HITL Page] API-based analysis succeeded');
        } catch (error) {
          // If API fails, fall back to client-side transformation
          console.warn('[HITL Page] API failed, using client-side extraction:', error);
          try {
            actions.initFromExtraction(extractionOutput, practiceId || 'default', runId);
            console.log('[HITL Page] Client-side extraction succeeded');
          } catch (fallbackError) {
            console.error('[HITL Page] Client-side extraction also failed:', fallbackError);
          }
        }
      } else if (extractionOutput) {
        // No runId - use client-side transformation directly
        console.log('[HITL Page] No runId, using client-side extraction directly');
        actions.initFromExtraction(extractionOutput, practiceId || 'default', runId);
      } else {
        console.error('[HITL Page] No extractionOutput provided!');
      }
    };

    initialize();
  }, [runId, extractionOutput, practiceId, actions]);

  const currentStepIndex = useMemo(() => {
    return STEPS.findIndex(s => s.key === state.currentStep);
  }, [state.currentStep]);

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      const nextStep = STEPS[nextIndex];
      if (nextStep) actions.goToStep(nextStep.key);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      const prevStep = STEPS[prevIndex];
      if (prevStep) actions.goToStep(prevStep.key);
    }
  };

  const handleStepClick = (step: HITLStep) => {
    actions.goToStep(step);
  };

  const handleApprove = () => {
    const errors = actions.validate();
    const hasErrors = errors.some(e => e.severity === 'error');

    if (hasErrors) {
      // Show errors, don't proceed
      return;
    }

    // Show confirmation dialog
    setConfirmDialogOpen(true);
  };

  const handleConfirmApprove = async () => {
    setConfirmDialogOpen(false);

    // Save to run via API
    const result = await actions.saveToRun('current-user', 'hitl_verification');

    if (result.success) {
      const output = actions.submit();
      if (output && onComplete) {
        const agentOutput: AgentOutput = {
          agent_id: 'hitl_verification',
          run_id: runId || '',
          output,
          status: 'completed',
          created_at: new Date().toISOString(),
        };
        onComplete(agentOutput);
      }
    } else {
      // Show error - update state with error
      console.error('Failed to save HITL:', result.error);
    }
  };

  // Loading state
  if (state.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
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

  // No data state
  if (!state.draft) {
    return (
      <Alert severity="info">
        <AlertTitle>No Data</AlertTitle>
        Please provide extraction output to verify.
      </Alert>
    );
  }

  const pass2 = extractionOutput?.prompt_2.parsed_json;
  const commitmentLevel = pass2?.patient_signals?.commitment_level;
  const outcomeStatus = pass2?.outcome?.status;

  return (
    <Box sx={{ p: embedded ? 0 : 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h5" fontWeight={600}>
              HITL Verification
            </Typography>
            <Stack direction="row" spacing={1} mt={1}>
              {outcomeStatus && (
                <Chip
                  label={outcomeStatus.replace(/_/g, ' ')}
                  size="small"
                  variant="outlined"
                />
              )}
              {commitmentLevel && (
                <Chip
                  label={COMMITMENT_LABELS[commitmentLevel] || commitmentLevel}
                  size="small"
                  color={COMMITMENT_COLORS[commitmentLevel] || 'default'}
                />
              )}
            </Stack>
          </Box>

          {summary && (
            <Stack direction="row" spacing={2}>
              <Chip label={`${summary.treatmentsCount} treatments`} variant="outlined" />
              <Chip label={`${summary.recommendationsCount} to include`} color="success" variant="outlined" />
              {summary.unresolvedCount > 0 && (
                <Chip
                  icon={<WarningIcon />}
                  label={`${summary.unresolvedCount} unresolved`}
                  color="warning"
                />
              )}
              <Chip label={`${summary.checklistCompletion}% checklist`} variant="outlined" />
            </Stack>
          )}
        </Stack>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={currentStepIndex} sx={{ mb: 4 }}>
        {STEPS.map((step, index) => (
          <Step key={step.key} completed={index < currentStepIndex}>
            <StepLabel
              sx={{ cursor: 'pointer' }}
              onClick={() => handleStepClick(step.key)}
            >
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Validation Errors */}
      {state.validationErrors.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {state.validationErrors.map((error, index) => (
            <Alert
              key={index}
              severity={error.severity}
              sx={{ mb: 1 }}
            >
              {error.message}
            </Alert>
          ))}
        </Box>
      )}

      {/* Content */}
      <Box sx={{ mb: 4 }}>
        {state.currentStep === 'patient_summary' && (
          <PatientSummarySection
            data={state.draft.patientSummary}
            onVerifyField={(fieldPath) => actions.verifyField('patientSummary', fieldPath)}
            onVerifyAll={() => actions.verifyAllInSection('patientSummary')}
            onUpdateField={actions.updatePatientSummary}
          />
        )}

        {state.currentStep === 'treatments' && (
          <TreatmentsSection
            treatments={state.draft.treatments}
            onUpdateTreatment={actions.updateTreatment}
            onAddTreatment={actions.addTreatment}
            onRemoveTreatment={actions.removeTreatment}
          />
        )}

        {state.currentStep === 'recommendations' && (
          <RecommendationsSection
            recommendations={state.draft.recommendations}
            onSetAction={actions.setRecommendationAction}
          />
        )}

        {state.currentStep === 'needs_attention' && (
          <NeedsAttentionSection
            data={state.draft.needsAttention}
            onUpdateObjectionStatus={actions.updateObjectionStatus}
            onRequestSuggestedResponse={actions.requestSuggestedResponse}
            onUpdateHesitationStatus={actions.updateHesitationStatus}
            onUpdateConcernStatus={actions.updateConcernStatus}
          />
        )}

        {state.currentStep === 'checklist' && (
          <ChecklistSection
            data={state.draft.checklist}
            onToggleItem={actions.toggleChecklistItem}
          />
        )}

        {state.currentStep === 'review' && (
          <Stack spacing={3}>
            <Alert severity="info">
              <AlertTitle>Review Before Approval</AlertTitle>
              Review your verification and settings below. Complete the clinical review, then click "Approve & Generate TCP".
            </Alert>

            {/* Clinical Review Section */}
            <ClinicalReviewSection
              clinicalReviewRequired={state.clinicalReviewRequired}
              clinicalReviewCompleted={state.clinicalReviewCompleted}
              clinicalReviewedBy={state.clinicalReviewedBy}
              clinicalReviewedAt={state.clinicalReviewedAt}
              onCompleteClinicalReview={actions.completeClinicalReview}
            />

            <TCPSettingsPanel
              settings={state.draft.settings}
              onUpdate={actions.updateSettings}
            />

            {/* Quick Summary */}
            <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom>
                Verification Summary
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>Treatments to include:</strong> {summary?.treatmentsCount || 0}
                </Typography>
                <Typography variant="body2">
                  <strong>Recommendations for today:</strong> {summary?.recommendationsCount || 0}
                </Typography>
                <Typography variant="body2">
                  <strong>Saved for future:</strong> {summary?.futureCount || 0}
                </Typography>
                <Typography variant="body2">
                  <strong>Checklist completion:</strong> {summary?.checklistCompletion || 0}%
                </Typography>
                {(summary?.unresolvedCount || 0) > 0 && (
                  <Typography variant="body2" color="warning.main">
                    <strong>Unresolved items:</strong> {summary?.unresolvedCount}
                  </Typography>
                )}
              </Stack>
            </Box>
          </Stack>
        )}
      </Box>

      {/* Navigation */}
      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={currentStepIndex === 0 ? onCancel : handleBack}
        >
          {currentStepIndex === 0 ? 'Cancel' : 'Back'}
        </Button>

        {state.currentStep === 'review' ? (
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={handleApprove}
            disabled={state.clinicalReviewRequired && !state.clinicalReviewCompleted}
          >
            {state.clinicalReviewRequired && !state.clinicalReviewCompleted
              ? 'Complete Clinical Review First'
              : 'Approve & Generate TCP'}
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

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Approval</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are about to approve this verification and generate the Treatment Care Plan.
            This will create a patient-facing document based on your verified data.
          </DialogContentText>
          {(summary?.unresolvedCount || 0) > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              You have {summary?.unresolvedCount} unresolved items. Are you sure you want to continue?
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmApprove} variant="contained" color="success">
            Approve & Generate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
