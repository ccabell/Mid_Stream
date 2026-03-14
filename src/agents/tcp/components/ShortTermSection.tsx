/**
 * Short-Term Goals Section
 *
 * Handles short-term treatments and follow-up schedule.
 */

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import AddIcon from '@mui/icons-material/Add';

import type { ShortTermGoals, TreatmentItem, FollowUpItem } from '../types';
import { TreatmentCard } from './TreatmentCard';
import { Timeline } from './Timeline';

interface ShortTermSectionProps {
  data: ShortTermGoals;
  onUpdate: (data: Partial<ShortTermGoals>) => void;
  onAddTreatment: (treatment: Omit<TreatmentItem, 'id'>) => void;
  onUpdateTreatment: (id: string, updates: Partial<TreatmentItem>) => void;
  onRemoveTreatment: (id: string) => void;
  onAddFollowUp: (item: FollowUpItem) => void;
  onUpdateFollowUp: (index: number, item: FollowUpItem) => void;
  onRemoveFollowUp: (index: number) => void;
}

export function ShortTermSection({
  data,
  onUpdate,
  onAddTreatment,
  onUpdateTreatment,
  onRemoveTreatment,
  onAddFollowUp,
  onUpdateFollowUp,
  onRemoveFollowUp,
}: ShortTermSectionProps) {
  const [newTreatment, setNewTreatment] = useState({ name: '', description: '', details: '', cost: '' });

  const handleAddTreatment = () => {
    if (newTreatment.name) {
      onAddTreatment(newTreatment);
      setNewTreatment({ name: '', description: '', details: '', cost: '' });
    }
  };

  const handleAddFollowUp = () => {
    onAddFollowUp({ event: '', date: '' });
  };

  return (
    <Stack spacing={3}>
      {/* Focus */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Short-Term Goals
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Treatments and goals for the coming weeks.
        </Typography>

        <TextField
          label="Focus"
          value={data.focus}
          onChange={(e) => onUpdate({ focus: e.target.value })}
          fullWidth
          placeholder="Primary focus for short-term goals"
          sx={{ mb: 3 }}
        />

        {/* Treatments */}
        <Typography variant="subtitle2" gutterBottom>
          Recommended Treatments
        </Typography>

        {data.treatments.map((treatment) => (
          <TreatmentCard
            key={treatment.id}
            treatment={treatment}
            onUpdate={(updates) => onUpdateTreatment(treatment.id!, updates)}
            onRemove={() => onRemoveTreatment(treatment.id!)}
          />
        ))}

        {/* Add Treatment Form */}
        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Add Treatment
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Treatment Name"
              value={newTreatment.name}
              onChange={(e) => setNewTreatment({ ...newTreatment, name: e.target.value })}
              fullWidth
              size="small"
            />
            <TextField
              label="Description"
              value={newTreatment.description}
              onChange={(e) => setNewTreatment({ ...newTreatment, description: e.target.value })}
              fullWidth
              size="small"
              multiline
              rows={2}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Details"
                value={newTreatment.details}
                onChange={(e) => setNewTreatment({ ...newTreatment, details: e.target.value })}
                fullWidth
                size="small"
              />
              <TextField
                label="Cost"
                value={newTreatment.cost}
                onChange={(e) => setNewTreatment({ ...newTreatment, cost: e.target.value })}
                sx={{ width: 150 }}
                size="small"
              />
            </Stack>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddTreatment}
              disabled={!newTreatment.name}
            >
              Add Treatment
            </Button>
          </Stack>
        </Paper>
      </Paper>

      {/* Follow-up Schedule */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Follow-Up Schedule
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Scheduled appointments and milestones.
        </Typography>

        <Timeline
          items={data.follow_up_schedule}
          onUpdate={onUpdateFollowUp}
          onRemove={onRemoveFollowUp}
        />

        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddFollowUp}
          sx={{ mt: 2 }}
        >
          Add Follow-Up
        </Button>
      </Paper>
    </Stack>
  );
}
