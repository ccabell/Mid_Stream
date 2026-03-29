/**
 * CoachingPage
 *
 * Dedicated page for viewing coaching agent outputs across all runs.
 * Allows running cross-sell guidance, opportunities agent, and email campaign
 * agents on any completed run, and viewing the results.
 */
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Divider from '@mui/material/Divider';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Collapse from '@mui/material/Collapse';
import PsychologyIcon from '@mui/icons-material/Psychology';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmailIcon from '@mui/icons-material/Email';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { runsApi, agentsApi } from 'apiServices';
import type { Run, Agent, DownstreamResult } from 'apiServices';
import { runDetailPath } from 'constants/routes';

// Coaching agent IDs and their display config
const COACHING_AGENTS = [
  {
    id: 'cross_sell_guidance_v3',
    label: 'Cross-Sell Guidance',
    icon: <TrendingUpIcon fontSize="small" />,
    color: 'primary' as const,
    description: 'Prioritized cross-sell/upsell recommendations from consultation summary and catalog.',
  },
  {
    id: 'opportunities_agent',
    label: 'Opportunities',
    icon: <LightbulbIcon fontSize="small" />,
    color: 'warning' as const,
    description: 'Follow-up plan, sell plan, next-visit reference, and CRM personalization context.',
  },
  {
    id: 'email_campaign',
    label: 'Email Campaign',
    icon: <EmailIcon fontSize="small" />,
    color: 'success' as const,
    description: 'Generate email campaign from extraction output.',
  },
];

interface RunWithCoaching extends Run {
  coachingOutputs: Array<{
    agentId: string;
    agentLabel: string;
    result: DownstreamResult;
  }>;
}

