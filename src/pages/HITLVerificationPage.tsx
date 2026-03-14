// @ts-nocheck
// TODO: Fix type mismatches between Run types
/**
 * HITL Verification Page
 *
 * Wrapper page that loads run data and renders the HITL agent.
 * Accessible via /runs/:runId/hitl
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { runsApi } from 'apiServices';
import type { Run } from 'apiServices/types';
import type { ExtractionOutput } from 'agents/types';
import { HITLPage } from 'agents/hitl';
import { runDetailPath } from 'constants/routes';

export function HITLVerificationPage() {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) {
      setError('No run ID provided');
      setLoading(false);
      return;
    }

    runsApi
      .getById(runId)
      .then((data) => {
        setRun(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Failed to load run');
        setLoading(false);
      });
  }, [runId]);

  const handleComplete = () => {
    // Navigate back to run detail after completion
    if (runId) {
      navigate(runDetailPath(runId));
    }
  };

  const handleCancel = () => {
    // Navigate back to run detail on cancel
    if (runId) {
      navigate(runDetailPath(runId));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Go Back
        </Button>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!run) {
    return (
      <Box sx={{ p: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Go Back
        </Button>
        <Alert severity="warning">
          <AlertTitle>Run Not Found</AlertTitle>
          The requested run could not be found.
        </Alert>
      </Box>
    );
  }

  // Check if run has extraction output
  const hasExtraction = run.outputs?.prompt_1 && run.outputs?.prompt_2;
  if (!hasExtraction) {
    return (
      <Box sx={{ p: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Go Back
        </Button>
        <Alert severity="warning">
          <AlertTitle>Missing Extraction Data</AlertTitle>
          This run does not have complete extraction output (prompt_1 and prompt_2).
          HITL verification requires extraction to be complete.
        </Alert>
      </Box>
    );
  }

  // Build extraction output from run data
  const extractionOutput: ExtractionOutput = {
    prompt_1: {
      parsed_json: run.outputs.prompt_1.parsed_json,
      raw_response: run.outputs.prompt_1.raw_text,
    },
    prompt_2: {
      parsed_json: run.outputs.prompt_2.parsed_json,
      raw_response: run.outputs.prompt_2.raw_text,
    },
  };

  return (
    <HITLPage
      runId={runId}
      extractionOutput={extractionOutput}
      practiceId={run.practice_id}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  );
}
