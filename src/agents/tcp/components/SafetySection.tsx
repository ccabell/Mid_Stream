/**
 * Safety Protocols Section
 *
 * Handles clinical safety and coordination requirements.
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
import ListItemIcon from '@mui/material/ListItemIcon';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import GroupsIcon from '@mui/icons-material/Groups';

import type { ClinicalSafetyProtocols } from '../types';

interface SafetySectionProps {
  data: ClinicalSafetyProtocols;
  onUpdate: (data: Partial<ClinicalSafetyProtocols>) => void;
}

export function SafetySection({ data, onUpdate }: SafetySectionProps) {
  const [newCoordination, setNewCoordination] = useState('');
  const [newProtocol, setNewProtocol] = useState('');

  const handleAddCoordination = () => {
    if (newCoordination) {
      onUpdate({
        coordination_requirements: [...data.coordination_requirements, newCoordination],
      });
      setNewCoordination('');
    }
  };

  const handleRemoveCoordination = (index: number) => {
    onUpdate({
      coordination_requirements: data.coordination_requirements.filter((_, i) => i !== index),
    });
  };

  const handleAddProtocol = () => {
    if (newProtocol) {
      onUpdate({
        safety_protocols: [...data.safety_protocols, newProtocol],
      });
      setNewProtocol('');
    }
  };

  const handleRemoveProtocol = (index: number) => {
    onUpdate({
      safety_protocols: data.safety_protocols.filter((_, i) => i !== index),
    });
  };

  return (
    <Stack spacing={3}>
      {/* Coordination Requirements */}
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <GroupsIcon color="primary" />
          <Typography variant="h6">Coordination Requirements</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Team coordination and communication requirements.
        </Typography>

        <List>
          {data.coordination_requirements.map((item, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <IconButton edge="end" onClick={() => handleRemoveCoordination(index)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemIcon>
                <GroupsIcon color="action" />
              </ListItemIcon>
              <ListItemText primary={item} />
            </ListItem>
          ))}
        </List>

        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <TextField
            label="New Requirement"
            value={newCoordination}
            onChange={(e) => setNewCoordination(e.target.value)}
            fullWidth
            size="small"
            placeholder="Add coordination requirement"
          />
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddCoordination}
            disabled={!newCoordination}
          >
            Add
          </Button>
        </Stack>
      </Paper>

      {/* Safety Protocols */}
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <WarningIcon color="warning" />
          <Typography variant="h6">Safety Protocols</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Important safety information and protocols.
        </Typography>

        <List>
          {data.safety_protocols.map((item, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <IconButton edge="end" onClick={() => handleRemoveProtocol(index)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemIcon>
                <WarningIcon color="warning" />
              </ListItemIcon>
              <ListItemText primary={item} />
            </ListItem>
          ))}
        </List>

        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <TextField
            label="New Protocol"
            value={newProtocol}
            onChange={(e) => setNewProtocol(e.target.value)}
            fullWidth
            size="small"
            placeholder="Add safety protocol"
          />
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddProtocol}
            disabled={!newProtocol}
          >
            Add
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
