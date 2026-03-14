/**
 * Timeline Component
 *
 * Displays follow-up schedule as a visual timeline.
 */

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';

import type { FollowUpItem } from '../types';

interface TimelineProps {
  items: FollowUpItem[];
  onUpdate: (index: number, item: FollowUpItem) => void;
  onRemove: (index: number) => void;
  editable?: boolean;
}

export function Timeline({ items, onUpdate, onRemove, editable = true }: TimelineProps) {
  if (items.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
        <EventIcon sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
        <Typography>No follow-up appointments scheduled</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', pl: 3 }}>
      {/* Vertical line */}
      <Box
        sx={{
          position: 'absolute',
          left: 8,
          top: 8,
          bottom: 8,
          width: 2,
          bgcolor: 'primary.light',
        }}
      />

      <Stack spacing={2}>
        {items.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            {/* Dot */}
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                border: 2,
                borderColor: 'background.paper',
                position: 'relative',
                left: -3,
                top: 4,
                zIndex: 1,
              }}
            />

            {/* Content */}
            <Box sx={{ flexGrow: 1 }}>
              {editable ? (
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    value={item.event}
                    onChange={(e) => onUpdate(index, { ...item, event: e.target.value })}
                    size="small"
                    placeholder="Event"
                    sx={{ flexGrow: 1 }}
                  />
                  <TextField
                    value={item.date}
                    onChange={(e) => onUpdate(index, { ...item, date: e.target.value })}
                    size="small"
                    placeholder="When"
                    sx={{ width: 150 }}
                  />
                  <IconButton size="small" onClick={() => onRemove(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              ) : (
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {item.event}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.date}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
