/**
 * Concerns List Component
 *
 * Displays list of practice library concerns with category grouping
 */

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import LinkIcon from '@mui/icons-material/Link';
import { usePracticeLibraryStore, practiceLibrarySelectors } from 'stores/practiceLibraryStore';
import type { PLConcern, ConcernCategory } from 'apiServices/practiceLibrary/types';

const CATEGORY_LABELS: Record<ConcernCategory, string> = {
  aging: 'Aging',
  skin_quality: 'Skin Quality',
  pigmentation: 'Pigmentation',
  vascular: 'Vascular',
  acne: 'Acne',
  scarring: 'Scarring',
  body: 'Body',
  hair: 'Hair',
  wellness: 'Wellness',
};

const CATEGORY_COLORS: Record<ConcernCategory, string> = {
  aging: '#9c27b0',
  skin_quality: '#2196f3',
  pigmentation: '#ff9800',
  vascular: '#f44336',
  acne: '#4caf50',
  scarring: '#795548',
  body: '#00bcd4',
  hair: '#673ab7',
  wellness: '#009688',
};

function ConcernRow({ concern, onEdit }: { concern: PLConcern; onEdit: () => void }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1.5,
        borderRadius: 1,
        '&:hover': { backgroundColor: 'action.hover' },
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {concern.label}
          </Typography>
          {concern.maps_to_global && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
              <LinkIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {concern.maps_to_global}
              </Typography>
            </Box>
          )}
        </Box>
        {concern.aliases.length > 0 && (
          <Typography variant="caption" color="text.secondary">
            Aliases: {concern.aliases.join(', ')}
          </Typography>
        )}
        {concern.related_services.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
            {concern.related_services.slice(0, 3).map((svc, i) => (
              <Chip key={i} label={svc} size="small" variant="outlined" sx={{ fontSize: 10 }} />
            ))}
            {concern.related_services.length > 3 && (
              <Chip
                label={`+${concern.related_services.length - 3} more`}
                size="small"
                variant="outlined"
                sx={{ fontSize: 10 }}
              />
            )}
          </Box>
        )}
      </Box>
      <IconButton size="small" onClick={onEdit}>
        <EditIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

export function ConcernsList() {
  const concerns = usePracticeLibraryStore(practiceLibrarySelectors.selectConcerns);
  const isLoading = usePracticeLibraryStore(practiceLibrarySelectors.selectIsLoadingConcerns);
  const actions = usePracticeLibraryStore(practiceLibrarySelectors.selectActions);

  const handleEdit = (concern: PLConcern) => {
    actions.setSelectedConcern(concern);
    actions.openEditModal();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (concerns.items.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            No concerns configured
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add concern vocabulary to enable concern mapping and service suggestions.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Group concerns by category
  const groupedConcerns = concerns.items.reduce<Record<ConcernCategory, PLConcern[]>>(
    (acc, concern) => {
      if (!acc[concern.category]) {
        acc[concern.category] = [];
      }
      acc[concern.category].push(concern);
      return acc;
    },
    {} as Record<ConcernCategory, PLConcern[]>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {(Object.keys(groupedConcerns) as ConcernCategory[]).map((category) => {
        const categoryConcerns = groupedConcerns[category];
        if (!categoryConcerns) return null;

        return (
          <Accordion key={category} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: CATEGORY_COLORS[category],
                  }}
                />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {CATEGORY_LABELS[category]}
                </Typography>
                <Chip label={categoryConcerns.length} size="small" />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              {categoryConcerns.map((concern) => (
                <ConcernRow
                  key={concern.id}
                  concern={concern}
                  onEdit={() => handleEdit(concern)}
                />
              ))}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}
