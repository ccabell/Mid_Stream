/**
 * Needs Attention Section
 *
 * Displays objections, hesitations, and concerns that need resolution.
 */

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
import CircularProgress from '@mui/material/CircularProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Alert from '@mui/material/Alert';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import type { NeedsAttentionDraft, ObjectionDraft, HesitationDraft, ConcernDraft } from '../types';
import { OBJECTION_ICONS, OBJECTION_LABELS } from '../types';

interface NeedsAttentionSectionProps {
  data: NeedsAttentionDraft;
  onUpdateObjectionStatus: (id: string, status: ObjectionDraft['status']) => void;
  onRequestSuggestedResponse: (id: string) => Promise<void>;
  onUpdateHesitationStatus: (id: string, status: HesitationDraft['status']) => void;
  onUpdateConcernStatus: (id: string, status: ConcernDraft['status']) => void;
}

export function NeedsAttentionSection({
  data,
  onUpdateObjectionStatus,
  onRequestSuggestedResponse,
  onUpdateHesitationStatus,
  onUpdateConcernStatus,
}: NeedsAttentionSectionProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);

  const totalItems =
    data.objections.length +
    data.hesitations.length +
    data.concerns.length;

  const unresolvedCount =
    data.objections.filter(o => o.status === 'unresolved').length +
    data.hesitations.filter(h => h.status === 'unresolved').length +
    data.concerns.filter(c => c.status === 'unaddressed').length;

  const handleRevealSuggestion = async (id: string) => {
    setExpandedSuggestion(id);
    await onRequestSuggestedResponse(id);
  };

  const statusColor = (status: string): 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'resolved':
      case 'addressed':
        return 'success';
      case 'partially_resolved':
      case 'acknowledged':
        return 'warning';
      default:
        return 'error';
    }
  };

  const renderObjection = (objection: ObjectionDraft) => (
    <Box
      key={objection.id}
      sx={{
        p: 2,
        border: 1,
        borderColor: objection.status === 'unresolved' ? 'warning.main' : 'divider',
        borderRadius: 1,
        bgcolor: objection.status === 'unresolved' ? 'warning.50' : 'transparent',
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Typography variant="h5" sx={{ width: 40, textAlign: 'center' }}>
          {OBJECTION_ICONS[objection.type]}
        </Typography>

        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
            <Typography variant="subtitle2" color="text.secondary">
              {OBJECTION_LABELS[objection.type]}
            </Typography>
            <Chip
              label={objection.status.replace('_', ' ')}
              size="small"
              color={statusColor(objection.status)}
              variant="outlined"
            />
          </Stack>

          <Typography variant="body1">
            "{objection.statement}"
          </Typography>

          {objection.resolution_approach && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Resolution: {objection.resolution_approach}
            </Typography>
          )}

          {/* Suggested Response */}
          <Collapse in={expandedSuggestion === objection.id}>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'info.50', borderRadius: 1, border: 1, borderColor: 'info.main' }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <LightbulbIcon color="info" fontSize="small" />
                <Typography variant="subtitle2" color="info.main">
                  Suggested Response
                </Typography>
              </Stack>
              {objection.suggestedResponseLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2">Generating response...</Typography>
                </Box>
              ) : (
                <Typography variant="body2">
                  {objection.suggestedResponse}
                </Typography>
              )}
            </Box>
          </Collapse>
        </Box>

        <Stack spacing={1} alignItems="flex-end">
          <ToggleButtonGroup
            value={objection.status}
            exclusive
            size="small"
            onChange={(_, value) => value && onUpdateObjectionStatus(objection.id, value)}
          >
            <ToggleButton value="resolved" color="success">
              <CheckCircleIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="partially_resolved" color="warning">
              <HelpOutlineIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="unresolved" color="error">
              <WarningIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>

          {!objection.suggestedResponse && expandedSuggestion !== objection.id && (
            <Button
              size="small"
              startIcon={<LightbulbIcon />}
              onClick={() => handleRevealSuggestion(objection.id)}
            >
              Get Suggestion
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );

  const renderHesitation = (hesitation: HesitationDraft) => (
    <Box
      key={hesitation.id}
      sx={{
        p: 2,
        border: 1,
        borderColor: hesitation.status === 'unresolved' ? 'warning.main' : 'divider',
        borderRadius: 1,
        bgcolor: hesitation.status === 'unresolved' ? 'warning.50' : 'transparent',
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Typography variant="h5" sx={{ width: 40, textAlign: 'center' }}>
          ⏳
        </Typography>

        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
            <Typography variant="subtitle2" color="text.secondary">
              {hesitation.topic}
            </Typography>
            <Chip
              label={hesitation.status.replace('_', ' ')}
              size="small"
              color={statusColor(hesitation.status)}
              variant="outlined"
            />
          </Stack>

          <Typography variant="body1">
            "{hesitation.statement}"
          </Typography>

          {hesitation.resolution_approach && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Resolution: {hesitation.resolution_approach}
            </Typography>
          )}
        </Box>

        <ToggleButtonGroup
          value={hesitation.status}
          exclusive
          size="small"
          onChange={(_, value) => value && onUpdateHesitationStatus(hesitation.id, value)}
        >
          <ToggleButton value="resolved" color="success">
            <CheckCircleIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="partially_resolved" color="warning">
            <HelpOutlineIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="unresolved" color="error">
            <WarningIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>
    </Box>
  );

  const renderConcern = (concern: ConcernDraft) => (
    <Box
      key={concern.id}
      sx={{
        p: 2,
        border: 1,
        borderColor: concern.status === 'unaddressed' ? 'warning.main' : 'divider',
        borderRadius: 1,
        bgcolor: concern.status === 'unaddressed' ? 'warning.50' : 'transparent',
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Typography variant="h5" sx={{ width: 40, textAlign: 'center' }}>
          ❓
        </Typography>

        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
            <Chip
              label={concern.category}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`raised by ${concern.raised_by}`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={concern.status}
              size="small"
              color={statusColor(concern.status)}
              variant="outlined"
            />
          </Stack>

          <Typography variant="body1">
            "{concern.concern}"
          </Typography>

          {concern.response && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Response: {concern.response}
            </Typography>
          )}
        </Box>

        <ToggleButtonGroup
          value={concern.status}
          exclusive
          size="small"
          onChange={(_, value) => value && onUpdateConcernStatus(concern.id, value)}
        >
          <ToggleButton value="addressed" color="success">
            <CheckCircleIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="acknowledged" color="warning">
            <HelpOutlineIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="unaddressed" color="error">
            <WarningIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>
    </Box>
  );

  if (totalItems === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Items Needing Attention
          </Typography>
          <Alert severity="success">
            No objections, hesitations, or concerns detected in this consultation.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Items Needing Attention
          </Typography>
          {unresolvedCount > 0 && (
            <Chip
              icon={<WarningIcon />}
              label={`${unresolvedCount} unresolved`}
              color="warning"
              size="small"
            />
          )}
        </Box>

        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <span>Objections</span>
                {data.objections.length > 0 && (
                  <Chip label={data.objections.length} size="small" />
                )}
              </Stack>
            }
          />
          <Tab
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <span>Hesitations</span>
                {data.hesitations.length > 0 && (
                  <Chip label={data.hesitations.length} size="small" />
                )}
              </Stack>
            }
          />
          <Tab
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <span>Concerns</span>
                {data.concerns.length > 0 && (
                  <Chip label={data.concerns.length} size="small" />
                )}
              </Stack>
            }
          />
        </Tabs>

        {activeTab === 0 && (
          <Stack spacing={2}>
            {data.objections.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No objections detected
              </Typography>
            ) : (
              data.objections.map(renderObjection)
            )}
          </Stack>
        )}

        {activeTab === 1 && (
          <Stack spacing={2}>
            {data.hesitations.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No hesitations detected
              </Typography>
            ) : (
              data.hesitations.map(renderHesitation)
            )}
          </Stack>
        )}

        {activeTab === 2 && (
          <Stack spacing={2}>
            {data.concerns.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No concerns detected
              </Typography>
            ) : (
              data.concerns.map(renderConcern)
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
