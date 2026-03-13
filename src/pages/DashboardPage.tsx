import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { runsApi, opportunitiesApi } from '@/api';
import type { Run, Opportunity } from '@/api';

export function DashboardPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([runsApi.list(), opportunitiesApi.list()])
      .then(([runsData, oppsData]) => {
        setRuns(runsData);
        setOpportunities(Array.isArray(oppsData) ? oppsData : []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Compute opportunity stats by stage
  const stages = ['New', 'In progress', 'Won', 'Lost'] as const;
  const oppsByStage = stages.map((stage) => ({
    stage,
    count: opportunities.filter((o) => o.stage === stage).length,
    value: opportunities
      .filter((o) => o.stage === stage)
      .reduce((sum, o) => sum + (o.value ?? 0), 0),
  }));

  const totalOpportunityValue = opportunities.reduce((sum, o) => sum + (o.value ?? 0), 0);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Total Runs
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {runs.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Opportunities
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {opportunities.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Won Deals
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                {oppsByStage.find((s) => s.stage === 'Won')?.count ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Pipeline Value
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                ${totalOpportunityValue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Opportunities by Stage
              </Typography>
              {opportunities.length > 0 ? (
                <BarChart
                  xAxis={[{ scaleType: 'band', data: stages as unknown as string[] }]}
                  series={[{ data: oppsByStage.map((s) => s.count), color: '#547BA3' }]}
                  height={250}
                />
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No opportunities data
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Pipeline Value by Stage
              </Typography>
              {opportunities.length > 0 ? (
                <PieChart
                  series={[
                    {
                      data: oppsByStage
                        .filter((s) => s.value > 0)
                        .map((s, i) => ({
                          id: i,
                          value: s.value,
                          label: s.stage,
                        })),
                      innerRadius: 40,
                      paddingAngle: 2,
                      cornerRadius: 4,
                    },
                  ]}
                  height={250}
                />
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No opportunities data
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
