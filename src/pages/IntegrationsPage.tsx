import { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Chip,
  Card,
  CardContent,
  Grid,
  alpha,
  useTheme,
  Divider,
} from '@mui/material';
import {
  AccountTree as DiagramIcon,
  TableChart as TableIcon,
  CloudSync as SyncIcon,
  CheckCircle as ConnectedIcon,
  Error as ErrorIcon,
  HelpOutline as NotConfiguredIcon,
} from '@mui/icons-material';
import DataFlowDiagram from '../components/integrations/DataFlowDiagram';
import FieldMappingViewer from '../components/integrations/FieldMappingViewer';
import {
  INTEGRATIONS,
  ENTITY_MAPPINGS,
  type IntegrationType,
  type EntityMapping,
  type Integration,
} from '../types/integration';

type ViewMode = 'diagram' | 'mappings';

function IntegrationStatusCard({ integration }: { integration: Integration }) {
  const theme = useTheme();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'connected':
        return {
          icon: <ConnectedIcon />,
          color: theme.palette.success.main,
          label: 'Connected',
        };
      case 'error':
        return {
          icon: <ErrorIcon />,
          color: theme.palette.error.main,
          label: 'Error',
        };
      case 'disconnected':
        return {
          icon: <ErrorIcon />,
          color: theme.palette.warning.main,
          label: 'Disconnected',
        };
      default:
        return {
          icon: <NotConfiguredIcon />,
          color: theme.palette.grey[500],
          label: 'Not Configured',
        };
    }
  };

  const getIntegrationColor = (type: string) => {
    switch (type) {
      case 'zenoti': return '#f59e0b';
      case 'ghl': return '#10b981';
      case 'nextech': return '#8b5cf6';
      default: return theme.palette.primary.main;
    }
  };

  const statusConfig = getStatusConfig(integration.status);
  const integrationColor = getIntegrationColor(integration.type);

  return (
    <Card
      sx={{
        border: `2px solid ${integrationColor}`,
        borderRadius: 2,
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {integration.name}
            </Typography>
            <Chip
              label={integration.type.toUpperCase()}
              size="small"
              sx={{
                bgcolor: integrationColor,
                color: 'white',
                fontWeight: 'bold',
                mt: 0.5,
              }}
            />
          </Box>
          <Chip
            icon={statusConfig.icon}
            label={statusConfig.label}
            size="small"
            sx={{
              bgcolor: alpha(statusConfig.color, 0.1),
              color: statusConfig.color,
              fontWeight: 600,
              '& .MuiChip-icon': { color: statusConfig.color },
            }}
          />
        </Stack>

        {integration.lastSyncAt && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Last sync: {new Date(integration.lastSyncAt).toLocaleString()}
          </Typography>
        )}

        {integration.errorMessage && (
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            {integration.errorMessage}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export function IntegrationsPage() {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('diagram');
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationType | 'all'>('all');
  const [selectedMapping, setSelectedMapping] = useState<EntityMapping | null>(null);

  const handleViewChange = (_: React.SyntheticEvent, newView: ViewMode | null) => {
    if (newView) setViewMode(newView);
  };

  const handleIntegrationFilter = (_: React.MouseEvent, newFilter: IntegrationType | 'all' | null) => {
    if (newFilter) setSelectedIntegration(newFilter);
  };

  const handleEntityClick = (mapping: EntityMapping) => {
    setSelectedMapping(mapping);
    setViewMode('mappings'); // Switch to mappings view to show detail
  };

  const filteredMappings = useMemo(() => {
    if (selectedIntegration === 'all') return ENTITY_MAPPINGS;
    return ENTITY_MAPPINGS.filter(m => m.integrationType === selectedIntegration);
  }, [selectedIntegration]);

  // Stats
  const stats = useMemo(() => {
    const totalMappings = ENTITY_MAPPINGS.length;
    const totalFields = ENTITY_MAPPINGS.reduce((sum, m) => sum + m.fieldMappings.length, 0);
    const connectedIntegrations = INTEGRATIONS.filter(i => i.status === 'connected').length;

    return { totalMappings, totalFields, connectedIntegrations };
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
          <SyncIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight="bold">
            Integration Data Flow
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Visualize and manage data mappings between A360 and external systems
        </Typography>
      </Box>

      {/* Integration Status Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {INTEGRATIONS.map((integration) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={integration.id}>
            <IntegrationStatusCard integration={integration} />
          </Grid>
        ))}
      </Grid>

      {/* Stats Bar */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
        <Stack direction="row" spacing={4} divider={<Divider orientation="vertical" flexItem />}>
          <Box>
            <Typography variant="h5" fontWeight="bold" color="primary">
              {stats.connectedIntegrations}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Connected Integrations
            </Typography>
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold" color="secondary">
              {stats.totalMappings}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Entity Mappings
            </Typography>
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ color: '#f59e0b' }}>
              {stats.totalFields}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Field Mappings
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
          {/* View Mode Toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewChange}
            size="small"
          >
            <ToggleButton value="diagram">
              <DiagramIcon sx={{ mr: 1 }} />
              Data Flow Diagram
            </ToggleButton>
            <ToggleButton value="mappings">
              <TableIcon sx={{ mr: 1 }} />
              Field Mappings
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Integration Filter */}
          <ToggleButtonGroup
            value={selectedIntegration}
            exclusive
            onChange={handleIntegrationFilter}
            size="small"
          >
            <ToggleButton value="all">
              All
            </ToggleButton>
            <ToggleButton value="zenoti" sx={{ color: '#f59e0b' }}>
              Zenoti
            </ToggleButton>
            <ToggleButton value="ghl" sx={{ color: '#10b981' }}>
              GHL
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Paper>

      {/* Main Content */}
      <Paper sx={{ p: 3 }}>
        {viewMode === 'diagram' ? (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Data Flow Visualization
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Click on an entity to view its field mappings. Animated lines show data flow direction.
            </Typography>
            <DataFlowDiagram
              selectedIntegration={selectedIntegration}
              entityMappings={filteredMappings}
              onEntityClick={handleEntityClick}
            />
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Entity & Field Mappings
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Click on a mapping to expand and see all field-level details.
            </Typography>
            <FieldMappingViewer
              entityMappings={filteredMappings}
              selectedMapping={selectedMapping}
              onMappingSelect={setSelectedMapping}
            />
          </Box>
        )}
      </Paper>

      {/* Legend */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Legend
        </Typography>
        <Stack direction="row" spacing={3} flexWrap="wrap">
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 16, height: 16, bgcolor: '#6366f1', borderRadius: 0.5 }} />
            <Typography variant="caption">A360 (Internal)</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 16, height: 16, bgcolor: '#f59e0b', borderRadius: 0.5 }} />
            <Typography variant="caption">Zenoti</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 16, height: 16, bgcolor: '#10b981', borderRadius: 0.5 }} />
            <Typography variant="caption">GoHighLevel</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 16, height: 16, bgcolor: '#8b5cf6', borderRadius: 0.5 }} />
            <Typography variant="caption">NexTech</Typography>
          </Stack>
          <Divider orientation="vertical" flexItem />
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption">→ Outbound</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption">← Inbound</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption">↔ Bidirectional</Typography>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}

export default IntegrationsPage;
