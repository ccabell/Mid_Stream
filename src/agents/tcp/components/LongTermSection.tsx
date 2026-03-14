/**
 * Long-Term Strategy Section
 *
 * Handles maintenance schedule and skincare routine.
 */

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import type { LongTermStrategy, MaintenanceItem, SkincareRoutine, SkincareStep } from '../types';

interface LongTermSectionProps {
  data: LongTermStrategy;
  onUpdate: (data: Partial<LongTermStrategy>) => void;
  onAddMaintenance: (item: MaintenanceItem) => void;
  onUpdateMaintenance: (index: number, item: MaintenanceItem) => void;
  onRemoveMaintenance: (index: number) => void;
  onUpdateSkincare: (routine: SkincareRoutine | null) => void;
}

export function LongTermSection({
  data,
  onUpdate,
  onAddMaintenance,
  onUpdateMaintenance,
  onRemoveMaintenance,
  onUpdateSkincare,
}: LongTermSectionProps) {
  const [newMaintenance, setNewMaintenance] = useState({ treatment: '', frequency: '' });
  const [includeSkincare, setIncludeSkincare] = useState(!!data.skincare_routine);

  const handleAddMaintenance = () => {
    if (newMaintenance.treatment && newMaintenance.frequency) {
      onAddMaintenance(newMaintenance);
      setNewMaintenance({ treatment: '', frequency: '' });
    }
  };

  const handleToggleSkincare = (checked: boolean) => {
    setIncludeSkincare(checked);
    if (checked && !data.skincare_routine) {
      onUpdateSkincare({
        morning: [],
        evening: [],
      });
    } else if (!checked) {
      onUpdateSkincare(null);
    }
  };

  return (
    <Stack spacing={3}>
      {/* Focus */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Long-Term Strategy
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Ongoing maintenance and care recommendations.
        </Typography>

        <TextField
          label="Focus"
          value={data.focus}
          onChange={(e) => onUpdate({ focus: e.target.value })}
          fullWidth
          placeholder="Primary focus for long-term maintenance"
          sx={{ mb: 3 }}
        />
      </Paper>

      {/* Maintenance Schedule */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Maintenance Schedule
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Regular treatments to maintain results.
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Treatment</TableCell>
                <TableCell>Frequency</TableCell>
                <TableCell width={60}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.maintenance_schedule.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <TextField
                      value={item.treatment}
                      onChange={(e) => onUpdateMaintenance(index, { ...item, treatment: e.target.value })}
                      size="small"
                      fullWidth
                      variant="standard"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={item.frequency}
                      onChange={(e) => onUpdateMaintenance(index, { ...item, frequency: e.target.value })}
                      size="small"
                      fullWidth
                      variant="standard"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => onRemoveMaintenance(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <TextField
            label="Treatment"
            value={newMaintenance.treatment}
            onChange={(e) => setNewMaintenance({ ...newMaintenance, treatment: e.target.value })}
            size="small"
            sx={{ flexGrow: 1 }}
          />
          <TextField
            label="Frequency"
            value={newMaintenance.frequency}
            onChange={(e) => setNewMaintenance({ ...newMaintenance, frequency: e.target.value })}
            size="small"
            sx={{ width: 200 }}
          />
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddMaintenance}
            disabled={!newMaintenance.treatment || !newMaintenance.frequency}
          >
            Add
          </Button>
        </Stack>
      </Paper>

      {/* Skincare Routine */}
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Skincare Routine
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Morning and evening skincare recommendations.
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={includeSkincare}
                onChange={(e) => handleToggleSkincare(e.target.checked)}
              />
            }
            label="Include"
          />
        </Stack>

        {includeSkincare && data.skincare_routine && (
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Morning Routine
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add products for morning skincare routine.
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Evening Routine
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add products for evening skincare routine.
              </Typography>
            </Box>
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}
