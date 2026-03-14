/**
 * FollowUpTimeline Component (Production-style)
 *
 * Visual timeline with step numbers and connecting lines.
 */

import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import CheckIcon from '@mui/icons-material/Check';

interface TimelineEvent {
  step: number;
  date: string;
  title: string;
  description?: string;
  isCompleted?: boolean;
}

interface TimelineIndicatorProps {
  isCompleted?: boolean;
  isLast: boolean;
}

function TimelineIndicator({ isCompleted, isLast }: TimelineIndicatorProps) {
  return (
    <Stack alignItems="center">
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '2px solid',
          bgcolor: isCompleted ? 'primary.main' : 'background.paper',
          borderColor: isCompleted ? 'primary.light' : 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isCompleted && <CheckIcon sx={{ fontSize: 16, color: 'background.paper' }} />}
      </Box>

      {!isLast && (
        <Box
          sx={{
            width: 2,
            height: 62,
            my: 0.5,
            bgcolor: 'grey.300',
            borderRadius: '2px',
          }}
        />
      )}
    </Stack>
  );
}

interface TimelineItemProps {
  event: TimelineEvent;
  isLast: boolean;
}

function TimelineItem({ event, isLast }: TimelineItemProps) {
  const { step, date, title, description, isCompleted } = event;

  return (
    <Stack
      direction="row"
      gap={1.5}
      sx={{
        '@media print': {
          breakInside: 'avoid',
          pageBreakInside: 'avoid',
        },
      }}
    >
      <TimelineIndicator isCompleted={isCompleted} isLast={isLast} />

      <Stack gap={0.5}>
        <Typography
          variant="body2"
          textTransform="uppercase"
          color="secondary.dark"
          fontWeight={500}
        >
          Step {step}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {date || 'No date'}
        </Typography>
        <Typography variant="body1" fontWeight={500} color="text.secondary">
          {title || 'No title'}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}

interface FollowUpTimelineProps {
  events: TimelineEvent[];
}

export function FollowUpTimeline({ events }: FollowUpTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No follow-up schedule
      </Typography>
    );
  }

  return (
    <Stack>
      {events.map((event, index) => (
        <TimelineItem
          key={event.step}
          event={event}
          isLast={index === events.length - 1}
        />
      ))}
    </Stack>
  );
}
