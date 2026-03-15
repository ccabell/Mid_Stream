/**
 * Streaming Section Component
 *
 * Displays a single TCP section with streaming text and controls.
 */

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Alert from '@mui/material/Alert';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TokenIcon from '@mui/icons-material/Token';
import { useState } from 'react';
import type { TCPSectionId, SectionState } from '../types';
import { SECTION_LABELS, SECTION_DESCRIPTIONS } from '../types';
import { StreamingText } from './StreamingText';

interface StreamingSectionProps {
  sectionId: TCPSectionId;
  section: SectionState;
  isActive: boolean;
  onEdit?: (sectionId: TCPSectionId) => void;
  onRetry?: (sectionId: TCPSectionId) => void;
}

export function StreamingSection({
  sectionId,
  section,
  isActive,
  onEdit,
  onRetry,
}: StreamingSectionProps) {
  const [expanded, setExpanded] = useState(true);

  const isStreaming = section.status === 'streaming';
  const isComplete = section.status === 'completed';
  const hasError = section.status === 'error';
  const isPending = section.status === 'pending';

  const getBorderColor = () => {
    if (isActive) return 'primary.main';
    if (isComplete) return 'success.main';
    if (hasError) return 'error.main';
    return 'divider';
  };

  const getStatusChip = () => {
    if (isStreaming) {
      return <Chip label="Generating..." color="primary" size="small" />;
    }
    if (isComplete) {
      return (
        <Chip
          icon={<CheckCircleIcon />}
          label={section.isEdited ? 'Edited' : 'Complete'}
          color="success"
          size="small"
          variant={section.isEdited ? 'outlined' : 'filled'}
        />
      );
    }
    if (hasError) {
      return <Chip icon={<ErrorIcon />} label="Error" color="error" size="small" />;
    }
    return <Chip label="Pending" size="small" variant="outlined" />;
  };

  const getDuration = () => {
    if (!section.startedAt) return null;
    const start = new Date(section.startedAt);
    const end = section.completedAt ? new Date(section.completedAt) : new Date();
    const seconds = Math.round((end.getTime() - start.getTime()) / 1000);
    return `${seconds}s`;
  };

  return (
    <Paper
      elevation={isActive ? 4 : 1}
      sx={{
        border: 2,
        borderColor: getBorderColor(),
        borderRadius: 2,
        transition: 'all 0.3s ease',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: isActive ? 'primary.50' : 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {SECTION_LABELS[sectionId]}
            </Typography>
            {getStatusChip()}
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            {/* Duration */}
            {(isStreaming || isComplete) && getDuration() && (
              <Chip
                icon={<AccessTimeIcon />}
                label={getDuration()}
                size="small"
                variant="outlined"
              />
            )}

            {/* Token usage */}
            {section.tokenUsage && (
              <Chip
                icon={<TokenIcon />}
                label={`${section.tokenUsage.completionTokens} tokens`}
                size="small"
                variant="outlined"
              />
            )}

            {/* Actions */}
            {isComplete && onEdit && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(sectionId);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}

            {hasError && onRetry && (
              <Button
                size="small"
                startIcon={<RefreshIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onRetry(sectionId);
                }}
                color="error"
              >
                Retry
              </Button>
            )}

            {/* Expand/collapse */}
            <IconButton size="small">
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Stack>
        </Stack>

        {/* Description */}
        <Typography variant="caption" color="text.secondary">
          {SECTION_DESCRIPTIONS[sectionId]}
        </Typography>
      </Box>

      {/* Content */}
      <Collapse in={expanded}>
        <Box sx={{ p: 2 }}>
          {/* Pending state */}
          {isPending && (
            <Typography color="text.secondary" fontStyle="italic">
              Waiting to generate...
            </Typography>
          )}

          {/* Streaming or completed content */}
          {(isStreaming || isComplete) && section.streamingText && (
            <Box
              sx={{
                bgcolor: 'grey.50',
                borderRadius: 1,
                p: 2,
                maxHeight: 400,
                overflow: 'auto',
              }}
            >
              <StreamingText
                text={section.streamingText}
                isStreaming={isStreaming}
                variant="code"
              />
            </Box>
          )}

          {/* Error state */}
          {hasError && section.error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {section.error}
            </Alert>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}

export default StreamingSection;
