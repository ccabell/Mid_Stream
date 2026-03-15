/**
 * TCP Wrapper Page
 *
 * Wrapper page that loads run data and renders the TCP agent.
 * Accessible via /tcp/:runId
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessIcon from '@mui/icons-material/Business';
import { runsApi, practicesApi } from 'apiServices';
import type { Run, Practice } from 'apiServices/types';
import type { HITLVerifiedOutput } from 'agents/types';
import { TCPPage as TCPAgent } from 'agents/tcp';
import { runDetailPath, ROUTES } from 'constants/routes';

export function TCPWrapperPage() {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const [run, setRun] = useState<Run | null>(null);
  const [practiceName, setPracticeName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If no runId, this is standalone TCP mode - don't fetch run data
    if (!runId) {
      setLoading(false);
      return;
    }

    runsApi.getById(runId)
      .then((runData) => {
        setRun(runData);
        setLoading(false);
        // Fetch practice name separately - don't fail if this errors
        if (runData.practice_id) {
          practicesApi.list()
            .then((practicesData) => {
              const practice = practicesData.find((p: Practice) => p.id === runData.practice_id);
              setPracticeName(practice?.name ?? null);
            })
            .catch(() => {
              // Silently ignore - will show "Not assigned"
            });
        }
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Failed to load run');
        setLoading(false);
      });
  }, [runId]);

  const handleComplete = () => {
    // Navigate back to run detail after TCP generation
    if (runId) {
      navigate(runDetailPath(runId));
    } else {
      navigate(ROUTES.RUNS);
    }
  };

  const handleCancel = () => {
    // Navigate back to run detail on cancel
    if (runId) {
      navigate(runDetailPath(runId));
    } else {
      navigate(ROUTES.RUNS);
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

  // Standalone TCP mode (no run)
  if (!runId) {
    return (
      <TCPAgent
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
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

  // Check if run has HITL output (required for AI-generated TCP)
  // The parsed_json from run.prompt_hitl is HITLVerifiedOutput
  const hitlOutput = run.prompt_hitl?.parsed_json as HITLVerifiedOutput | undefined;
  const practiceId = typeof run.practice_id === 'string' ? run.practice_id : undefined;

  return (
    <Box>
      {/* Practice context header */}
      <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon sx={{ fontSize: 18, color: practiceName ? 'primary.main' : 'text.secondary' }} />
          <Typography variant="body2" sx={{ color: practiceName ? 'text.primary' : 'text.secondary' }}>
            Practice: {practiceName || 'Not assigned'}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Run: {run.run_id ?? run.id}
        </Typography>
      </Box>

      <TCPAgent
        runId={runId}
        hitlOutput={hitlOutput}
        practiceId={practiceId}
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </Box>
  );
}
