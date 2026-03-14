/**
 * Source Selector Component
 *
 * Allows user to choose between AI-generated and manual TCP creation.
 */

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EditIcon from '@mui/icons-material/Edit';

interface SourceSelectorProps {
  hasHITL: boolean;
  onSelect: (mode: 'manual' | 'ai') => void;
}

export function SourceSelector({ hasHITL, onSelect }: SourceSelectorProps) {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
      {/* AI-Generated Option */}
      <Card sx={{ flex: 1 }}>
        <CardActionArea
          onClick={() => onSelect('ai')}
          disabled={!hasHITL}
          sx={{ height: '100%' }}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <AutoAwesomeIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              AI-Generated
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Generate TCP automatically from HITL verified output. Faster and more accurate.
            </Typography>
            {hasHITL ? (
              <Chip label="HITL Complete" color="success" size="small" />
            ) : (
              <Chip label="Requires HITL" color="warning" size="small" />
            )}
          </CardContent>
        </CardActionArea>
      </Card>

      {/* Manual Option */}
      <Card sx={{ flex: 1 }}>
        <CardActionArea onClick={() => onSelect('manual')} sx={{ height: '100%' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <EditIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Manual Entry
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Build the TCP step by step using a questionnaire. Full control over content.
            </Typography>
            <Chip label="Always Available" color="default" size="small" />
          </CardContent>
        </CardActionArea>
      </Card>
    </Stack>
  );
}
