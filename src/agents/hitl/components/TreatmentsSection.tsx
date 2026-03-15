/**
 * Treatments Section
 *
 * Displays today's treatments with include/exclude options.
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
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { TreatmentDraft } from '../types';

interface TreatmentsSectionProps {
  treatments: TreatmentDraft[];
  onUpdateTreatment: (id: string, updates: Partial<TreatmentDraft>) => void;
  onAddTreatment: (treatment: Omit<TreatmentDraft, 'id' | 'source'>) => void;
  onRemoveTreatment: (id: string) => void;
}

export function TreatmentsSection({
  treatments,
  onUpdateTreatment,
  onAddTreatment,
  onRemoveTreatment,
}: TreatmentsSectionProps) {
  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; id: string } | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newTreatment, setNewTreatment] = useState<Partial<TreatmentDraft>>({
    name: '',
    area: '',
    details: '',
    cost: '',
    status: 'performed',
    included: true,
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setMenuAnchor({ el: event.currentTarget, id });
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleStatusChange = (id: string, status: TreatmentDraft['status']) => {
    onUpdateTreatment(id, { status });
    handleMenuClose();
  };

  const handleAddTreatment = () => {
    if (newTreatment.name) {
      onAddTreatment({
        name: newTreatment.name || '',
        area: newTreatment.area || '',
        details: newTreatment.details || '',
        cost: newTreatment.cost || '',
        status: newTreatment.status || 'performed',
        included: true,
      });
      setNewTreatment({
        name: '',
        area: '',
        details: '',
        cost: '',
        status: 'performed',
        included: true,
      });
      setAddDialogOpen(false);
    }
  };

  const statusColors: Record<TreatmentDraft['status'], 'success' | 'info' | 'warning'> = {
    performed: 'success',
    scheduled: 'info',
    agreed: 'warning',
  };

  const statusLabels: Record<TreatmentDraft['status'], string> = {
    performed: 'Performed',
    scheduled: 'Scheduled',
    agreed: 'Agreed',
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Today's Treatment Plan
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
          >
            Add Treatment
          </Button>
        </Box>

        {treatments.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No treatments extracted. Add treatments manually.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {treatments.map((treatment) => (
              <Box
                key={treatment.id}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  p: 2,
                  border: 1,
                  borderColor: treatment.included ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  bgcolor: treatment.included ? 'action.selected' : 'transparent',
                  opacity: treatment.included ? 1 : 0.6,
                }}
              >
                <Checkbox
                  checked={treatment.included}
                  onChange={(e) => onUpdateTreatment(treatment.id, { included: e.target.checked })}
                />

                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {treatment.name}
                    </Typography>
                    <Chip
                      label={statusLabels[treatment.status]}
                      size="small"
                      color={statusColors[treatment.status]}
                      variant="outlined"
                    />
                    {treatment.source === 'manual' && (
                      <Chip label="Manual" size="small" variant="outlined" />
                    )}
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    {treatment.area}
                    {treatment.details && ` - ${treatment.details}`}
                  </Typography>

                  {treatment.cost && (
                    <Typography variant="body2" fontWeight={500} mt={0.5}>
                      {treatment.cost}
                    </Typography>
                  )}
                </Box>

                <IconButton size="small" onClick={(e) => handleMenuOpen(e, treatment.id)}>
                  <MoreVertIcon />
                </IconButton>
              </Box>
            ))}
          </Stack>
        )}

        {/* Total */}
        {treatments.filter(t => t.included).length > 0 && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle1" fontWeight={600}>
                Treatments Included: {treatments.filter(t => t.included).length}
              </Typography>
              <Typography variant="subtitle1" fontWeight={600}>
                Total: {calculateTotal(treatments.filter(t => t.included))}
              </Typography>
            </Stack>
          </Box>
        )}

        {/* Context Menu */}
        <Menu
          anchorEl={menuAnchor?.el}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => menuAnchor && handleStatusChange(menuAnchor.id, 'performed')}>
            Mark as Performed
          </MenuItem>
          <MenuItem onClick={() => menuAnchor && handleStatusChange(menuAnchor.id, 'scheduled')}>
            Mark as Scheduled
          </MenuItem>
          <MenuItem onClick={() => menuAnchor && handleStatusChange(menuAnchor.id, 'agreed')}>
            Mark as Agreed
          </MenuItem>
          <MenuItem divider />
          <MenuItem
            onClick={() => {
              if (menuAnchor) {
                onRemoveTreatment(menuAnchor.id);
                handleMenuClose();
              }
            }}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Remove
          </MenuItem>
        </Menu>

        {/* Add Treatment Dialog */}
        <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Treatment</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Treatment Name"
                value={newTreatment.name}
                onChange={(e) => setNewTreatment(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                required
              />
              <TextField
                label="Area"
                value={newTreatment.area}
                onChange={(e) => setNewTreatment(prev => ({ ...prev, area: e.target.value }))}
                fullWidth
                placeholder="e.g., Full face, Forehead"
              />
              <TextField
                label="Details"
                value={newTreatment.details}
                onChange={(e) => setNewTreatment(prev => ({ ...prev, details: e.target.value }))}
                fullWidth
                placeholder="e.g., 40 units"
              />
              <TextField
                label="Cost"
                value={newTreatment.cost}
                onChange={(e) => setNewTreatment(prev => ({ ...prev, cost: e.target.value }))}
                fullWidth
                placeholder="e.g., $500"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTreatment} variant="contained" disabled={!newTreatment.name}>
              Add Treatment
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function calculateTotal(treatments: TreatmentDraft[]): string {
  const total = treatments.reduce((sum, t) => {
    const cost = parseFloat(t.cost.replace(/[^0-9.]/g, '')) || 0;
    return sum + cost;
  }, 0);

  return total > 0 ? `$${total.toLocaleString()}` : '--';
}
