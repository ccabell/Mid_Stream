/**
 * Patient Summary Section
 *
 * Displays and allows verification of patient concerns, goals, and timeline.
 */

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import VerifiedIcon from '@mui/icons-material/Verified';
import ScheduleIcon from '@mui/icons-material/Schedule';
import type { PatientSummaryDraft, VerifiableField } from '../types';

interface PatientSummarySectionProps {
  data: PatientSummaryDraft;
  onVerifyField: (fieldPath: string) => void;
  onVerifyAll: () => void;
  onUpdateField: (field: keyof PatientSummaryDraft, value: unknown) => void;
}

export function PatientSummarySection({
  data,
  onVerifyField,
  onVerifyAll,
  onUpdateField,
}: PatientSummarySectionProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleStartEdit = (fieldPath: string, currentValue: string) => {
    setEditingField(fieldPath);
    setEditValue(currentValue);
  };

  const handleSaveEdit = (fieldPath: string) => {
    const parts = fieldPath.split('.');

    if (parts[0] === 'primaryConcern') {
      onUpdateField('primaryConcern', {
        ...data.primaryConcern,
        value: editValue,
        edited: true,
        verified: true,
      });
    } else if (parts[0] === 'secondaryConcerns' && parts[1]) {
      const index = parseInt(parts[1], 10);
      const newConcerns = [...data.secondaryConcerns];
      newConcerns[index] = { ...newConcerns[index], value: editValue, edited: true, verified: true };
      onUpdateField('secondaryConcerns', newConcerns);
    } else if (parts[0] === 'goals' && parts[1]) {
      const index = parseInt(parts[1], 10);
      const newGoals = [...data.goals];
      newGoals[index] = { ...newGoals[index], value: editValue, edited: true, verified: true };
      onUpdateField('goals', newGoals);
    }

    setEditingField(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const renderVerifiableItem = (
    item: VerifiableField<string>,
    fieldPath: string,
    label?: string
  ) => {
    const isEditing = editingField === fieldPath;

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
          py: 0.5,
          '&:hover .edit-button': { opacity: 1 },
        }}
      >
        <Checkbox
          checked={item.verified}
          onChange={() => onVerifyField(fieldPath)}
          size="small"
          sx={{ mt: -0.5 }}
        />

        {isEditing ? (
          <Box sx={{ flex: 1, display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <TextField
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              size="small"
              multiline
              fullWidth
              autoFocus
            />
            <IconButton size="small" onClick={() => handleSaveEdit(fieldPath)} color="primary">
              <CheckIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleCancelEdit}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <>
            <Box sx={{ flex: 1 }}>
              {label && (
                <Typography variant="caption" color="text.secondary" display="block">
                  {label}
                </Typography>
              )}
              <Typography
                variant="body2"
                sx={{
                  fontStyle: item.edited ? 'italic' : 'normal',
                  color: item.verified ? 'text.primary' : 'text.secondary',
                }}
              >
                "{item.value}"
              </Typography>
              {item.edited && (
                <Typography variant="caption" color="info.main">
                  (Edited from: "{item.original}")
                </Typography>
              )}
            </Box>

            <Stack direction="row" spacing={0.5}>
              {item.verified && (
                <Tooltip title="Verified">
                  <VerifiedIcon fontSize="small" color="success" />
                </Tooltip>
              )}
              <IconButton
                size="small"
                className="edit-button"
                sx={{ opacity: 0, transition: 'opacity 0.2s' }}
                onClick={() => handleStartEdit(fieldPath, item.value)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Stack>
          </>
        )}
      </Box>
    );
  };

  const urgencyColor = data.timeline.urgency === 'high' ? 'error' :
                       data.timeline.urgency === 'medium' ? 'warning' : 'default';

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            What The Patient Told Us
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<VerifiedIcon />}
            onClick={onVerifyAll}
          >
            Verify All
          </Button>
        </Box>

        {/* Primary Concern */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Primary Concern
          </Typography>
          {renderVerifiableItem(data.primaryConcern, 'primaryConcern')}
        </Box>

        {/* Secondary Concerns */}
        {data.secondaryConcerns.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Secondary Concerns
            </Typography>
            {data.secondaryConcerns.map((concern, index) => (
              <Box key={index}>
                {renderVerifiableItem(concern, `secondaryConcerns.${index}`)}
              </Box>
            ))}
          </Box>
        )}

        {/* Goals */}
        {data.goals.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Patient Goals
            </Typography>
            {data.goals.map((goal, index) => (
              <Box key={index}>
                {renderVerifiableItem(goal, `goals.${index}`)}
              </Box>
            ))}
          </Box>
        )}

        {/* Timeline */}
        {data.timeline.event && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <ScheduleIcon fontSize="small" color="action" />
              <Typography variant="body2">
                <strong>Event:</strong> {data.timeline.event}
                {data.timeline.timeframe && ` (${data.timeline.timeframe})`}
              </Typography>
              <Chip
                label={data.timeline.urgency.toUpperCase()}
                size="small"
                color={urgencyColor}
                variant="outlined"
              />
            </Stack>
          </Box>
        )}

        {/* Anticipated Outcomes */}
        {data.anticipatedOutcomes.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Anticipated Outcomes
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {data.anticipatedOutcomes.map((outcome, index) => (
                <Chip key={index} label={outcome} size="small" variant="outlined" />
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
