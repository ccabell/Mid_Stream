/**
 * TCP Runner Page
 *
 * Main page component for the TCP Runner agent.
 * Orchestrates the streaming TCP generation workflow.
 */

import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import type { AgentPageProps } from '../types';
import { useTCPRunnerState } from './hooks';
import {
  InputSelector,
  ProviderSelector,
  SectionProgress,
  StreamingSection,
  GenerationControls,
} from './components';
import { SECTION_ORDER } from './types';

export function TCPRunnerPage({
  runId,
  extractionOutput,
  hitlOutput,
  onComplete,
  onCancel,
  embedded,
}: AgentPageProps) {
  const { state, progress, hasErrors, allComplete, canGenerate, actions } =
    useTCPRunnerState();

  // Auto-select input if only one is available
  useEffect(() => {
    if (state.currentStep === 'input_selection') {
      const hasHITL = hitlOutput !== undefined;
      const hasExtraction = extractionOutput !== undefined;

      if (hasHITL && !hasExtraction && hitlOutput) {
        actions.setInput({ type: 'hitl', data: hitlOutput, runId });
      } else if (hasExtraction && !hasHITL && extractionOutput) {
        actions.setInput({ type: 'extraction', data: extractionOutput, runId });
      }
    }
  }, [state.currentStep, hitlOutput, extractionOutput, runId, actions]);

  const handleBack = () => {
    switch (state.currentStep) {
      case 'config':
        actions.goToStep('input_selection');
        break;
      case 'generating':
      case 'review':
        actions.goToStep('config');
        break;
      case 'preview':
        actions.goToStep('review');
        break;
      default:
        onCancel?.();
    }
  };

  const handleFinalize = () => {
    const tcp = actions.finalizeTCP();
    if (tcp && onComplete) {
      onComplete({
        agent_id: 'tcp_runner',
        run_id: runId || '',
        output: tcp,
        status: 'completed',
        created_at: new Date().toISOString(),
      });
    }
  };

  return (
    <Box sx={{ p: embedded ? 0 : 3 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <AutoAwesomeIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" fontWeight={600}>
                TCP Runner
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Generate Treatment Care Plans with streaming AI
              </Typography>
            </Box>
          </Stack>

          {runId && (
            <Typography variant="body2" color="text.secondary">
              Run: {runId.slice(0, 8)}
            </Typography>
          )}
        </Stack>

        {/* Error State */}
        {state.globalError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {state.globalError}
          </Alert>
        )}

        {/* Main Content */}
        <Stack spacing={3}>
          {/* Step 1: Input Selection */}
          {state.currentStep === 'input_selection' && (
            <InputSelector
              extractionOutput={extractionOutput}
              hitlOutput={hitlOutput}
              runId={runId}
              onSelect={actions.setInput}
            />
          )}

          {/* Step 2: Provider Configuration */}
          {state.currentStep === 'config' && (
            <ProviderSelector
              onConfigComplete={(config) => {
                actions.setConfig(config);
                actions.goToStep('generating');
              }}
              initialConfig={state.config || undefined}
            />
          )}

          {/* Step 3: Generation */}
          {(state.currentStep === 'generating' || state.currentStep === 'review') && (
            <>
              {/* Progress */}
              <Paper sx={{ p: 2 }}>
                <SectionProgress
                  sections={state.sections}
                  currentSection={state.currentSection}
                  onSectionClick={
                    state.currentStep === 'review'
                      ? (id) => actions.startEditing(id)
                      : undefined
                  }
                />
              </Paper>

              {/* Generation Controls */}
              <GenerationControls
                isGenerating={state.isGenerating}
                canGenerate={canGenerate}
                progress={progress}
                completedSections={state.completedSections}
                totalSections={state.totalSections}
                hasErrors={hasErrors}
                allComplete={allComplete}
                totalTokens={state.totalTokens}
                onStart={actions.startGeneration}
                onStop={actions.stopGeneration}
                onRetryFailed={actions.retryAllFailed}
                onContinue={() => actions.goToStep('preview')}
              />

              {/* Sections */}
              <Stack spacing={2}>
                {SECTION_ORDER.map((sectionId) => (
                  <StreamingSection
                    key={sectionId}
                    sectionId={sectionId}
                    section={state.sections[sectionId]}
                    isActive={state.currentSection === sectionId}
                    onEdit={actions.startEditing}
                    onRetry={actions.retrySection}
                  />
                ))}
              </Stack>
            </>
          )}

          {/* Step 4: Preview */}
          {state.currentStep === 'preview' && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                TCP Preview
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Review your generated Treatment Care Plan below.
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Render each section's content */}
              {SECTION_ORDER.map((sectionId) => {
                const section = state.sections[sectionId];
                const content = section.editedContent || section.parsedContent;

                return (
                  <Box key={sectionId} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {sectionId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Typography>
                    <Box
                      sx={{
                        mt: 1,
                        p: 2,
                        bgcolor: 'grey.50',
                        borderRadius: 1,
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {JSON.stringify(content, null, 2)}
                    </Box>
                  </Box>
                );
              })}
            </Paper>
          )}

          {/* Step 5: Complete */}
          {state.currentStep === 'complete' && (
            <Alert severity="success">
              <Typography variant="h6">TCP Generated Successfully!</Typography>
              <Typography variant="body2">
                Your Treatment Care Plan has been generated and saved.
              </Typography>
            </Alert>
          )}
        </Stack>

        {/* Navigation */}
        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
          sx={{ mt: 4 }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            disabled={state.isGenerating}
          >
            {state.currentStep === 'input_selection' ? 'Cancel' : 'Back'}
          </Button>

          {state.currentStep === 'preview' && (
            <Button
              variant="contained"
              color="success"
              endIcon={<ArrowForwardIcon />}
              onClick={handleFinalize}
            >
              Finalize TCP
            </Button>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

export default TCPRunnerPage;