function AgentOutputPanel({ agentId, result }: { agentId: string; result: DownstreamResult }) {
  const [expanded, setExpanded] = useState(false);
  const agentConfig = COACHING_AGENTS.find((a) => a.id === agentId);
  // result.result is typed as unknown — cast to access the actual output
  const resultData = result.result as Record<string, unknown> | null | undefined;
  const hasOutput = resultData && typeof resultData === 'object' && Object.keys(resultData).length > 0;
  const outputText = hasOutput
    ? JSON.stringify(resultData, null, 2)
    : result.ran_at ? `Ran at: ${result.ran_at}` : 'No output available';

  return (
    <Box sx={{ mt: 1.5 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          py: 0.5,
        }}
        onClick={() => setExpanded((e) => !e)}
      >
        {agentConfig?.icon}
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
          {agentConfig?.label ?? agentId}
        </Typography>
        <Chip
          label="done"
          size="small"
          color="success"
          sx={{ fontSize: 10 }}
        />
        <IconButton size="small">
          {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <Box
          sx={{
            mt: 1,
            p: 1.5,
            backgroundColor: 'grey.50',
            borderRadius: 1,
            border: 1,
            borderColor: 'divider',
            fontFamily: 'monospace',
            fontSize: 12,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: 400,
            overflow: 'auto',
          }}
        >
          {typeof outputText === 'string' ? outputText : JSON.stringify(outputText, null, 2)}
        </Box>
      </Collapse>
    </Box>
  );
}

function RunCoachingCard({
  run,
  agents,
  onAgentRun,
  runningAgent,
}: {
  run: RunWithCoaching;
  agents: Agent[];
  onAgentRun: (runId: string, agentId: string) => void;
  runningAgent: string | null;
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const hasCoachingOutputs = run.coachingOutputs.length > 0;

  const runDate = run.created_at
    ? new Date(run.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Unknown date';

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent sx={{ pb: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Run {run.run_id ? run.run_id.slice(0, 8) : run.id.slice(0, 8)}
              </Typography>
              <Chip
                label={run.status ?? 'unknown'}
                size="small"
                color={run.status === 'success' ? 'success' : run.status === 'pending' ? 'warning' : 'default'}
                sx={{ fontSize: 10 }}
              />
              {hasCoachingOutputs && (
                <Chip
                  icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                  label={`${run.coachingOutputs.length} coaching output${run.coachingOutputs.length > 1 ? 's' : ''}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontSize: 10 }}
                />
              )}
            </Box>
            <Typography variant="caption" color="text.secondary">
              {runDate}
              {run.practice_id && ` · Practice: ${run.practice_id.slice(0, 8)}…`}
            </Typography>
          </Box>
          <Tooltip title="View run detail">
            <IconButton
              size="small"
              onClick={() => navigate(runDetailPath(run.id))}
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Coaching Outputs */}
        {hasCoachingOutputs && (
          <>
            <Divider sx={{ mb: 1.5 }} />
            {run.coachingOutputs.map((output) => (
              <AgentOutputPanel
                key={output.agentId}
                agentId={output.agentId}
                result={output.result}
              />
            ))}
          </>
        )}
      </CardContent>

      {/* Run Agent Actions */}
      {run.status === 'success' && (
        <CardActions sx={{ px: 2, pb: 2, pt: 0, flexWrap: 'wrap', gap: 1 }}>
          {COACHING_AGENTS.map((agent) => {
            const alreadyRan = run.coachingOutputs.some((o) => o.agentId === agent.id);
            const isRunning = runningAgent === `${run.id}:${agent.id}`;
            return (
              <Button
                key={agent.id}
                size="small"
                variant={alreadyRan ? 'outlined' : 'contained'}
                color={agent.color}
                startIcon={isRunning ? <CircularProgress size={14} color="inherit" /> : agent.icon}
                disabled={isRunning || !!runningAgent}
                onClick={() => onAgentRun(run.id, agent.id)}
                sx={{ fontSize: 12 }}
              >
                {alreadyRan ? `Re-run ${agent.label}` : `Run ${agent.label}`}
              </Button>
            );
          })}
        </CardActions>
      )}
    </Card>
  );
}

export function CoachingPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runningAgent, setRunningAgent] = useState<string | null>(null);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'with_coaching' | 'without_coaching'>('all');

  useEffect(() => {
    Promise.all([
      runsApi.list({ limit: 50 }),
      agentsApi.list(),
    ])
      .then(([runsData, agentsData]) => {
        setRuns(Array.isArray(runsData) ? runsData : (runsData as { data: Run[] }).data ?? []);
        setAgents(agentsData);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  const handleRunAgent = async (runId: string, agentId: string) => {
    const key = `${runId}:${agentId}`;
    setRunningAgent(key);
    setAgentError(null);
    try {
      await agentsApi.runDownstream(runId, agentId);
      // Refresh the run to get updated outputs
      const updatedRun = await runsApi.getById(runId);
      setRuns((prev) => prev.map((r) => (r.id === runId ? updatedRun : r)));
    } catch (e) {
      setAgentError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunningAgent(null);
    }
  };

  // Build runs with coaching outputs
  const runsWithCoaching = useMemo<RunWithCoaching[]>(() => {
    return runs.map((run) => {
      const downstream = (run.outputs?.downstream ?? {}) as Record<string, DownstreamResult>;
      const coachingOutputs = COACHING_AGENTS
        .filter((agent) => downstream[agent.id])
        .map((agent) => ({
          agentId: agent.id,
          agentLabel: agent.label,
          result: downstream[agent.id]!,
        }));
      return { ...run, coachingOutputs };
    });
  }, [runs]);

  // Filter runs
  const filteredRuns = useMemo(() => {
    let result = runsWithCoaching;

    // Tab filter
    if (filterTab === 'with_coaching') {
      result = result.filter((r) => r.coachingOutputs.length > 0);
    } else if (filterTab === 'without_coaching') {
      result = result.filter((r) => r.coachingOutputs.length === 0 && r.status === 'success');
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.run_id?.toLowerCase().includes(q) ||
          r.practice_id?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [runsWithCoaching, filterTab, search]);

  const coachingCount = runsWithCoaching.filter((r) => r.coachingOutputs.length > 0).length;
  const readyCount = runsWithCoaching.filter(
    (r) => r.status === 'success' && r.coachingOutputs.length === 0
  ).length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PsychologyIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Coaching
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Run AI coaching agents on completed consultations — cross-sell guidance, opportunities, and email campaigns
          </Typography>
        </Box>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Card variant="outlined" sx={{ flex: 1 }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {coachingCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Runs with coaching
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ flex: 1 }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
              {readyCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Ready to coach
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ flex: 1 }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {runs.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total runs
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {agentError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setAgentError(null)}>
          Agent error: {agentError}
        </Alert>
      )}

      {/* Filter bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Tabs
          value={filterTab}
          onChange={(_, v) => setFilterTab(v)}
          sx={{ '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontSize: 13 } }}
        >
          <Tab value="all" label={`All (${runsWithCoaching.length})`} />
          <Tab value="with_coaching" label={`With Coaching (${coachingCount})`} />
          <Tab value="without_coaching" label={`Ready to Coach (${readyCount})`} />
        </Tabs>
        <Box sx={{ flex: 1 }} />
        <TextField
          size="small"
          placeholder="Search runs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ width: 220 }}
        />
      </Box>

      {/* Runs list */}
      {filteredRuns.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            backgroundColor: 'background.paper',
            borderRadius: 1,
            border: 1,
            borderColor: 'divider',
          }}
        >
          <PsychologyIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography variant="h6" color="text.secondary">
            {filterTab === 'with_coaching'
              ? 'No runs with coaching outputs yet'
              : filterTab === 'without_coaching'
              ? 'All successful runs have been coached'
              : 'No runs found'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {filterTab === 'without_coaching'
              ? 'Switch to "All" to view all runs'
              : 'Complete some runs first, then run coaching agents here'}
          </Typography>
        </Box>
      ) : (
        filteredRuns.map((run) => (
          <RunCoachingCard
            key={run.id}
            run={run}
            agents={agents}
            onAgentRun={handleRunAgent}
            runningAgent={runningAgent}
          />
        ))
      )}
    </Box>
  );
}
