/**
 * Services List Component
 *
 * Displays list of practice library services with actions
 */

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import StarIcon from '@mui/icons-material/Star';
import { usePracticeLibraryStore, practiceLibrarySelectors } from 'stores/practiceLibraryStore';
import type { PLService } from 'apiServices/practiceLibrary/types';

function formatPrice(price: number | null): string {
  if (price === null) return '—';
  return `$${price.toLocaleString()}`;
}

function ServiceRow({ service, onEdit }: { service: PLService; onEdit: () => void }) {
  return (
    <TableRow
      sx={{
        '&:hover': { backgroundColor: 'action.hover' },
        opacity: service.is_active ? 1 : 0.5,
      }}
    >
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {service.title}
          </Typography>
          {service.is_preferred && (
            <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
          )}
          {!service.is_active && (
            <VisibilityOffIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
          )}
        </Box>
        {service.description && (
          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 300, display: 'block' }}>
            {service.description}
          </Typography>
        )}
      </TableCell>
      <TableCell>
        {service.category && (
          <Chip label={service.category} size="small" variant="outlined" />
        )}
      </TableCell>
      <TableCell>
        <Typography variant="body2">{formatPrice(service.price)}</Typography>
        {service.price_tier && (
          <Typography variant="caption" color="text.secondary">
            {service.price_tier}
          </Typography>
        )}
      </TableCell>
      <TableCell>
        {service.downtime && (
          <Typography variant="body2" color="text.secondary">
            {service.downtime}
          </Typography>
        )}
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {service.concerns_addressed.slice(0, 3).map((concern, i) => (
            <Chip key={i} label={concern} size="small" sx={{ fontSize: 10 }} />
          ))}
          {service.concerns_addressed.length > 3 && (
            <Chip label={`+${service.concerns_addressed.length - 3}`} size="small" variant="outlined" />
          )}
        </Box>
      </TableCell>
      <TableCell align="right">
        <IconButton size="small" onClick={onEdit}>
          <EditIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

export function ServicesList() {
  const services = usePracticeLibraryStore(practiceLibrarySelectors.selectServices);
  const isLoading = usePracticeLibraryStore(practiceLibrarySelectors.selectIsLoadingServices);
  const actions = usePracticeLibraryStore(practiceLibrarySelectors.selectActions);

  const handleEdit = (service: PLService) => {
    actions.setSelectedService(service);
    actions.openEditModal();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (services.items.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            No services found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add services to this practice library or import from the global catalog.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Service</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Downtime</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Concerns</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {services.items.map((service) => (
            <ServiceRow key={service.id} service={service} onEdit={() => handleEdit(service)} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
