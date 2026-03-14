import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box, Typography, Chip, Paper, useTheme, alpha } from '@mui/material';
import {
  Storage as StorageIcon,
  CloudSync as CloudSyncIcon,
  Person as PersonIcon,
  Event as EventIcon,
  MedicalServices as MedicalServicesIcon,
  Badge as BadgeIcon,
  Email as EmailIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import type { IntegrationType, IntegrationStatus, EntityMapping } from '../../types/integration';

interface DataFlowDiagramProps {
  selectedIntegration: IntegrationType | 'all';
  entityMappings: EntityMapping[];
  onEntityClick?: (mapping: EntityMapping) => void;
}

// Node data types
interface SystemNodeData extends Record<string, unknown> {
  label: string;
  system: string;
  status?: IntegrationStatus;
}

interface EntityNodeData extends Record<string, unknown> {
  label: string;
  system: string;
  fieldCount?: number;
  mappingId?: string;
}

// Custom node for systems (A360, Zenoti, GHL)
function SystemNode({ data }: { data: SystemNodeData }) {
  const theme = useTheme();

  const getStatusColor = (status: IntegrationStatus) => {
    switch (status) {
      case 'connected': return theme.palette.success.main;
      case 'disconnected': return theme.palette.error.main;
      case 'error': return theme.palette.warning.main;
      default: return theme.palette.grey[500];
    }
  };

  const getSystemColor = (system: string) => {
    switch (system) {
      case 'a360': return '#6366f1'; // Indigo
      case 'zenoti': return '#f59e0b'; // Amber
      case 'ghl': return '#10b981'; // Emerald
      case 'nextech': return '#8b5cf6'; // Purple
      default: return theme.palette.primary.main;
    }
  };

  return (
    <Paper
      elevation={4}
      sx={{
        p: 2,
        minWidth: 180,
        borderRadius: 2,
        border: `3px solid ${getSystemColor(data.system)}`,
        bgcolor: alpha(getSystemColor(data.system), 0.1),
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: getSystemColor(data.system) }} />
      <Handle type="source" position={Position.Right} style={{ background: getSystemColor(data.system) }} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {data.system === 'a360' ? (
          <StorageIcon sx={{ color: getSystemColor(data.system) }} />
        ) : (
          <CloudSyncIcon sx={{ color: getSystemColor(data.system) }} />
        )}
        <Typography variant="h6" fontWeight="bold">
          {data.label}
        </Typography>
      </Box>

      {data.status && (
        <Chip
          size="small"
          label={data.status}
          sx={{
            bgcolor: alpha(getStatusColor(data.status), 0.2),
            color: getStatusColor(data.status),
            fontWeight: 600,
            textTransform: 'capitalize',
          }}
        />
      )}
    </Paper>
  );
}

// Custom node for entities (Patient, Consultation, etc.)
function EntityNode({ data }: { data: EntityNodeData }) {
  const theme = useTheme();

  const getEntityIcon = (entity: string) => {
    const lower = entity.toLowerCase();
    if (lower.includes('patient') || lower.includes('guest') || lower.includes('contact')) {
      return <PersonIcon fontSize="small" />;
    }
    if (lower.includes('consultation') || lower.includes('appointment')) {
      return <EventIcon fontSize="small" />;
    }
    if (lower.includes('service') || lower.includes('product')) {
      return <MedicalServicesIcon fontSize="small" />;
    }
    if (lower.includes('user') || lower.includes('employee') || lower.includes('provider')) {
      return <BadgeIcon fontSize="small" />;
    }
    if (lower.includes('email')) {
      return <EmailIcon fontSize="small" />;
    }
    if (lower.includes('opportunity')) {
      return <TrendingUpIcon fontSize="small" />;
    }
    return <StorageIcon fontSize="small" />;
  };

  const getSystemColor = (system: string) => {
    switch (system) {
      case 'a360': return '#6366f1';
      case 'zenoti': return '#f59e0b';
      case 'ghl': return '#10b981';
      default: return theme.palette.grey[600];
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 1.5,
        minWidth: 140,
        borderRadius: 1.5,
        border: `2px solid ${getSystemColor(data.system)}`,
        bgcolor: 'background.paper',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: theme.shadows[6],
        },
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: getSystemColor(data.system) }} />
      <Handle type="source" position={Position.Right} style={{ background: getSystemColor(data.system) }} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ color: getSystemColor(data.system) }}>
          {getEntityIcon(data.label)}
        </Box>
        <Typography variant="body2" fontWeight="medium">
          {data.label}
        </Typography>
      </Box>
      {data.fieldCount && (
        <Typography variant="caption" color="text.secondary">
          {data.fieldCount} fields
        </Typography>
      )}
    </Paper>
  );
}

const nodeTypes = {
  system: SystemNode,
  entity: EntityNode,
};

