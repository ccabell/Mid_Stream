/**
 * Treatment Card Component
 *
 * Displays a single treatment with name, description, details, and cost.
 * Supports edit and delete actions.
 */

import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

import type { TreatmentItem } from '../types';

interface TreatmentCardProps {
  treatment: TreatmentItem;
  onUpdate: (updates: Partial<TreatmentItem>) => void;
  onRemove: () => void;
  editable?: boolean;
}

export function TreatmentCard({
  treatment,
  onUpdate,
  onRemove,
  editable = true,
}: TreatmentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editState, setEditState] = useState(treatment);

  const handleSave = () => {
    onUpdate(editState);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditState(treatment);
    setIsEditing(false);
  };

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              bgcolor: 'primary.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MedicalServicesIcon sx={{ color: 'primary.main' }} />
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            {isEditing ? (
              <Stack spacing={2}>
                <TextField
                  label="Treatment Name"
                  value={editState.name}
                  onChange={(e) => setEditState({ ...editState, name: e.target.value })}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Description"
                  value={editState.description}
                  onChange={(e) => setEditState({ ...editState, description: e.target.value })}
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                />
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Details"
                    value={editState.details}
                    onChange={(e) => setEditState({ ...editState, details: e.target.value })}
                    fullWidth
                    size="small"
                  />
                  <TextField
                    label="Cost"
                    value={editState.cost}
                    onChange={(e) => setEditState({ ...editState, cost: e.target.value })}
                    sx={{ width: 150 }}
                    size="small"
                  />
                </Stack>
              </Stack>
            ) : (
              <>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="subtitle1" fontWeight={600}>
                    {treatment.name}
                  </Typography>
                  {treatment.cost && (
                    <Typography variant="subtitle1" fontWeight={600} color="primary.main">
                      {treatment.cost}
                    </Typography>
                  )}
                </Stack>
                {treatment.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {treatment.description}
                  </Typography>
                )}
                {treatment.details && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {treatment.details}
                  </Typography>
                )}
              </>
            )}
          </Box>

          {editable && (
            <Stack direction="row">
              {isEditing ? (
                <>
                  <IconButton size="small" onClick={handleSave} color="primary">
                    <SaveIcon />
                  </IconButton>
                  <IconButton size="small" onClick={handleCancel}>
                    <CancelIcon />
                  </IconButton>
                </>
              ) : (
                <>
                  <IconButton size="small" onClick={() => setIsEditing(true)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={onRemove} color="error">
                    <DeleteIcon />
                  </IconButton>
                </>
              )}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
