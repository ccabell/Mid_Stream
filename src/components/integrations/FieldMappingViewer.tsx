import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Collapse,
  Tooltip,
  useTheme,
  alpha,
  Divider,
  Stack,
} from '@mui/material';
import {
  KeyboardArrowDown as ExpandIcon,
  KeyboardArrowUp as CollapseIcon,
  ArrowForward as OutboundIcon,
  ArrowBack as InboundIcon,
  SyncAlt as BidirectionalIcon,
  Info as InfoIcon,
  CheckCircle as RequiredIcon,
  RadioButtonUnchecked as OptionalIcon,
} from '@mui/icons-material';
import type { EntityMapping, FieldMapping, SyncDirection } from '../../types/integration';

interface FieldMappingViewerProps {
  entityMappings: EntityMapping[];
  selectedMapping?: EntityMapping | null;
  onMappingSelect?: (mapping: EntityMapping | null) => void;
}

function DirectionChip({ direction }: { direction: SyncDirection }) {
  const theme = useTheme();

  const config = {
    inbound: {
      icon: <InboundIcon fontSize="small" />,
      label: 'Inbound',
      color: theme.palette.info.main,
    },
    outbound: {
      icon: <OutboundIcon fontSize="small" />,
      label: 'Outbound',
      color: theme.palette.success.main,
    },
    bidirectional: {
      icon: <BidirectionalIcon fontSize="small" />,
      label: 'Bidirectional',
      color: theme.palette.warning.main,
    },
  }[direction];

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      size="small"
      sx={{
        bgcolor: alpha(config.color, 0.1),
        color: config.color,
        fontWeight: 500,
        '& .MuiChip-icon': { color: config.color },
      }}
    />
  );
}

function FieldMappingRow({ field }: { field: FieldMapping }) {
  const theme = useTheme();

  return (
    <TableRow
      sx={{
        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
      }}
    >
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={1}>
          {field.required ? (
            <Tooltip title="Required field">
              <RequiredIcon fontSize="small" color="error" />
            </Tooltip>
          ) : (
            <Tooltip title="Optional field">
              <OptionalIcon fontSize="small" sx={{ color: 'text.disabled' }} />
            </Tooltip>
          )}
          <Box>
            <Typography variant="body2" fontWeight="medium" fontFamily="monospace">
              {field.a360Field}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {field.a360FieldType}
            </Typography>
          </Box>
        </Stack>
      </TableCell>

      <TableCell align="center">
        <DirectionChip direction={field.syncDirection} />
      </TableCell>

      <TableCell>
        <Box>
          <Typography variant="body2" fontWeight="medium" fontFamily="monospace">
            {field.externalField}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {field.externalFieldType}
          </Typography>
        </Box>
      </TableCell>

      <TableCell>
        {field.notes && (
          <Tooltip title={field.notes}>
            <Chip
              icon={<InfoIcon fontSize="small" />}
              label={field.notes.length > 30 ? `${field.notes.substring(0, 30)}...` : field.notes}
              size="small"
              variant="outlined"
              sx={{ maxWidth: 200 }}
            />
          </Tooltip>
        )}
        {field.transform && (
          <Chip
            label={`Transform: ${field.transform}`}
            size="small"
            color="secondary"
            sx={{ ml: field.notes ? 1 : 0 }}
          />
        )}
      </TableCell>
    </TableRow>
  );
}

