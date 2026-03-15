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
import type { ExtractionOutput, Pass1Output, Pass2Output } from 'agents/types';
import { HITLPage } from 'agents/hitl';
import { runDetailPath, tcpPath } from 'constants/routes';

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
    // Navigate to TCP generation after HITL completion
    if (runId) {
      navigate(tcpPath(runId));
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

  // Check if run has extraction output with parsed_json
  const p1 = run.outputs?.prompt_1;
  const p2 = run.outputs?.prompt_2;
  const hasExtraction = p1?.parsed_json && p2?.parsed_json;

  if (!hasExtraction) {
    return (
      <Box sx={{ p: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Go Back
        </Button>
        <Alert severity="warning">
          <AlertTitle>Missing Extraction Data</AlertTitle>
          This run does not have complete extraction output (prompt_1 and prompt_2 with parsed_json).
          HITL verification requires extraction to be complete.
          <br /><br />
          <strong>Debug:</strong> prompt_1={p1 ? 'exists' : 'missing'},
          prompt_1.parsed_json={p1?.parsed_json ? 'exists' : 'missing'},
          prompt_2={p2 ? 'exists' : 'missing'},
          prompt_2.parsed_json={p2?.parsed_json ? 'exists' : 'missing'}
        </Alert>
      </Box>
    );
  }

  // Build extraction output from run data
  // The normalizer will handle V2 → standard format conversion
  const extractionOutput: ExtractionOutput = {
    prompt_1: {
      parsed_json: p1.parsed_json as Pass1Output,
      raw_response: p1.raw ?? '',
    },
    prompt_2: {
      parsed_json: p2.parsed_json as Pass2Output,
      raw_response: p2.raw ?? '',
    },
  };

  // practice_id may be string, null, or undefined due to Run's index signature
  const practiceId = typeof run.practice_id === 'string' ? run.practice_id : undefined;

  return (
    <HITLPage
      runId={runId}
      extractionOutput={extractionOutput}
      practiceId={practiceId}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  );
}
