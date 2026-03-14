/**
 * Service Form Modal
 *
 * Modal for creating and editing practice library services.
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
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import PublicIcon from '@mui/icons-material/Public';
import { usePracticeLibraryStore, practiceLibrarySelectors } from 'stores/practiceLibraryStore';
import * as practiceLibraryApi from 'apiServices/practiceLibrary';
import { isGlobalLibrary, type PLService, type PriceTier, type CreatePLServicePayload } from 'apiServices/practiceLibrary/types';

// Service categories
const SERVICE_CATEGORIES = [
  'Injectables',
  'Laser Treatments',
  'Skin Treatments',
  'Body Contouring',
  'Consultations',
  'Wellness',
  'Other',
] as const;

const PRICE_TIERS: PriceTier[] = ['$', '$$', '$$$', '$$$$', '$$$$$'];

interface ServiceFormData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  price: string;
  price_tier: PriceTier | '';
  downtime: string;
  is_active: boolean;
  is_preferred: boolean;
  concerns_addressed: string;
  synergies: string;
  suggest_when: string;
  rationale_template: string;
}

const defaultValues: ServiceFormData = {
  title: '',
  description: '',
  category: '',
  subcategory: '',
  price: '',
  price_tier: '',
  downtime: '',
  is_active: true,
  is_preferred: false,
  concerns_addressed: '',
  synergies: '',
  suggest_when: '',
  rationale_template: '',
};

function parseArrayField(value: string): string[] {
  if (!value.trim()) return [];
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

function formatArrayField(arr: string[] | undefined): string {
  return arr?.join(', ') ?? '';
}

export function ServiceFormModal() {
  const isCreateModalOpen = usePracticeLibraryStore(practiceLibrarySelectors.selectIsCreateModalOpen);
  const isEditModalOpen = usePracticeLibraryStore(practiceLibrarySelectors.selectIsEditModalOpen);
  const selectedService = usePracticeLibraryStore(practiceLibrarySelectors.selectSelectedService);
  const selectedPracticeId = usePracticeLibraryStore(practiceLibrarySelectors.selectSelectedPracticeId);
  const isGlobalMode = usePracticeLibraryStore(practiceLibrarySelectors.selectIsGlobalLibraryMode);
  const activeTab = usePracticeLibraryStore(practiceLibrarySelectors.selectActiveTab);
  const actions = usePracticeLibraryStore(practiceLibrarySelectors.selectActions);

  const isOpen = (isCreateModalOpen || isEditModalOpen) && activeTab === 'services';
  const isEditMode = isEditModalOpen && selectedService !== null;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormData>({ defaultValues });

  // Reset form when modal opens/closes or when editing different service
  useEffect(() => {
    if (isOpen && isEditMode && selectedService) {
      reset({
        title: selectedService.title,
        description: selectedService.description ?? '',
        category: selectedService.category ?? '',
        subcategory: selectedService.subcategory ?? '',
        price: selectedService.price?.toString() ?? '',
        price_tier: selectedService.price_tier ?? '',
        downtime: selectedService.downtime ?? '',
        is_active: selectedService.is_active,
        is_preferred: selectedService.is_preferred,
        concerns_addressed: formatArrayField(selectedService.concerns_addressed),
        synergies: formatArrayField(selectedService.synergies),
        suggest_when: formatArrayField(selectedService.suggest_when),
        rationale_template: selectedService.rationale_template ?? '',
      });
    } else if (isOpen && !isEditMode) {
      reset(defaultValues);
    }
  }, [isOpen, isEditMode, selectedService, reset]);

  const handleClose = () => {
    if (isEditModalOpen) {
      actions.closeEditModal();
      actions.setSelectedService(null);
    } else {
      actions.closeCreateModal();
    }
  };

  const onSubmit = async (data: ServiceFormData) => {
    if (!selectedPracticeId) return;

    const isGlobal = isGlobalLibrary(selectedPracticeId);

    const basePayload = {
      title: data.title,
      description: data.description || null,
      category: data.category || null,
      subcategory: data.subcategory || null,
      price: data.price ? parseFloat(data.price) : null,
      price_tier: data.price_tier || null,
      downtime: data.downtime || null,
      is_active: data.is_active,
      is_preferred: data.is_preferred,
      concerns_addressed: parseArrayField(data.concerns_addressed),
      synergies: parseArrayField(data.synergies),
      suggest_when: parseArrayField(data.suggest_when),
      rationale_template: data.rationale_template || null,
    };

    try {
      if (isGlobal) {
        // Global library CRUD
        if (isEditMode && selectedService) {
          await practiceLibraryApi.updateGLService(selectedService.id, basePayload);
        } else {
          await practiceLibraryApi.createGLService(basePayload);
        }
        // Reload global services
        const updatedServices = await practiceLibraryApi.getGLServices();
        actions.setServices(updatedServices);
      } else {
        // Practice library CRUD
        const payload: CreatePLServicePayload = {
          ...basePayload,
          practice_id: selectedPracticeId!,
        };
        if (isEditMode && selectedService) {
          await practiceLibraryApi.updatePLService(selectedService.id, payload);
        } else {
          await practiceLibraryApi.createPLService(payload);
        }
        // Reload practice services
        const updatedServices = await practiceLibraryApi.getPLServices({
          practice_id: selectedPracticeId!,
        });
        actions.setServices(updatedServices);
      }

      handleClose();
    } catch (error) {
      console.error('Failed to save service:', error);
      // TODO: Show error toast
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isGlobalMode && <PublicIcon color="primary" />}
            <Typography variant="h6">
              {isEditMode ? 'Edit Service' : 'Add Service'}
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
            {/* Title */}
            <Controller
              name="title"
              control={control}
              rules={{ required: 'Title is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Service Title"
                  placeholder="e.g., Botox Treatment"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  fullWidth
                  required
                />
              )}
            />

            {/* Description */}
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  placeholder="Brief description of the service"
                  multiline
                  rows={2}
                  fullWidth
                />
              )}
            />

            {/* Category & Subcategory */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select {...field} label="Category">
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {SERVICE_CATEGORIES.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="subcategory"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Subcategory"
                    placeholder="e.g., Neurotoxins"
                    fullWidth
                  />
                )}
              />
            </Box>

            {/* Price & Price Tier */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="price"
                control={control}
                rules={{
                  validate: (value) =>
                    !value || !isNaN(parseFloat(value)) || 'Must be a valid number',
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Price"
                    placeholder="e.g., 750"
                    type="number"
                    error={!!errors.price}
                    helperText={errors.price?.message}
                    InputProps={{ startAdornment: <span style={{ marginRight: 4 }}>$</span> }}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="price_tier"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Price Tier</InputLabel>
                    <Select {...field} label="Price Tier">
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {PRICE_TIERS.map((tier) => (
                        <MenuItem key={tier} value={tier}>
                          {tier}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="downtime"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Downtime"
                    placeholder="e.g., None, 1-2 days"
                    fullWidth
                  />
                )}
              />
            </Box>

            {/* Concerns Addressed */}
            <Controller
              name="concerns_addressed"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Concerns Addressed"
                  placeholder="e.g., wrinkles, fine lines, crow's feet (comma-separated)"
                  helperText="Enter concerns separated by commas"
                  fullWidth
                />
              )}
            />

            {/* Synergies */}
            <Controller
              name="synergies"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Synergies"
                  placeholder="e.g., Filler, Chemical Peel (comma-separated)"
                  helperText="Services that work well with this one"
                  fullWidth
                />
              )}
            />

            {/* Suggest When */}
            <Controller
              name="suggest_when"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Suggest When"
                  placeholder="e.g., patient mentions forehead lines (comma-separated)"
                  helperText="Triggers for suggesting this service"
                  fullWidth
                />
              )}
            />

            {/* Rationale Template */}
            <Controller
              name="rationale_template"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Rationale Template"
                  placeholder="Template for explaining why this service is recommended"
                  multiline
                  rows={2}
                  fullWidth
                />
              )}
            />

            {/* Switches */}
            <Box sx={{ display: 'flex', gap: 4 }}>
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={field.onChange} />}
                    label="Active"
                  />
                )}
              />

              <Controller
                name="is_preferred"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={field.onChange} color="warning" />}
                    label="Preferred"
                  />
                )}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add Service'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
