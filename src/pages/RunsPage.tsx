import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import BusinessIcon from '@mui/icons-material/Business';
import { runsApi, practicesApi } from 'apiServices';
import type { Run, V2Pass1Output, V2Pass2Output, Practice } from 'apiServices';
import { runDetailPath } from 'constants/routes';
import { format } from 'date-fns';

function getStatusConfig(status: string | undefined) {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'success':
      return { color: 'success' as const, icon: <CheckCircleIcon sx={{ fontSize: 14 }} />, label: 'Completed', bg: '#dcfce7', text: '#166534' };
    case 'failed':
    case 'error':
      return { color: 'error' as const, icon: <ErrorIcon sx={{ fontSize: 14 }} />, label: 'Failed', bg: '#fee2e2', text: '#991b1b' };
    default:
      return { color: 'default' as const, icon: null, label: status || 'Pending', bg: '#f3f4f6', text: '#374151' };
  }
}

function getIntentColor(score: number) {
  if (score >= 70) return { main: '#16a34a', light: '#dcfce7' };
  if (score >= 40) return { main: '#d97706', light: '#fef9c3' };
  return { main: '#dc2626', light: '#fee2e2' };
}

function RunCard({ run, practiceName, onClick }: { run: Run; practiceName: string | null; onClick: () => void }) {
  const statusConfig = getStatusConfig(run.status);

  // Extract key metrics from outputs
  const p1 = run.outputs?.prompt_1?.parsed_json as V2Pass1Output | undefined;
  const p2 = run.outputs?.prompt_2?.parsed_json as V2Pass2Output | undefined;
  const offerings = p1?.offerings || [];
  const intentScore = p2?.patient_signals?.intent_level?.value ?? p2?.patient_signals?.intent_score?.value;
  const summary = p2?.outcome?.summary?.value;
  const hasHITL = !!run.prompt_hitl;
  const totalValue = offerings.reduce((sum, o) => sum + (o.value || 0), 0);

  return (
    <Card
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        transition: 'all 200ms ease',
        '&:hover': {
          borderColor: 'primary.light',
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        },
      }}
    >
      <CardActionArea onClick={onClick}>
        <CardContent sx={{ p: 2.5 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  backgroundColor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PlaylistPlayIcon sx={{ fontSize: 22, color: 'white' }} />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                    Run {(run.run_id ?? run.id).slice(0, 8)}
                  </Typography>
                  {/* Practice chip */}
                  <Chip
                    icon={<BusinessIcon sx={{ fontSize: 12 }} />}
                    label={practiceName || 'No Practice'}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: 10,
                      fontWeight: 500,
                      backgroundColor: practiceName ? '#e0f2fe' : '#f3f4f6',
                      color: practiceName ? '#0369a1' : '#6b7280',
                      '& .MuiChip-icon': { color: practiceName ? '#0369a1' : '#9ca3af' },
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {run.created_at ? format(new Date(run.created_at), 'MMM d, h:mm a') : '—'}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Chip
              icon={statusConfig.icon ?? undefined}
              label={statusConfig.label}
              size="small"
              sx={{
                backgroundColor: statusConfig.bg,
                color: statusConfig.text,
                fontWeight: 600,
                fontSize: 11,
                '& .MuiChip-icon': { color: statusConfig.text },
              }}
            />
          </Box>

          {/* Summary snippet */}
          {summary && (
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.5,
              }}
            >
              {summary}
            </Typography>
          )}

          {/* Metrics row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            {/* Intent score */}
            {intentScore != null && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 100 }}>
                <TrendingUpIcon sx={{ fontSize: 16, color: getIntentColor(intentScore as number).main }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: 10 }}>
                    Intent
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, intentScore as number)}
                    sx={{
                      height: 4,
                      borderRadius: 1,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': { backgroundColor: getIntentColor(intentScore as number).main },
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: getIntentColor(intentScore as number).main, minWidth: 28 }}>
                  {Math.round(intentScore as number)}%
                </Typography>
              </Box>
            )}

            {/* Offerings count */}
            {offerings.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ShoppingCartIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {offerings.length} item{offerings.length !== 1 ? 's' : ''}
                </Typography>
                {totalValue > 0 && (
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.main' }}>
                    ${totalValue.toLocaleString()}
                  </Typography>
                )}
              </Box>
            )}

            {/* HITL badge */}
            {hasHITL && (
              <Chip
                icon={<FactCheckIcon sx={{ fontSize: 12 }} />}
                label="HITL Verified"
                size="small"
                sx={{
                  height: 22,
                  fontSize: 10,
                  fontWeight: 600,
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  '& .MuiChip-icon': { color: '#1e40af' },
                }}
              />
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export function RunsPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch runs (required) and practices (optional, for display)
    runsApi.list()
      .then((runsData) => {
        setRuns(runsData);
        // Fetch practices separately - don't fail if this errors
        practicesApi.list()
          .then(setPractices)
          .catch(() => {
            // Silently ignore practices fetch error - cards will show "No Practice"
          });
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  // Create practice lookup map for efficient name resolution
  const practiceMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of practices) {
      map.set(p.id, p.name);
    }
    return map;
  }, [practices]);

  // Calculate stats
  const completedRuns = runs.filter(r => r.status === 'success' || r.status === 'completed').length;
  const hitlRuns = runs.filter(r => (r as Run & { prompt_hitl?: unknown }).prompt_hitl).length;

  const PageHeader = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
        Extraction Runs
      </Typography>
      <Typography variant="body1" color="text.secondary">
        View and analyze consultation intelligence extractions
      </Typography>
      {runs.length > 0 && (
        <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>{runs.length}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Total Runs</Typography>
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>{completedRuns}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Completed</Typography>
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'info.main' }}>{hitlRuns}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>HITL Verified</Typography>
          </Box>
        </Box>
      )}
    </Box>
  );

  if (loading) {
    return (
      <Box>
        <PageHeader />
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <PageHeader />
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Could not load runs</Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader />

      {runs.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 4,
            borderRadius: 3,
            border: '2px dashed',
            borderColor: 'divider',
            backgroundColor: 'grey.50',
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 2,
              backgroundColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <PlaylistPlayIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            No extraction runs yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
            Run an extraction from the prompt-runner backend to see consultation intelligence results here.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {runs.map((run) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={run.run_id ?? run.id}>
              <RunCard
                run={run}
                practiceName={run.practice_id ? practiceMap.get(run.practice_id) ?? null : null}
                onClick={() => navigate(runDetailPath(run.run_id ?? run.id))}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
