/**
 * Immediate Intervention Section
 *
 * Handles today's treatments and post-care instructions.
 */

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import type { ImmediateIntervention, TreatmentItem } from '../types';
import { TreatmentCard } from './TreatmentCard';

interface ImmediateSectionProps {
  data: ImmediateIntervention;
  postCare: string[];
  onUpdateImmediate: (data: Partial<ImmediateIntervention>) => void;
  onAddTreatment: (treatment: Omit<TreatmentItem, 'id'>) => void;
  onUpdateTreatment: (id: string, updates: Partial<TreatmentItem>) => void;
  onRemoveTreatment: (id: string) => void;
  onUpdatePostCare: (instructions: string[]) => void;
}

export function ImmediateSection({
  data,
  postCare,
  onUpdateImmediate,
  onAddTreatment,
  onUpdateTreatment,
  onRemoveTreatment,
  onUpdatePostCare,
}: ImmediateSectionProps) {
  const [newTreatment, setNewTreatment] = useState({ name: '', description: '', details: '', cost: '' });
  const [newInstruction, setNewInstruction] = useState('');

  const handleAddTreatment = () => {
    if (newTreatment.name) {
      onAddTreatment(newTreatment);
      setNewTreatment({ name: '', description: '', details: '', cost: '' });
    }
  };

  const handleAddInstruction = () => {
    if (newInstruction) {
      onUpdatePostCare([...postCare, newInstruction]);
      setNewInstruction('');
    }
  };

  const handleRemoveInstruction = (index: number) => {
    onUpdatePostCare(postCare.filter((_, i) => i !== index));
  };

  return (
    <Stack spacing={3}>
      {/* Focus */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Immediate Intervention
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Treatments performed or scheduled for today's visit.
        </Typography>

        <TextField
          label="Focus"
          value={data.focus}
          onChange={(e) => onUpdateImmediate({ focus: e.target.value })}
          fullWidth
          placeholder="Primary focus for today's intervention"
          sx={{ mb: 3 }}
        />

        {/* Treatments */}
        <Typography variant="subtitle2" gutterBottom>
          Treatments
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

      {/* Post-Care Instructions */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Post-Care Instructions
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Instructions for the patient to follow after treatment.
        </Typography>

        <List>
          {postCare.map((instruction, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <IconButton edge="end" onClick={() => handleRemoveInstruction(index)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText primary={instruction} />
            </ListItem>
          ))}
        </List>

        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <TextField
            label="New Instruction"
            value={newInstruction}
            onChange={(e) => setNewInstruction(e.target.value)}
            fullWidth
            size="small"
            placeholder="Add a post-care instruction"
          />
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddInstruction}
            disabled={!newInstruction}
          >
            Add
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
