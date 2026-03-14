/**
 * Concern Form Modal
 *
 * Modal for creating and editing practice library concerns.
 * Supports both practice-specific and global library items.
 */

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import PublicIcon from '@mui/icons-material/Public';
import { usePracticeLibraryStore, practiceLibrarySelectors } from 'stores/practiceLibraryStore';
import * as practiceLibraryApi from 'apiServices/practiceLibrary';
import { isGlobalLibrary, type PLConcern, type ConcernCategory, type CreatePLConcernPayload } from 'apiServices/practiceLibrary/types';

// Concern categories with display labels
const CONCERN_CATEGORIES: { value: ConcernCategory; label: string }[] = [
  { value: 'aging', label: 'Aging' },
  { value: 'skin_quality', label: 'Skin Quality' },
  { value: 'pigmentation', label: 'Pigmentation' },
  { value: 'vascular', label: 'Vascular' },
  { value: 'acne', label: 'Acne' },
  { value: 'scarring', label: 'Scarring' },
  { value: 'body', label: 'Body' },
  { value: 'hair', label: 'Hair' },
  { value: 'wellness', label: 'Wellness' },
];

interface ConcernFormData {
  concern_id: string;
  label: string;
  category: ConcernCategory;
  maps_to_global: string;
  aliases: string;
  related_services: string;
  commonly_in_areas: string;
}

const defaultValues: ConcernFormData = {
  concern_id: '',
  label: '',
  category: 'aging',
  maps_to_global: '',
  aliases: '',
  related_services: '',
  commonly_in_areas: '',
};

function parseArrayField(value: string): string[] {
  if (!value.trim()) return [];
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

function formatArrayField(arr: string[] | undefined): string {
  return arr?.join(', ') ?? '';
}

function generateConcernId(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

export function ConcernFormModal() {
  const isCreateModalOpen = usePracticeLibraryStore(practiceLibrarySelectors.selectIsCreateModalOpen);
  const isEditModalOpen = usePracticeLibraryStore(practiceLibrarySelectors.selectIsEditModalOpen);
  const selectedConcern = usePracticeLibraryStore(practiceLibrarySelectors.selectSelectedConcern);
  const selectedPracticeId = usePracticeLibraryStore(practiceLibrarySelectors.selectSelectedPracticeId);
  const isGlobalMode = usePracticeLibraryStore(practiceLibrarySelectors.selectIsGlobalLibraryMode);
  const activeTab = usePracticeLibraryStore(practiceLibrarySelectors.selectActiveTab);
  const actions = usePracticeLibraryStore(practiceLibrarySelectors.selectActions);

  const isOpen = (isCreateModalOpen || isEditModalOpen) && activeTab === 'concerns';
  const isEditMode = isEditModalOpen && selectedConcern !== null;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ConcernFormData>({ defaultValues });

  const watchedLabel = watch('label');

  // Auto-generate concern_id from label when creating
  useEffect(() => {
    if (!isEditMode && watchedLabel) {
      setValue('concern_id', generateConcernId(watchedLabel));
    }
  }, [watchedLabel, isEditMode, setValue]);

  // Reset form when modal opens/closes or when editing different concern
  useEffect(() => {
    if (isOpen && isEditMode && selectedConcern) {
      reset({
        concern_id: selectedConcern.concern_id,
        label: selectedConcern.label,
        category: selectedConcern.category,
        maps_to_global: selectedConcern.maps_to_global ?? '',
        aliases: formatArrayField(selectedConcern.aliases),
        related_services: formatArrayField(selectedConcern.related_services),
        commonly_in_areas: formatArrayField(selectedConcern.commonly_in_areas),
      });
    } else if (isOpen && !isEditMode) {
      reset(defaultValues);
    }
  }, [isOpen, isEditMode, selectedConcern, reset]);

  const handleClose = () => {
    if (isEditModalOpen) {
      actions.closeEditModal();
      actions.setSelectedConcern(null);
    } else {
      actions.closeCreateModal();
    }
  };

  const onSubmit = async (data: ConcernFormData) => {
    if (!selectedPracticeId) return;

    const isGlobal = isGlobalLibrary(selectedPracticeId);
    // For global library, use empty string (API will treat as null)
    // For practice library, use actual practice_id
    const practiceIdValue = isGlobal ? '' : selectedPracticeId;

    const payload: CreatePLConcernPayload = {
      practice_id: practiceIdValue,
      concern_id: data.concern_id,
      label: data.label,
      category: data.category,
      maps_to_global: data.maps_to_global || null,
      aliases: parseArrayField(data.aliases),
      related_services: parseArrayField(data.related_services),
      commonly_in_areas: parseArrayField(data.commonly_in_areas),
    };

    try {
      if (isEditMode && selectedConcern) {
        await practiceLibraryApi.updatePLConcern(selectedConcern.id, payload);
      } else {
        await practiceLibraryApi.createPLConcern(payload);
      }

      // Reload concerns
      const updatedConcerns = await practiceLibraryApi.getPLConcerns({
        practice_id: isGlobal ? undefined : selectedPracticeId,
      });
      actions.setConcerns(updatedConcerns);

      handleClose();
    } catch (error) {
      console.error('Failed to save concern:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isGlobalMode && <PublicIcon color="primary" />}
            <Typography variant="h6">
              {isEditMode ? 'Edit Concern' : 'Add Concern'}
            </Typography>
            {isGlobalMode && (
              <Chip label="GLOBAL" size="small" color="primary" sx={{ ml: 1 }} />
            )}
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Label */}
            <Controller
              name="label"
              control={control}
              rules={{ required: 'Label is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Concern Label"
                  placeholder="e.g., Fine Lines"
                  error={!!errors.label}
                  helperText={errors.label?.message}
                  fullWidth
                  required
                />
              )}
            />

            {/* Concern ID & Category */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="concern_id"
                control={control}
                rules={{ required: 'Concern ID is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Concern ID"
                    placeholder="Auto-generated from label"
                    error={!!errors.concern_id}
                    helperText={errors.concern_id?.message || 'Unique identifier (auto-generated)'}
                    fullWidth
                    required
                    disabled={isEditMode}
                  />
                )}
              />

              <Controller
                name="category"
                control={control}
                rules={{ required: 'Category is required' }}
                render={({ field }) => (
                  <FormControl fullWidth required>
                    <InputLabel>Category</InputLabel>
                    <Select {...field} label="Category">
                      {CONCERN_CATEGORIES.map((cat) => (
                        <MenuItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Box>

            {/* Maps to Global */}
            {!isGlobalMode && (
              <Controller
                name="maps_to_global"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Maps to Global Concern"
                    placeholder="e.g., wrinkles"
                    helperText="Link to global concern ID for standardization"
                    fullWidth
                  />
                )}
              />
            )}

            {/* Aliases */}
            <Controller
              name="aliases"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Aliases"
                  placeholder="e.g., wrinkles, lines, creases (comma-separated)"
                  helperText="Alternative terms patients might use"
                  fullWidth
                />
              )}
            />

            {/* Related Services */}
            <Controller
              name="related_services"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Related Services"
                  placeholder="e.g., Botox, Filler, Laser (comma-separated)"
                  helperText="Services that address this concern"
                  fullWidth
                />
              )}
            />

            {/* Commonly In Areas */}
            <Controller
              name="commonly_in_areas"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Common Areas"
                  placeholder="e.g., forehead, around eyes (comma-separated)"
                  helperText="Body areas where this concern commonly appears"
                  fullWidth
                />
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add Concern'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
