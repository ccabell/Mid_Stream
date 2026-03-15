import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import DescriptionIcon from '@mui/icons-material/Description';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import BusinessIcon from '@mui/icons-material/Business';
import { runsApi, agentsApi, practicesApi } from 'apiServices';
import type { Run, Agent, DownstreamResult, Practice } from 'apiServices';
import { ROUTES, runHitlPath, tcpPath } from 'constants/routes';
import { CardRenderer } from 'components/cards';
import { runOutputToCards } from 'utils/runOutputToCards';
import { detectExtractionVersion } from 'utils/versionDetect';
import { formatCurrency } from 'utils/normalize';

export function RunDetailPage() {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [practiceName, setPracticeName] = useState<string | null>(null);
  const [runningAgent, setRunningAgent] = useState<string | null>(null);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [hideEmptyCards, setHideEmptyCards] = useState(false);

  useEffect(() => {
    if (!runId) return;
    Promise.all([
      runsApi.getById(runId),
      agentsApi.list(),
      practicesApi.list(),
    ])
      .then(([runData, agentsData, practicesData]) => {
        setRun(runData);
        setAgents(agentsData);
        if (runData.practice_id) {
          const practice = practicesData.find((p: Practice) => p.id === runData.practice_id);
          setPracticeName(practice?.name ?? null);
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [runId]);

  const handleRunAgent = async (agentId: string) => {
    if (!runId) return;
    setRunningAgent(agentId);
    setAgentError(null);
    try {
      await agentsApi.runDownstream(runId, agentId);
      const updatedRun = await runsApi.getById(runId);
      setRun(updatedRun);
    } catch (e) {
      setAgentError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunningAgent(null);
    }
  };

  const version = useMemo(() => detectExtractionVersion(run?.outputs), [run?.outputs]);
  const cards = useMemo(
    () => runOutputToCards(run?.outputs, { hideEmptyCards }),
    [run?.outputs, hideEmptyCards]
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !run) {
    return (
      <Box>
        <Button onClick={() => navigate(ROUTES.RUNS)} sx={{ mb: 2 }}>
          ← Back to Runs
        </Button>
        <Alert severity="error">{error || 'Run not found'}</Alert>
      </Box>
    );
  }

  const hasHITL = !!run.prompt_hitl;
  const hasCards = version === 'v2' && cards.length > 0;

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          underline="hover"
          color="inherit"
          onClick={() => navigate(ROUTES.RUNS)}
          sx={{ cursor: 'pointer' }}
        >
          Runs
        </Link>
        <Typography color="text.primary">Run {(run.run_id ?? run.id).slice(0, 8)}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Run {(run.run_id ?? run.id).slice(0, 8)}
            </Typography>
            <Chip
              label={run.status || 'Unknown'}
              color={run.status === 'success' || run.status === 'completed' ? 'success' : 'default'}
              size="small"
            />
            <Chip label={version.toUpperCase()} size="small" variant="outlined" />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessIcon sx={{ fontSize: 16, color: practiceName ? 'primary.main' : 'text.secondary' }} />
            <Typography
              variant="body2"
              sx={{ color: practiceName ? 'text.primary' : 'text.secondary', fontWeight: practiceName ? 500 : 400 }}
            >
              {practiceName || 'No practice assigned'}
            </Typography>
            {hasHITL && (
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: 12 }} />}
                label="HITL Verified"
                size="small"
                sx={{
                  ml: 1,
                  height: 22,
                  fontSize: 11,
                  fontWeight: 600,
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  '& .MuiChip-icon': { color: '#166534' },
                }}
              />
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {hasCards && (
            <FormControlLabel
              control={
                <Switch
                  checked={hideEmptyCards}
                  onChange={(e) => setHideEmptyCards(e.target.checked)}
                  size="small"
                />
              }
              label={<Typography variant="body2">Hide empty</Typography>}
            />
          )}
          {version === 'v2' && (
            <Button
              variant={hasHITL ? 'outlined' : 'contained'}
              color={hasHITL ? 'success' : 'primary'}
              startIcon={hasHITL ? <CheckCircleIcon /> : <FactCheckIcon />}
              onClick={() => navigate(runHitlPath(runId!))}
            >
              {hasHITL ? 'View HITL' : 'Start HITL'}
            </Button>
          )}
          {hasHITL && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<DescriptionIcon />}
              onClick={() => navigate(tcpPath(runId!))}
            >
              Generate TCP
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main content - Cards */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {hasCards ? (
            <Box>
              {cards.map((card) => (
                <CardRenderer key={card.id} card={card} />
              ))}
            </Box>
          ) : run.outputs ? (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: 'grey.50',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Raw Output (V1 or Unknown Format)
              </Typography>
              <Box
                component="pre"
                sx={{
                  p: 2,
                  backgroundColor: 'grey.100',
                  borderRadius: 1,
                  overflow: 'auto',
                  fontSize: 11,
                  fontFamily: 'monospace',
                  maxHeight: 500,
                }}
              >
                {JSON.stringify(run.outputs, null, 2)}
              </Box>
            </Box>
          ) : (
            <Alert severity="info">No extraction outputs available</Alert>
          )}

          {/* Agent outputs */}
          {run.outputs?.downstream && Object.keys(run.outputs.downstream).length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary' }}>
                Agent Outputs
              </Typography>
              {Object.entries(run.outputs.downstream as Record<string, DownstreamResult>).map(([agentId, result]) => (
                <Box
                  key={agentId}
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'grey.50',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    {agents.find((a) => a.id === agentId)?.name ?? agentId}
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      p: 1.5,
                      backgroundColor: 'grey.100',
                      borderRadius: 1,
                      overflow: 'auto',
                      fontSize: 11,
                      fontFamily: 'monospace',
                      maxHeight: 300,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {typeof result.result === 'string' ? result.result : JSON.stringify(result.result, null, 2)}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, lg: 4 }}>
          {/* Value metrics summary */}
          {run.outputs?.value_metrics && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary' }}>
                Value Metrics
              </Typography>
              <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                {run.outputs.value_metrics.total_opportunity_value !== undefined && (
                  <Box sx={{ mb: 2, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Total Opportunity Value</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {formatCurrency(run.outputs.value_metrics.total_opportunity_value)}
                    </Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                  {run.outputs.value_metrics.realized_value !== undefined && (
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Realized</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {formatCurrency(run.outputs.value_metrics.realized_value)}
                      </Typography>
                    </Box>
                  )}
                  {run.outputs.value_metrics.committed_value !== undefined && (
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Committed</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'info.main' }}>
                        {formatCurrency(run.outputs.value_metrics.committed_value)}
                      </Typography>
                    </Box>
                  )}
                  {run.outputs.value_metrics.potential_value !== undefined && (
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Potential</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'warning.main' }}>
                        {formatCurrency(run.outputs.value_metrics.potential_value)}
                      </Typography>
                    </Box>
                  )}
                  {run.outputs.value_metrics.lost_value !== undefined && (
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Lost</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'error.main' }}>
                        {formatCurrency(run.outputs.value_metrics.lost_value)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          )}

          {/* Run agents */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary' }}>
              Run Agents
            </Typography>
            {agentError && <Alert severity="error" sx={{ mb: 1.5 }}>{agentError}</Alert>}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {agents.map((agent) => {
                const hasResult = run.outputs?.downstream?.[agent.id];
                return (
                  <Button
                    key={agent.id}
                    variant={hasResult ? 'outlined' : 'contained'}
                    size="small"
                    fullWidth
                    disabled={runningAgent !== null}
                    startIcon={
                      runningAgent === agent.id ? (
                        <CircularProgress size={16} />
                      ) : hasResult ? (
                        <CheckCircleIcon />
                      ) : (
                        <PlayArrowIcon />
                      )
                    }
                    onClick={() => handleRunAgent(agent.id)}
                    sx={{ textTransform: 'none', justifyContent: 'flex-start', py: 1 }}
                  >
                    {agent.name}
                  </Button>
                );
              })}
              {agents.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No agents available
                </Typography>
              )}
            </Box>
          </Box>

          {/* Run details */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary' }}>
              Run Details
            </Typography>
            <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'grid', gap: 1 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Run ID</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                    {run.run_id ?? run.id}
                  </Typography>
                </Box>
                {run.created_at && (
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Created</Typography>
                    <Typography variant="body2">{new Date(run.created_at).toLocaleString()}</Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Practice</Typography>
                  <Typography variant="body2" sx={{ color: practiceName ? 'text.primary' : 'text.secondary' }}>
                    {practiceName || 'Not assigned'}
                  </Typography>
                </Box>
                {run.transcript_id && (
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Transcript ID</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                      {run.transcript_id}
                    </Typography>
                  </Box>
                )}
                {hasHITL && run.prompt_hitl && (
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>HITL Verified</Typography>
                    <Typography variant="body2" sx={{ color: 'success.main' }}>
                      {new Date(run.prompt_hitl.verified_at).toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
