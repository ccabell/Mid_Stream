/**
 * Package Form Modal
 *
 * Modal for creating and editing practice library packages.
 * Supports both practice-specific and global library items.
 */

import { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import PublicIcon from '@mui/icons-material/Public';
import { usePracticeLibraryStore, practiceLibrarySelectors } from 'stores/practiceLibraryStore';
import * as practiceLibraryApi from 'apiServices/practiceLibrary';
import { getApiPracticeId, type PLPackage, type PLPackageItem, type CreatePLPackagePayload } from 'apiServices/practiceLibrary/types';

interface PackageItemFormData {
  item_type: 'service' | 'product';
  item_id: string;
  item_title: string;
  quantity: number;
  unit_price: number;
}

interface PackageFormData {
  name: string;
  description: string;
  package_price: string;
  is_active: boolean;
  is_featured: boolean;
  value_proposition: string;
  items: PackageItemFormData[];
}

const defaultValues: PackageFormData = {
  name: '',
  description: '',
  package_price: '',
  is_active: true,
  is_featured: false,
  value_proposition: '',
  items: [],
};

const emptyItem: PackageItemFormData = {
  item_type: 'service',
  item_id: '',
  item_title: '',
  quantity: 1,
  unit_price: 0,
};

export function PackageFormModal() {
  const isCreateModalOpen = usePracticeLibraryStore(practiceLibrarySelectors.selectIsCreateModalOpen);
  const isEditModalOpen = usePracticeLibraryStore(practiceLibrarySelectors.selectIsEditModalOpen);
  const selectedPackage = usePracticeLibraryStore(practiceLibrarySelectors.selectSelectedPackage);
  const selectedPracticeId = usePracticeLibraryStore(practiceLibrarySelectors.selectSelectedPracticeId);
  const isGlobalMode = usePracticeLibraryStore(practiceLibrarySelectors.selectIsGlobalLibraryMode);
  const activeTab = usePracticeLibraryStore(practiceLibrarySelectors.selectActiveTab);
  const actions = usePracticeLibraryStore(practiceLibrarySelectors.selectActions);

  const isOpen = (isCreateModalOpen || isEditModalOpen) && activeTab === 'packages';
  const isEditMode = isEditModalOpen && selectedPackage !== null;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PackageFormData>({ defaultValues });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items');
  const watchedPackagePrice = watch('package_price');

  // Calculate totals
  const totalValue = watchedItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const packagePrice = parseFloat(watchedPackagePrice) || 0;
  const savingsAmount = totalValue - packagePrice;
  const savingsPercent = totalValue > 0 ? (savingsAmount / totalValue) * 100 : 0;

  // Reset form when modal opens/closes or when editing different package
  useEffect(() => {
    if (isOpen && isEditMode && selectedPackage) {
      reset({
        name: selectedPackage.name,
        description: selectedPackage.description ?? '',
        package_price: selectedPackage.package_price.toString(),
        is_active: selectedPackage.is_active,
        is_featured: selectedPackage.is_featured,
        value_proposition: selectedPackage.value_proposition ?? '',
        items: selectedPackage.items.map((item) => ({
          item_type: item.item_type,
          item_id: item.item_id,
          item_title: item.item_title,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      });
    } else if (isOpen && !isEditMode) {
      reset(defaultValues);
    }
  }, [isOpen, isEditMode, selectedPackage, reset]);

  const handleClose = () => {
    if (isEditModalOpen) {
      actions.closeEditModal();
      actions.setSelectedPackage(null);
    } else {
      actions.closeCreateModal();
    }
  };

  const onSubmit = async (data: PackageFormData) => {
    if (!selectedPracticeId) return;

    const apiPracticeId = getApiPracticeId(selectedPracticeId);

    const payload: CreatePLPackagePayload = {
      practice_id: apiPracticeId ?? '',
      name: data.name,
      description: data.description || null,
      package_price: parseFloat(data.package_price),
      is_active: data.is_active,
      is_featured: data.is_featured,
      value_proposition: data.value_proposition || null,
      items: data.items.map((item) => ({
        item_type: item.item_type,
        item_id: item.item_id,
        item_title: item.item_title,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    };

    try {
      if (isEditMode && selectedPackage) {
        await practiceLibraryApi.updatePLPackage(selectedPackage.id, payload);
      } else {
        await practiceLibraryApi.createPLPackage(payload);
      }

      // Reload packages
      const updatedPackages = await practiceLibraryApi.getPLPackages({
        practice_id: apiPracticeId ?? undefined,
      });
      actions.setPackages(updatedPackages);

      handleClose();
    } catch (error) {
      console.error('Failed to save package:', error);
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
              {isEditMode ? 'Edit Package' : 'Create Package'}
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
            {/* Package Name */}
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Package Name"
                  placeholder="e.g., New Patient Bundle"
                  error={!!errors.name}
                  helperText={errors.name?.message}
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
                  placeholder="Brief description of the package"
                  multiline
                  rows={2}
                  fullWidth
                />
              )}
            />

            {/* Package Items */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Package Items
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => append(emptyItem)}
                >
                  Add Item
                </Button>
              </Box>

              {fields.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No items yet. Add services or products to this package.
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {fields.map((field, index) => (
                    <Paper key={field.id} variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <Controller
                          name={`items.${index}.item_type`}
                          control={control}
                          render={({ field }) => (
                            <FormControl size="small" sx={{ minWidth: 100 }}>
                              <InputLabel>Type</InputLabel>
                              <Select {...field} label="Type">
                                <MenuItem value="service">Service</MenuItem>
                                <MenuItem value="product">Product</MenuItem>
                              </Select>
                            </FormControl>
                          )}
                        />

                        <Controller
                          name={`items.${index}.item_title`}
                          control={control}
                          rules={{ required: 'Required' }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              size="small"
                              label="Item Name"
                              placeholder="e.g., Botox Treatment"
                              sx={{ flex: 1 }}
                            />
                          )}
                        />

                        <Controller
                          name={`items.${index}.quantity`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              size="small"
                              label="Qty"
                              type="number"
                              sx={{ width: 80 }}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          )}
                        />

                        <Controller
                          name={`items.${index}.unit_price`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              size="small"
                              label="Unit Price"
                              type="number"
                              sx={{ width: 120 }}
                              InputProps={{ startAdornment: <span style={{ marginRight: 4 }}>$</span> }}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          )}
                        />

                        <IconButton
                          size="small"
                          onClick={() => remove(index)}
                          sx={{ mt: 0.5 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>

            <Divider />

            {/* Pricing Summary */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Total Value (sum of items)
                </Typography>
                <Typography variant="h6">
                  ${totalValue.toFixed(2)}
                </Typography>
              </Box>

              <Controller
                name="package_price"
                control={control}
                rules={{
                  required: 'Package price is required',
                  validate: (value) =>
                    !isNaN(parseFloat(value)) || 'Must be a valid number',
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Package Price"
                    type="number"
                    error={!!errors.package_price}
                    helperText={errors.package_price?.message}
                    InputProps={{ startAdornment: <span style={{ marginRight: 4 }}>$</span> }}
                    sx={{ width: 160 }}
                    required
                  />
                )}
              />

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Savings
                </Typography>
                <Typography variant="h6" color={savingsAmount > 0 ? 'success.main' : 'text.primary'}>
                  ${savingsAmount.toFixed(2)} ({savingsPercent.toFixed(0)}%)
                </Typography>
              </Box>
            </Box>

            {/* Value Proposition */}
            <Controller
              name="value_proposition"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Value Proposition"
                  placeholder="What makes this package special?"
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
                name="is_featured"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={field.onChange} color="warning" />}
                    label="Featured"
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
            {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Package'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