export function DataFlowDiagram({ selectedIntegration, entityMappings, onEntityClick }: DataFlowDiagramProps) {
  const theme = useTheme();

  // Filter mappings based on selection
  const filteredMappings = useMemo(() => {
    if (selectedIntegration === 'all') return entityMappings;
    return entityMappings.filter(m => m.integrationType === selectedIntegration);
  }, [selectedIntegration, entityMappings]);

  // Generate nodes from entity mappings
  const initialNodes: Node[] = useMemo(() => {
    const nodes: Node[] = [];

    // System nodes
    nodes.push({
      id: 'a360',
      type: 'system',
      position: { x: 50, y: 200 },
      data: { label: 'A360', system: 'a360', status: 'connected' } as SystemNodeData,
    });

    if (selectedIntegration === 'all' || selectedIntegration === 'zenoti') {
      nodes.push({
        id: 'zenoti',
        type: 'system',
        position: { x: 600, y: 100 },
        data: { label: 'Zenoti', system: 'zenoti', status: 'not_configured' } as SystemNodeData,
      });
    }

    if (selectedIntegration === 'all' || selectedIntegration === 'ghl') {
      nodes.push({
        id: 'ghl',
        type: 'system',
        position: { x: 600, y: 300 },
        data: { label: 'GoHighLevel', system: 'ghl', status: 'connected' } as SystemNodeData,
      });
    }

    // Entity nodes for A360
    const a360Entities = new Set<string>();
    const externalEntities: { entity: string; system: string; mappingId: string; fieldCount: number }[] = [];

    filteredMappings.forEach(mapping => {
      a360Entities.add(mapping.a360Entity);
      externalEntities.push({
        entity: mapping.externalEntity,
        system: mapping.integrationType,
        mappingId: mapping.id,
        fieldCount: mapping.fieldMappings.length,
      });
    });

    // Position A360 entities
    let a360Y = 80;
    a360Entities.forEach(entity => {
      const mapping = filteredMappings.find(m => m.a360Entity === entity);
      nodes.push({
        id: `a360-${entity}`,
        type: 'entity',
        position: { x: 280, y: a360Y },
        data: {
          label: entity,
          system: 'a360',
          fieldCount: mapping?.fieldMappings.length,
          mappingId: mapping?.id,
        } as EntityNodeData,
      });
      a360Y += 80;
    });

    // Position external entities
    let zenotiY = 60;
    let ghlY = 260;
    externalEntities.forEach(({ entity, system, mappingId, fieldCount }) => {
      const y = system === 'zenoti' ? zenotiY : ghlY;
      nodes.push({
        id: `${system}-${entity}`,
        type: 'entity',
        position: { x: 450, y },
        data: {
          label: entity,
          system,
          fieldCount,
          mappingId,
        } as EntityNodeData,
      });
      if (system === 'zenoti') zenotiY += 70;
      else ghlY += 70;
    });

    return nodes;
  }, [filteredMappings, selectedIntegration]);

  // Generate edges from entity mappings
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];

    filteredMappings.forEach(mapping => {
      const sourceId = `a360-${mapping.a360Entity}`;
      const targetId = `${mapping.integrationType}-${mapping.externalEntity}`;

      // Determine edge direction and style based on sync direction
      const isOutbound = mapping.syncDirection === 'outbound';
      const isBidirectional = mapping.syncDirection === 'bidirectional';

      edges.push({
        id: `edge-${mapping.id}`,
        source: isOutbound ? sourceId : targetId,
        target: isOutbound ? targetId : sourceId,
        type: 'smoothstep',
        animated: true,
        style: {
          stroke: mapping.integrationType === 'zenoti' ? '#f59e0b' : '#10b981',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: mapping.integrationType === 'zenoti' ? '#f59e0b' : '#10b981',
        },
        markerStart: isBidirectional ? {
          type: MarkerType.ArrowClosed,
          color: mapping.integrationType === 'zenoti' ? '#f59e0b' : '#10b981',
        } : undefined,
        label: isBidirectional ? '↔' : (isOutbound ? '→' : '←'),
        labelStyle: { fill: theme.palette.text.secondary, fontWeight: 600 },
        labelBgStyle: { fill: theme.palette.background.paper },
      });
    });

    return edges;
  }, [filteredMappings, theme]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    const nodeData = node.data as unknown as EntityNodeData;
    if (node.type === 'entity' && nodeData.mappingId && onEntityClick) {
      const mapping = entityMappings.find(m => m.id === nodeData.mappingId);
      if (mapping) {
        onEntityClick(mapping);
      }
    }
  }, [entityMappings, onEntityClick]);

  const getNodeColor = useCallback((node: Node) => {
    const nodeData = node.data as unknown as SystemNodeData | EntityNodeData;
    if (nodeData?.system === 'a360') return '#6366f1';
    if (nodeData?.system === 'zenoti') return '#f59e0b';
    if (nodeData?.system === 'ghl') return '#10b981';
    return '#gray';
  }, []);

  return (
    <Box sx={{ height: 500, width: '100%', bgcolor: 'background.default', borderRadius: 2, overflow: 'hidden' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color={theme.palette.divider} gap={16} />
        <Controls />
        <MiniMap
          nodeColor={getNodeColor}
          maskColor={alpha(theme.palette.background.paper, 0.8)}
        />
      </ReactFlow>
    </Box>
  );
}

export default DataFlowDiagram;
