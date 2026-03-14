import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import { runsApi, agentsApi } from 'apiServices';
import type { Run, V2Pass1Output, V2Pass2Output, Agent, DownstreamResult } from 'apiServices';
import { ROUTES, runHitlPath } from 'constants/routes';

export function RunDetailPage() {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [runningAgent, setRunningAgent] = useState<string | null>(null);
  const [agentError, setAgentError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) return;
    Promise.all([
      runsApi.getById(runId),
      agentsApi.list(),
    ])
      .then(([runData, agentsData]) => {
        setRun(runData);
        setAgents(agentsData);
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
      // Refresh run data to get new downstream results
      const updatedRun = await runsApi.getById(runId);
      setRun(updatedRun);
    } catch (e) {
      setAgentError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunningAgent(null);
    }
  };

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
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(ROUTES.RUNS)} sx={{ mb: 2 }}>
          Back to Runs
        </Button>
        <Card>
          <CardContent>
            <Typography color="error.main" variant="subtitle1" sx={{ fontWeight: 600 }}>
              {error || 'Run not found'}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const p1 = run.outputs?.prompt_1?.parsed_json as V2Pass1Output | undefined;
  const p2 = run.outputs?.prompt_2?.parsed_json as V2Pass2Output | undefined;

  return (
    <Box>
      {/* Breadcrumb */}
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5">Run {(run.run_id ?? run.id).slice(0, 8)}</Typography>
          <Chip
            label={run.status || 'Unknown'}
            color={run.status === 'success' || run.status === 'completed' ? 'success' : 'default'}
            size="small"
          />
        </Box>

        {/* HITL Verification Button */}
        {p1 && p2 && (
          <Button
            variant={(run as Run & { prompt_hitl?: unknown }).prompt_hitl ? 'outlined' : 'contained'}
            color={(run as Run & { prompt_hitl?: unknown }).prompt_hitl ? 'success' : 'primary'}
            startIcon={(run as Run & { prompt_hitl?: unknown }).prompt_hitl ? <CheckCircleIcon /> : <FactCheckIcon />}
            onClick={() => navigate(runHitlPath(runId!))}
          >
            {(run as Run & { prompt_hitl?: unknown }).prompt_hitl ? 'View HITL Verification' : 'Start HITL Verification'}
          </Button>
        )}
      </Box>

      {/* Summary Card */}
      {p2?.outcome?.summary?.value && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Consultation Summary
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {p2.outcome.summary.value}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Visit Context */}
      {p1?.visit_context && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Visit Context
            </Typography>
            <Box sx={{ mt: 1, display: 'grid', gap: 1 }}>
              {p1.visit_context.visit_type?.value && (
                <Typography variant="body2">
                  <strong>Visit Type:</strong> {p1.visit_context.visit_type.value}
                </Typography>
              )}
              {p1.visit_context.reason_for_visit?.value && (
                <Typography variant="body2">
                  <strong>Reason:</strong> {p1.visit_context.reason_for_visit.value}
                </Typography>
              )}
              {p1.visit_context.referred_by?.value && (
                <Typography variant="body2">
                  <strong>Referred By:</strong> {p1.visit_context.referred_by.value}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Patient Goals */}
      {p1?.patient_goals && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Patient Goals
            </Typography>
            <Box sx={{ mt: 1 }}>
              {p1.patient_goals.primary_concern?.value && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Primary Concern:</strong> {p1.patient_goals.primary_concern.value}
                </Typography>
              )}
              {p1.patient_goals.goals?.value && p1.patient_goals.goals.value.length > 0 && (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {p1.patient_goals.goals.value.map((goal, i) => (
                    <Chip key={i} label={goal} size="small" variant="outlined" />
                  ))}
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Offerings */}
      {p1?.offerings && p1.offerings.length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Products & Services ({p1.offerings.length})
            </Typography>
            <Box sx={{ mt: 1, display: 'grid', gap: 1 }}>
              {p1.offerings.map((offering, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1,
                    borderRadius: 1,
                    backgroundColor: 'action.hover',
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {offering.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {offering.disposition} {offering.area ? `• ${offering.area}` : ''}
                    </Typography>
                  </Box>
                  {offering.value && (
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                      ${offering.value.toLocaleString()}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {p2?.next_steps && p2.next_steps.length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Next Steps ({p2.next_steps.length})
            </Typography>
            <Box sx={{ mt: 1, display: 'grid', gap: 1 }}>
              {p2.next_steps.map((step, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={step.owner} size="small" />
                  <Typography variant="body2">{step.action}</Typography>
                  {step.timing && (
                    <Typography variant="caption" color="text.secondary">
                      ({step.timing})
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Downstream Agents Section */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">
            Run Agents
          </Typography>
          {agentError && (
            <Alert severity="error" sx={{ mt: 1, mb: 1 }}>
              {agentError}
            </Alert>
          )}
          <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {agents.map((agent) => {
              const hasResult = run.outputs?.downstream?.[agent.id];
              return (
                <Button
                  key={agent.id}
                  variant={hasResult ? 'outlined' : 'contained'}
                  size="small"
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
                  sx={{ textTransform: 'none' }}
                >
                  {agent.name}
                </Button>
              );
            })}
            {agents.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No agents available
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Downstream Results */}
      {run.outputs?.downstream && Object.keys(run.outputs.downstream).length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Agent Outputs
            </Typography>
            {Object.entries(run.outputs.downstream as Record<string, DownstreamResult>).map(
              ([agentId, result]) => (
                <Box key={agentId} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {agents.find((a) => a.id === agentId)?.name ?? agentId}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {result.ran_at ? new Date(result.ran_at).toLocaleString() : ''}
                    </Typography>
                  </Box>
                  <Box
                    component="pre"
                    sx={{
                      p: 2,
                      backgroundColor: 'action.hover',
                      borderRadius: 1,
                      overflow: 'auto',
                      fontSize: 12,
                      maxHeight: 400,
                    }}
                  >
                    {typeof result.result === 'string'
                      ? result.result
                      : JSON.stringify(result.result, null, 2)}
                  </Box>
                  <Divider sx={{ mt: 2 }} />
                </Box>
              )
            )}
          </CardContent>
        </Card>
      )}

      {/* Raw JSON fallback */}
      {!p1 && !p2 && run.outputs && (
        <Card>
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Raw Output
            </Typography>
            <Box
              component="pre"
              sx={{
                mt: 1,
                p: 2,
                backgroundColor: 'action.hover',
                borderRadius: 1,
                overflow: 'auto',
                fontSize: 12,
              }}
            >
              {JSON.stringify(run.outputs, null, 2)}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