function EntityMappingCard({
  mapping,
  isExpanded,
  onToggle,
}: {
  mapping: EntityMapping;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const theme = useTheme();

  const getIntegrationColor = (type: string) => {
    switch (type) {
      case 'zenoti': return '#f59e0b';
      case 'ghl': return '#10b981';
      case 'nextech': return '#8b5cf6';
      default: return theme.palette.primary.main;
    }
  };

  const integrationColor = getIntegrationColor(mapping.integrationType);

  return (
    <Paper
      elevation={isExpanded ? 4 : 1}
      sx={{
        mb: 2,
        border: `1px solid ${isExpanded ? integrationColor : theme.palette.divider}`,
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.2s',
      }}
    >
      {/* Header */}
      <Box
        onClick={onToggle}
        sx={{
          p: 2,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: isExpanded ? alpha(integrationColor, 0.05) : 'transparent',
          '&:hover': { bgcolor: alpha(integrationColor, 0.08) },
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          {/* A360 Entity */}
          <Box
            sx={{
              px: 2,
              py: 1,
              bgcolor: alpha('#6366f1', 0.1),
              borderRadius: 1,
              border: '1px solid #6366f1',
            }}
          >
            <Typography variant="body2" fontWeight="bold" color="#6366f1">
              {mapping.a360Entity}
            </Typography>
          </Box>

          {/* Arrow with sync direction */}
          <DirectionChip direction={mapping.syncDirection} />

          {/* External Entity */}
          <Box
            sx={{
              px: 2,
              py: 1,
              bgcolor: alpha(integrationColor, 0.1),
              borderRadius: 1,
              border: `1px solid ${integrationColor}`,
            }}
          >
            <Typography variant="body2" fontWeight="bold" sx={{ color: integrationColor }}>
              {mapping.externalEntity}
            </Typography>
          </Box>

          {/* Integration badge */}
          <Chip
            label={mapping.integrationType.toUpperCase()}
            size="small"
            sx={{
              bgcolor: integrationColor,
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            {mapping.fieldMappings.length} fields
          </Typography>
          <IconButton size="small">
            {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
          </IconButton>
        </Stack>
      </Box>

      {/* Description */}
      {isExpanded && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {mapping.description}
          </Typography>
        </Box>
      )}

      <Divider />

      {/* Field Mappings Table */}
      <Collapse in={isExpanded}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.grey[500], 0.08) }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#6366f1' }}>
                  A360 Field
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Direction
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: integrationColor }}>
                  {mapping.integrationType.charAt(0).toUpperCase() + mapping.integrationType.slice(1)} Field
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  Notes
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mapping.fieldMappings.map((field) => (
                <FieldMappingRow key={field.id} field={field} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Collapse>
    </Paper>
  );
}

export function FieldMappingViewer({
  entityMappings,
  selectedMapping,
  onMappingSelect,
}: FieldMappingViewerProps) {
  const [expandedMappings, setExpandedMappings] = useState<Set<string>>(
    new Set(selectedMapping ? [selectedMapping.id] : [])
  );

  const toggleMapping = (mappingId: string) => {
    setExpandedMappings((prev) => {
      const next = new Set(prev);
      if (next.has(mappingId)) {
        next.delete(mappingId);
      } else {
        next.add(mappingId);
      }
      return next;
    });

    // Notify parent of selection
    if (onMappingSelect) {
      const mapping = entityMappings.find(m => m.id === mappingId);
      onMappingSelect(expandedMappings.has(mappingId) ? null : mapping || null);
    }
  };

  // Group by integration type
  const groupedMappings = entityMappings.reduce<Record<string, EntityMapping[]>>((acc, mapping) => {
    const key = mapping.integrationType;
    const existing = acc[key] ?? [];
    return { ...acc, [key]: [...existing, mapping] };
  }, {});

  return (
    <Box>
      {Object.entries(groupedMappings).map(([integrationType, mappings]) => (
        <Box key={integrationType} sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textTransform: 'capitalize',
            }}
          >
            <Chip
              label={integrationType.toUpperCase()}
              size="small"
              sx={{
                bgcolor: integrationType === 'zenoti' ? '#f59e0b' : '#10b981',
                color: 'white',
                fontWeight: 'bold',
              }}
            />
            Entity Mappings
          </Typography>

          {mappings.map((mapping) => (
            <EntityMappingCard
              key={mapping.id}
              mapping={mapping}
              isExpanded={expandedMappings.has(mapping.id)}
              onToggle={() => toggleMapping(mapping.id)}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
}

export default FieldMappingViewer;
