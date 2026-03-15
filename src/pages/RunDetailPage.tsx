import { useEffect, useState } from 'react';
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import DescriptionIcon from '@mui/icons-material/Description';
import SummarizeIcon from '@mui/icons-material/Summarize';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ChecklistIcon from '@mui/icons-material/Checklist';
import WarningIcon from '@mui/icons-material/Warning';
import BusinessIcon from '@mui/icons-material/Business';
import { runsApi, agentsApi, practicesApi } from 'apiServices';
import type { Run, V2Pass1Output, V2Pass2Output, Agent, DownstreamResult, Practice } from 'apiServices';
import { ROUTES, runHitlPath, tcpPath } from 'constants/routes';
import {
  SummaryCard,
  AccordionCard,
  InsightCard,
  KPICard,
  OfferingList,
} from 'components/cards';

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
        // Find practice name for this run
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
        <Alert severity="error">{error || 'Run not found'}</Alert>
      </Box>
    );
  }

  const p1 = run.outputs?.prompt_1?.parsed_json as V2Pass1Output | undefined;
  const p2 = run.outputs?.prompt_2?.parsed_json as V2Pass2Output | undefined;
  const hasHITL = !!run.prompt_hitl;

  // Extract data for cards
  const summary = p2?.outcome?.summary?.value;
  const visitType = p1?.visit_context?.visit_type?.value;
  const reasonForVisit = p1?.visit_context?.reason_for_visit?.value;
  const primaryConcern = p1?.patient_goals?.primary_concern?.value;
  const goals = p1?.patient_goals?.goals?.value || [];
  const offerings = p1?.offerings || [];
  const nextSteps = p2?.next_steps || [];
  const objections = p2?.patient_signals?.objections || [];
  const hesitations = p2?.patient_signals?.hesitations || [];
  const intentScore = p2?.patient_signals?.intent_level?.value ?? p2?.patient_signals?.intent_score?.value;
  const sentimentScore = p2?.patient_signals?.sentiment_final?.value;
  const planClarity = p2?.provider_quality?.plan_clarity?.value;
  const visitChecklist = p2?.visit_checklist || [];

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component="button" underline="hover" color="inherit" onClick={() => navigate(ROUTES.RUNS)} sx={{ cursor: 'pointer' }}>
          Runs
        </Link>
        <Typography color="text.primary">Run {(run.run_id ?? run.id).slice(0, 8)}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>Run {(run.run_id ?? run.id).slice(0, 8)}</Typography>
            <Chip label={run.status || 'Unknown'} color={run.status === 'success' || run.status === 'completed' ? 'success' : 'default'} size="small" />
            {visitType && <Chip label={String(visitType).replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())} variant="outlined" size="small" />}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessIcon sx={{ fontSize: 16, color: practiceName ? 'primary.main' : 'text.secondary' }} />
            <Typography variant="body2" sx={{ color: practiceName ? 'text.primary' : 'text.secondary', fontWeight: practiceName ? 500 : 400 }}>
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
        <Box sx={{ display: 'flex', gap: 1 }}>
          {Boolean(p1 && p2) && (
            <Button variant={hasHITL ? 'outlined' : 'contained'} color={hasHITL ? 'success' : 'primary'} startIcon={hasHITL ? <CheckCircleIcon /> : <FactCheckIcon />} onClick={() => navigate(runHitlPath(runId!))}>
              {hasHITL ? 'View HITL' : 'Start HITL'}
            </Button>
          )}
          {hasHITL && (
            <Button variant="contained" color="secondary" startIcon={<DescriptionIcon />} onClick={() => navigate(tcpPath(runId!))}>
              Generate TCP
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          {summary && (
            <Box sx={{ mb: 2 }}>
              <SummaryCard title="Consultation Summary" summary={summary} icon={<SummarizeIcon />} infoContent="This summary is generated by AI analyzing the consultation transcript." />
            </Box>
          )}

          {(reasonForVisit || primaryConcern) && (
            <Box sx={{ mb: 2 }}>
              <InsightCard
                title="Visit Context"
                icon={<PersonIcon />}
                summary={reasonForVisit || undefined}
                values={[...(primaryConcern ? [{ label: 'Primary Concern', value: primaryConcern }] : []), ...(visitType ? [{ label: 'Visit Type', value: String(visitType).replace('_', ' ') }] : [])]}
                evidence={p1?.visit_context?.reason_for_visit?.evidence?.map((e) => ({ quote: e.quote, speaker: e.speaker, confidence: e.confidence })) || []}
                infoContent="Visit context extracted from the conversation."
              />
            </Box>
          )}

          {goals.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <InsightCard
                title="Patient Goals"
                icon={<TrendingUpIcon />}
                badge={goals.length}
                values={goals.map((goal, i) => ({ label: `Goal ${i + 1}`, value: goal }))}
                evidence={p1?.patient_goals?.goals?.evidence?.map((e) => ({ quote: e.quote, speaker: e.speaker, confidence: e.confidence })) || []}
                infoContent="Goals are what the patient explicitly wants to achieve."
              />
            </Box>
          )}

          {offerings.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <AccordionCard title="Products & Services Discussed" value={`${offerings.length} item${offerings.length !== 1 ? 's' : ''}`} variant="short" valueColor="info" icon={<ShoppingCartIcon />} defaultExpanded infoContent="All products, services, and packages mentioned during the consultation.">
                <OfferingList offerings={offerings.map((o) => ({ name: o.name, type: o.type, disposition: o.disposition, area: o.area, quantity: o.quantity, value: o.value, evidence: o.evidence ? { quote: o.evidence.quote, speaker: o.evidence.speaker, confidence: o.evidence.confidence } : undefined }))} />
              </AccordionCard>
            </Box>
          )}

          {nextSteps.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <AccordionCard title="Next Steps" value={`${nextSteps.length} action${nextSteps.length !== 1 ? 's' : ''}`} variant="short" valueColor="success" icon={<AssignmentTurnedInIcon />} defaultExpanded infoContent="Actions agreed upon during the consultation.">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {nextSteps.map((step, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 1.25, borderRadius: 1.5, backgroundColor: 'grey.50' }}>
                      <Chip label={step.owner} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 600, backgroundColor: step.owner === 'patient' ? '#ede9fe' : step.owner === 'provider' ? '#dbeafe' : '#f3f4f6', color: step.owner === 'patient' ? '#6366f1' : step.owner === 'provider' ? '#2563eb' : '#374151' }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{step.action}</Typography>
                        {step.timing && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{step.timing}</Typography>}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </AccordionCard>
            </Box>
          )}

          {(objections.length > 0 || hesitations.length > 0) && (
            <Box sx={{ mb: 2 }}>
              <AccordionCard title="Objections & Hesitations" value={`${objections.length + hesitations.length} concern${objections.length + hesitations.length !== 1 ? 's' : ''}`} variant="short" valueColor="warning" icon={<WarningIcon />} infoContent="Patient objections and hesitations identified.">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {objections.map((obj, i) => (
                    <Box key={`obj-${i}`} sx={{ p: 1.25, borderRadius: 1.5, backgroundColor: obj.resolved ? '#dcfce7' : '#fee2e2', borderLeft: '3px solid', borderColor: obj.resolved ? '#16a34a' : '#dc2626' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: obj.resolved ? '#166534' : '#991b1b' }}>Objection: {obj.type}</Typography>
                        <Chip label={obj.resolved ? 'Resolved' : 'Unresolved'} size="small" sx={{ height: 18, fontSize: 10, fontWeight: 600, backgroundColor: obj.resolved ? '#166534' : '#dc2626', color: 'white' }} />
                      </Box>
                      {obj.statement && <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>"{obj.statement}"</Typography>}
                    </Box>
                  ))}
                  {hesitations.map((hes, i) => (
                    <Box key={`hes-${i}`} sx={{ p: 1.25, borderRadius: 1.5, backgroundColor: '#fef9c3', borderLeft: '3px solid', borderColor: '#d97706' }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#854d0e', mb: 0.5, display: 'block' }}>Hesitation: {hes.topic}</Typography>
                      {hes.statement && <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>"{hes.statement}"</Typography>}
                    </Box>
                  ))}
                </Box>
              </AccordionCard>
            </Box>
          )}

          {visitChecklist.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <AccordionCard title="Visit Checklist" value={`${visitChecklist.filter((i) => i.completed).length}/${visitChecklist.length} completed`} variant="short" valueColor={visitChecklist.filter((i) => i.completed).length === visitChecklist.length ? 'success' : 'warning'} icon={<ChecklistIcon />} infoContent="Standard consultation checklist items.">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {visitChecklist.map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: item.completed ? '#dcfce7' : '#fee2e2', color: item.completed ? '#166534' : '#991b1b' }}>
                        {item.completed ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'currentColor' }} />}
                      </Box>
                      <Typography variant="body2" sx={{ color: item.completed ? 'text.primary' : 'text.secondary' }}>{item.item_label}</Typography>
                    </Box>
                  ))}
                </Box>
              </AccordionCard>
            </Box>
          )}

          {run.outputs?.downstream && Object.keys(run.outputs.downstream).length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary' }}>Agent Outputs</Typography>
              {Object.entries(run.outputs.downstream as Record<string, DownstreamResult>).map(([agentId, result]) => (
                <Box key={agentId} sx={{ mb: 2 }}>
                  <SummaryCard title={agents.find((a) => a.id === agentId)?.name ?? agentId} summary={typeof result.result === 'string' ? result.result : JSON.stringify(result.result, null, 2)} icon={<MedicalServicesIcon />} collapsible defaultExpanded={false} />
                </Box>
              ))}
            </Box>
          )}

          {!p1 && !p2 && run.outputs && (
            <Box sx={{ mb: 2 }}>
              <AccordionCard title="Raw Output" value="JSON Data" variant="long" defaultExpanded>
                <Box component="pre" sx={{ p: 2, backgroundColor: 'grey.100', borderRadius: 1, overflow: 'auto', fontSize: 11, fontFamily: 'monospace', maxHeight: 400 }}>{JSON.stringify(run.outputs, null, 2)}</Box>
              </AccordionCard>
            </Box>
          )}
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          {(intentScore !== undefined || sentimentScore !== undefined || planClarity !== undefined) && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary' }}>Performance Metrics</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {intentScore !== undefined && <KPICard title="Patient Intent" score={typeof intentScore === 'number' ? intentScore : 0} icon={<TrendingUpIcon />} infoContent="Patient Intent measures how likely the patient is to proceed with treatment." details={['Based on explicit statements of interest', 'Considers questions about pricing/scheduling', 'Factors in objections and their resolution']} evidence={p2?.patient_signals?.intent_level?.evidence?.map((e) => ({ quote: e.quote, speaker: e.speaker, confidence: e.confidence })) || []} />}
                {sentimentScore !== undefined && <KPICard title="Patient Sentiment" score={typeof sentimentScore === 'number' ? sentimentScore : 0} icon={<ThumbUpIcon />} infoContent="Patient Sentiment measures the overall emotional tone." details={['Analyzes language and tone', 'Considers expressed satisfaction/concerns', 'Tracks emotional trajectory through visit']} />}
                {planClarity !== undefined && <KPICard title="Plan Clarity" score={typeof planClarity === 'number' ? planClarity : 0} icon={<PsychologyIcon />} infoContent="Plan Clarity measures how well the provider explained the treatment plan." details={['Did provider explain treatment benefits?', 'Were risks and aftercare discussed?', 'Was pricing addressed clearly?']} />}
              </Box>
            </Box>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary' }}>Run Agents</Typography>
            {agentError && <Alert severity="error" sx={{ mb: 1.5 }}>{agentError}</Alert>}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {agents.map((agent) => {
                const hasResult = run.outputs?.downstream?.[agent.id];
                return (
                  <Button key={agent.id} variant={hasResult ? 'outlined' : 'contained'} size="small" fullWidth disabled={runningAgent !== null} startIcon={runningAgent === agent.id ? <CircularProgress size={16} /> : hasResult ? <CheckCircleIcon /> : <PlayArrowIcon />} onClick={() => handleRunAgent(agent.id)} sx={{ textTransform: 'none', justifyContent: 'flex-start', py: 1 }}>
                    {agent.name}
                  </Button>
                );
              })}
              {agents.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>No agents available</Typography>}
            </Box>
          </Box>

          {run.outputs?.value_metrics && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary' }}>Value Metrics</Typography>
              <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                {run.outputs.value_metrics.total_opportunity_value !== undefined && (
                  <Box sx={{ mb: 2, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Total Opportunity Value</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>${run.outputs.value_metrics.total_opportunity_value.toLocaleString()}</Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                  {run.outputs.value_metrics.realized_value !== undefined && <Box><Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Realized</Typography><Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.main' }}>${run.outputs.value_metrics.realized_value.toLocaleString()}</Typography></Box>}
                  {run.outputs.value_metrics.committed_value !== undefined && <Box><Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Committed</Typography><Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'info.main' }}>${run.outputs.value_metrics.committed_value.toLocaleString()}</Typography></Box>}
                  {run.outputs.value_metrics.potential_value !== undefined && <Box><Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Potential</Typography><Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'warning.main' }}>${run.outputs.value_metrics.potential_value.toLocaleString()}</Typography></Box>}
                  {run.outputs.value_metrics.lost_value !== undefined && <Box><Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Lost</Typography><Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'error.main' }}>${run.outputs.value_metrics.lost_value.toLocaleString()}</Typography></Box>}
                </Box>
              </Box>
            </Box>
          )}

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary' }}>Run Details</Typography>
            <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'grid', gap: 1 }}>
                <Box><Typography variant="caption" sx={{ color: 'text.secondary' }}>Run ID</Typography><Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 11 }}>{run.run_id ?? run.id}</Typography></Box>
                {run.created_at && <Box><Typography variant="caption" sx={{ color: 'text.secondary' }}>Created</Typography><Typography variant="body2">{new Date(run.created_at).toLocaleString()}</Typography></Box>}
                <Box><Typography variant="caption" sx={{ color: 'text.secondary' }}>Practice</Typography><Typography variant="body2" sx={{ color: practiceName ? 'text.primary' : 'text.secondary' }}>{practiceName || 'Not assigned'}</Typography></Box>
                {run.transcript_id && <Box><Typography variant="caption" sx={{ color: 'text.secondary' }}>Transcript ID</Typography><Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 11 }}>{run.transcript_id}</Typography></Box>}
                {hasHITL && run.prompt_hitl && <Box><Typography variant="caption" sx={{ color: 'text.secondary' }}>HITL Verified</Typography><Typography variant="body2" sx={{ color: 'success.main' }}>{new Date(run.prompt_hitl.verified_at).toLocaleString()}</Typography></Box>}
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
