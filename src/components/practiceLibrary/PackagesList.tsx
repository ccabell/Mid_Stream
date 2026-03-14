/**
 * Packages List Component
 *
 * Displays list of practice library packages with pricing
 */

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import EditIcon from '@mui/icons-material/Edit';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { usePracticeLibraryStore, practiceLibrarySelectors } from 'stores/practiceLibraryStore';
import type { PLPackage } from 'apiServices/practiceLibrary/types';

function PackageCard({ pkg, onEdit }: { pkg: PLPackage; onEdit: () => void }) {
  return (
    <Card
      sx={{
        height: '100%',
        opacity: pkg.is_active ? 1 : 0.5,
        border: pkg.is_featured ? 2 : 1,
        borderColor: pkg.is_featured ? 'primary.main' : 'divider',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {pkg.name}
              </Typography>
              {pkg.is_featured && (
                <Chip label="Featured" size="small" color="primary" />
              )}
            </Box>
            {pkg.description && (
              <Typography variant="body2" color="text.secondary">
                {pkg.description}
              </Typography>
            )}
          </Box>
          <IconButton size="small" onClick={onEdit}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Pricing */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
              ${pkg.package_price.toLocaleString()}
            </Typography>
            <Typography
              variant="body2"
              sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
            >
              ${pkg.total_value.toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <LocalOfferIcon sx={{ fontSize: 14, color: 'success.main' }} />
            <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
              Save ${pkg.savings_amount.toLocaleString()} ({pkg.savings_percent}% off)
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Items */}
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          Includes:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {pkg.items.map((item) => (
            <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} />
              <Typography variant="body2">
                {item.quantity > 1 ? `${item.quantity}x ` : ''}
                {item.item_title}
              </Typography>
            </Box>
          ))}
        </Box>

        {pkg.value_proposition && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              "{pkg.value_proposition}"
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function PackagesList() {
  const packages = usePracticeLibraryStore(practiceLibrarySelectors.selectPackages);
  const isLoading = usePracticeLibraryStore(practiceLibrarySelectors.selectIsLoadingPackages);
  const actions = usePracticeLibraryStore(practiceLibrarySelectors.selectActions);

  const handleEdit = (pkg: PLPackage) => {
    actions.setSelectedPackage(pkg);
    actions.openEditModal();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (packages.items.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            No packages found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create packages to bundle services and products at special pricing.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
      {packages.items.map((pkg) => (
        <PackageCard key={pkg.id} pkg={pkg} onEdit={() => handleEdit(pkg)} />
      ))}
    </Box>
  );
}
