/**
 * Products List Component
 *
 * Displays list of practice library products
 */

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import EditIcon from '@mui/icons-material/Edit';
import StarIcon from '@mui/icons-material/Star';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { usePracticeLibraryStore, practiceLibrarySelectors } from 'stores/practiceLibraryStore';
import type { PLProduct } from 'apiServices/practiceLibrary/types';

function ProductCard({ product, onEdit }: { product: PLProduct; onEdit: () => void }) {
  return (
    <Card
      sx={{
        height: '100%',
        opacity: product.is_active ? 1 : 0.5,
        position: 'relative',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {product.title}
              </Typography>
              {product.is_preferred && (
                <StarIcon sx={{ fontSize: 14, color: 'warning.main' }} />
              )}
              {!product.is_active && (
                <VisibilityOffIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
              )}
            </Box>
            {product.category && (
              <Chip label={product.category} size="small" variant="outlined" sx={{ mb: 1 }} />
            )}
            {product.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {product.description}
              </Typography>
            )}
            {product.price !== null && (
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'success.main' }}>
                ${product.price.toLocaleString()}
              </Typography>
            )}
          </Box>
          <IconButton size="small" onClick={onEdit}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
        {product.concerns_addressed.length > 0 && (
          <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {product.concerns_addressed.slice(0, 3).map((concern, i) => (
              <Chip key={i} label={concern} size="small" sx={{ fontSize: 10 }} />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export function ProductsList() {
  const products = usePracticeLibraryStore(practiceLibrarySelectors.selectProducts);
  const isLoading = usePracticeLibraryStore(practiceLibrarySelectors.selectIsLoadingProducts);
  const actions = usePracticeLibraryStore(practiceLibrarySelectors.selectActions);

  const handleEdit = (product: PLProduct) => {
    actions.setSelectedProduct(product);
    actions.openEditModal();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (products.items.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            No products found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add products to this practice library.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Grid container spacing={2}>
      {products.items.map((product) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
          <ProductCard product={product} onEdit={() => handleEdit(product)} />
        </Grid>
      ))}
    </Grid>
  );
}
