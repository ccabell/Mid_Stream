/**
 * Product Form Modal
 *
 * Modal for creating and editing practice library products.
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
import { isGlobalLibrary, type PLProduct, type CreatePLProductPayload } from 'apiServices/practiceLibrary/types';

// Product categories
const PRODUCT_CATEGORIES = [
  'Neurotoxins',
  'Dermal Fillers',
  'Biostimulators',
  'Skincare',
  'Topicals',
  'Devices',
  'Supplements',
  'Other',
] as const;

interface ProductFormData {
  title: string;
  description: string;
  category: string;
  price: string;
  is_active: boolean;
  is_preferred: boolean;
  concerns_addressed: string;
  suggest_when: string;
}

const defaultValues: ProductFormData = {
  title: '',
  description: '',
  category: '',
  price: '',
  is_active: true,
  is_preferred: false,
  concerns_addressed: '',
  suggest_when: '',
};

function parseArrayField(value: string): string[] {
  if (!value.trim()) return [];
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

function formatArrayField(arr: string[] | undefined): string {
  return arr?.join(', ') ?? '';
}

export function ProductFormModal() {
  const isCreateModalOpen = usePracticeLibraryStore(practiceLibrarySelectors.selectIsCreateModalOpen);
  const isEditModalOpen = usePracticeLibraryStore(practiceLibrarySelectors.selectIsEditModalOpen);
  const selectedProduct = usePracticeLibraryStore(practiceLibrarySelectors.selectSelectedProduct);
  const selectedPracticeId = usePracticeLibraryStore(practiceLibrarySelectors.selectSelectedPracticeId);
  const isGlobalMode = usePracticeLibraryStore(practiceLibrarySelectors.selectIsGlobalLibraryMode);
  const activeTab = usePracticeLibraryStore(practiceLibrarySelectors.selectActiveTab);
  const actions = usePracticeLibraryStore(practiceLibrarySelectors.selectActions);

  const isOpen = (isCreateModalOpen || isEditModalOpen) && activeTab === 'products';
  const isEditMode = isEditModalOpen && selectedProduct !== null;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({ defaultValues });

  // Reset form when modal opens/closes or when editing different product
  useEffect(() => {
    if (isOpen && isEditMode && selectedProduct) {
      reset({
        title: selectedProduct.title,
        description: selectedProduct.description ?? '',
        category: selectedProduct.category ?? '',
        price: selectedProduct.price?.toString() ?? '',
        is_active: selectedProduct.is_active,
        is_preferred: selectedProduct.is_preferred,
        concerns_addressed: formatArrayField(selectedProduct.concerns_addressed),
        suggest_when: formatArrayField(selectedProduct.suggest_when),
      });
    } else if (isOpen && !isEditMode) {
      reset(defaultValues);
    }
  }, [isOpen, isEditMode, selectedProduct, reset]);

  const handleClose = () => {
    if (isEditModalOpen) {
      actions.closeEditModal();
      actions.setSelectedProduct(null);
    } else {
      actions.closeCreateModal();
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    if (!selectedPracticeId) return;

    const isGlobal = isGlobalLibrary(selectedPracticeId);

    const basePayload = {
      title: data.title,
      description: data.description || null,
      category: data.category || null,
      price: data.price ? parseFloat(data.price) : null,
      is_active: data.is_active,
      is_preferred: data.is_preferred,
      concerns_addressed: parseArrayField(data.concerns_addressed),
      suggest_when: parseArrayField(data.suggest_when),
    };

    try {
      if (isGlobal) {
        // Global library CRUD
        if (isEditMode && selectedProduct) {
          await practiceLibraryApi.updateGLProduct(selectedProduct.id, basePayload);
        } else {
          await practiceLibraryApi.createGLProduct(basePayload);
        }
        // Reload global products
        const updatedProducts = await practiceLibraryApi.getGLProducts();
        actions.setProducts(updatedProducts);
      } else {
        // Practice library CRUD
        const payload: CreatePLProductPayload = {
          ...basePayload,
          practice_id: selectedPracticeId!,
        };
        if (isEditMode && selectedProduct) {
          await practiceLibraryApi.updatePLProduct(selectedProduct.id, payload);
        } else {
          await practiceLibraryApi.createPLProduct(payload);
        }
        // Reload practice products
        const updatedProducts = await practiceLibraryApi.getPLProducts({
          practice_id: selectedPracticeId!,
        });
        actions.setProducts(updatedProducts);
      }

      handleClose();
    } catch (error) {
      console.error('Failed to save product:', error);
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
              {isEditMode ? 'Edit Product' : 'Add Product'}
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
                  label="Product Title"
                  placeholder="e.g., Botox Cosmetic"
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
                  placeholder="Brief description of the product"
                  multiline
                  rows={2}
                  fullWidth
                />
              )}
            />

            {/* Category & Price */}
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
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />

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
                    placeholder="e.g., 15.00"
                    type="number"
                    error={!!errors.price}
                    helperText={errors.price?.message}
                    InputProps={{ startAdornment: <span style={{ marginRight: 4 }}>$</span> }}
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
                  placeholder="e.g., wrinkles, fine lines (comma-separated)"
                  helperText="Enter concerns separated by commas"
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
                  placeholder="e.g., patient wants preventive treatment (comma-separated)"
                  helperText="Triggers for suggesting this product"
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
            {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add Product'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
