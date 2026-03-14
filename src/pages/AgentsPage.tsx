import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { agentsApi } from 'apiServices';
import type { Agent } from 'apiServices';

export function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    agentsApi
      .list()
      .then(setAgents)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Agents
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {agents.length} available agent{agents.length !== 1 ? 's' : ''} for downstream processing
      </Typography>

      {agents.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <SmartToyIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              No agents configured
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add agents in the prompt-runner backend configuration.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {agents.map((agent) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={agent.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        backgroundColor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <SmartToyIcon sx={{ color: '#fff' }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {agent.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                        <Chip label={agent.type} size="small" />
                        <Chip label={agent.id} size="small" variant="outlined" />
                      </Box>
                      {agent.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {agent.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
