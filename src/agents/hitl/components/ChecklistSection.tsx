/**
 * Checklist Section
 *
 * Displays consultation checklist with completion tracking.
 */

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import type { ChecklistDraft, ChecklistItemDraft } from '../types';

interface ChecklistSectionProps {
  data: ChecklistDraft;
  onToggleItem: (itemId: string) => void;
}

export function ChecklistSection({
  data,
  onToggleItem,
}: ChecklistSectionProps) {
  // Group items by category
  const categories = {
    safety: data.items.filter(i => i.category === 'safety'),
    clinical: data.items.filter(i => i.category === 'clinical'),
    education: data.items.filter(i => i.category === 'education'),
    closing: data.items.filter(i => i.category === 'closing'),
  };

  const categoryLabels: Record<string, string> = {
    safety: 'Safety & Compliance',
    clinical: 'Clinical',
    education: 'Education & Planning',
    closing: 'Closing & Next Steps',
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    safety: <WarningIcon color="error" />,
    clinical: <InfoIcon color="info" />,
    education: <InfoIcon color="primary" />,
    closing: <CheckCircleIcon color="success" />,
  };

  const completionPercentage = Math.round(data.completionRate * 100);

  const getProgressColor = (percentage: number): 'error' | 'warning' | 'success' => {
    if (percentage < 50) return 'error';
    if (percentage < 80) return 'warning';
    return 'success';
  };

  const renderItem = (item: ChecklistItemDraft) => {
    const isCompleted = item.completed === true;
    const isIncomplete = item.completed === false;
    const isUnknown = item.completed === null;

    return (
      <Box
        key={item.itemId}
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
          py: 1,
          px: 1,
          borderRadius: 1,
          bgcolor: item.critical && !isCompleted ? 'error.50' : 'transparent',
          border: item.critical && !isCompleted ? 1 : 0,
          borderColor: 'error.main',
        }}
      >
        <Checkbox
          checked={isCompleted}
          indeterminate={isUnknown}
          onChange={() => onToggleItem(item.itemId)}
          size="small"
          color={item.critical ? 'error' : 'primary'}
        />

        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              variant="body2"
              sx={{
                textDecoration: isCompleted ? 'line-through' : 'none',
                color: isCompleted ? 'text.secondary' : 'text.primary',
              }}
            >
              {item.itemLabel}
            </Typography>
            {item.critical && (
              <Tooltip title="Critical item - must be completed">
                <Chip
                  icon={<ErrorIcon />}
                  label="Critical"
                  size="small"
                  color="error"
                  variant="outlined"
                />
              </Tooltip>
            )}
            {item.manuallyChecked && (
              <Chip label="Manual" size="small" variant="outlined" />
            )}
          </Stack>

          {item.evidence && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              Evidence: "{item.evidence}"
            </Typography>
          )}
        </Box>

        {/* Status indicator */}
        <Box sx={{ minWidth: 24 }}>
          {isCompleted && <CheckCircleIcon color="success" fontSize="small" />}
          {isIncomplete && <ErrorIcon color="error" fontSize="small" />}
          {isUnknown && <InfoIcon color="disabled" fontSize="small" />}
        </Box>
      </Box>
    );
  };

  const getCategoryCompletion = (items: ChecklistItemDraft[]) => {
    if (items.length === 0) return 100;
    const completed = items.filter(i => i.completed === true).length;
    return Math.round((completed / items.length) * 100);
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Consultation Checklist
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ width: 100 }}>
              <LinearProgress
                variant="determinate"
                value={completionPercentage}
                color={getProgressColor(completionPercentage)}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {completionPercentage}%
            </Typography>
          </Stack>
        </Box>

        {/* Critical items warning */}
        {!data.criticalItemsComplete && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Critical safety items must be completed before generating TCP.
            </Typography>
          </Alert>
        )}

        {/* Categories */}
        {(Object.entries(categories) as [string, ChecklistItemDraft[]][]).map(([category, items]) => {
          if (items.length === 0) return null;

          const categoryCompletion = getCategoryCompletion(items);
          const hasCriticalIncomplete = items.some(i => i.critical && i.completed !== true);

          return (
            <Accordion key={category} defaultExpanded={hasCriticalIncomplete}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%', pr: 2 }}>
                  {categoryIcons[category]}
                  <Typography sx={{ flex: 1 }}>
                    {categoryLabels[category]}
                  </Typography>
                  <Chip
                    label={`${categoryCompletion}%`}
                    size="small"
                    color={
                      hasCriticalIncomplete ? 'error' :
                      categoryCompletion === 100 ? 'success' :
                      categoryCompletion >= 50 ? 'warning' : 'default'
                    }
                    variant="outlined"
                  />
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={0}>
                  {items.map(renderItem)}
                </Stack>
              </AccordionDetails>
            </Accordion>
          );
        })}

        {/* Summary */}
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={3}>
            <Typography variant="body2">
              <strong>Completed:</strong> {data.items.filter(i => i.completed === true).length}
            </Typography>
            <Typography variant="body2">
              <strong>Incomplete:</strong> {data.items.filter(i => i.completed === false).length}
            </Typography>
            <Typography variant="body2">
              <strong>Unknown:</strong> {data.items.filter(i => i.completed === null).length}
            </Typography>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
