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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { runsApi } from '@/api';
import type { Run, V2Pass1Output, V2Pass2Output } from '@/api';
import { ROUTES } from '@/constants/routes';

export function RunDetailPage() {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) return;
    runsApi
      .getById(runId)
      .then(setRun)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [runId]);

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
        <Typography color="text.primary">Run {run.id.slice(0, 8)}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="h5">Run {run.id.slice(0, 8)}</Typography>
        <Chip
          label={run.status || 'Unknown'}
          color={run.status === 'success' || run.status === 'completed' ? 'success' : 'default'}
          size="small"
        />
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
