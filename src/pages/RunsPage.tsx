import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { runsApi } from '@/api';
import type { Run } from '@/api';
import { runDetailPath } from '@/constants/routes';
import { format } from 'date-fns';

function getStatusConfig(status: string | undefined) {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'success':
      return { color: 'success' as const, icon: <CheckCircleIcon sx={{ fontSize: 14 }} />, label: 'Completed' };
    case 'failed':
    case 'error':
      return { color: 'error' as const, icon: <ErrorIcon sx={{ fontSize: 14 }} />, label: 'Failed' };
    default:
      return { color: 'default' as const, icon: null, label: status || 'Unknown' };
  }
}

function RunCard({ run, onClick }: { run: Run; onClick: () => void }) {
  const statusConfig = getStatusConfig(run.status);
  const hasOutputs = run.outputs && Object.keys(run.outputs).length > 0;

  return (
    <Card
      sx={{
        transition: 'all 150ms ease-in-out',
        '&:hover': {
          boxShadow: 2,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardActionArea onClick={onClick}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  backgroundColor: 'action.hover',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PlaylistPlayIcon sx={{ fontSize: 20, color: 'primary.main' }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Run {(run.run_id ?? run.id).slice(0, 8)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {run.run_id ?? run.id}
                </Typography>
              </Box>
            </Box>
            <Chip
              icon={statusConfig.icon ?? undefined}
              label={statusConfig.label}
              color={statusConfig.color}
              size="small"
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {run.created_at ? format(new Date(run.created_at), 'MMM d, yyyy h:mm a') : '—'}
              </Typography>
            </Box>

            {hasOutputs && (
              <Chip label="Has outputs" size="small" variant="outlined" sx={{ height: 20, fontSize: 11 }} />
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export function RunsPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    runsApi
      .list()
      .then(setRuns)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Extraction Runs
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          View and manage extraction runs from consultation transcripts
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Extraction Runs
        </Typography>
        <Card>
          <CardContent>
            <Typography color="error.main" variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Could not load runs
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {error}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Extraction Runs
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {runs.length} extraction run{runs.length !== 1 ? 's' : ''} from consultation transcripts
      </Typography>

      {runs.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <PlaylistPlayIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              No extraction runs yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Run an extraction from the prompt-runner backend to see results here.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {runs.map((run) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={run.run_id ?? run.id}>
              <RunCard run={run} onClick={() => navigate(runDetailPath(run.run_id ?? run.id))} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
