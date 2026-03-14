/**
 * Review Section
 *
 * Displays a summary of all TCP sections for final review before generation.
 */

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import PersonIcon from '@mui/icons-material/Person';
import TodayIcon from '@mui/icons-material/Today';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ScheduleIcon from '@mui/icons-material/Schedule';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';

import type { TCPDocument } from '../types';

interface ReviewSectionProps {
  draft: TCPDocument;
}

export function ReviewSection({ draft }: ReviewSectionProps) {
  const tcp = draft.treatment_care_plan;
  const hasImmediateTreatments = tcp.immediate_intervention.treatments.length > 0;
  const hasShortTermTreatments = tcp.short_term_goals.treatments.length > 0;
  const hasMaintenanceSchedule = tcp.long_term_strategy.maintenance_schedule.length > 0;
  const hasSafetyProtocols = tcp.clinical_safety_protocols.safety_protocols.length > 0;

  return (
    <Stack spacing={3}>
      <Typography variant="h5" gutterBottom>
        Review Your Treatment Care Plan
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Please review all sections before generating the final TCP document.
      </Typography>

      {/* Patient Information */}
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <PersonIcon color="primary" />
          <Typography variant="h6">Patient Information</Typography>
        </Stack>
        <Stack direction="row" spacing={4}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Patient Name
            </Typography>
            <Typography variant="body1">
              {draft.patient || 'Not specified'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Date
            </Typography>
            <Typography variant="body1">{draft.consultation_date || 'Not specified'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Provider
            </Typography>
            <Typography variant="body1">{draft.provider || 'Not specified'}</Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Immediate Intervention */}
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <TodayIcon color="primary" />
          <Typography variant="h6">Immediate Intervention</Typography>
          <Chip
            size="small"
            label={hasImmediateTreatments ? 'Complete' : 'No treatments'}
            color={hasImmediateTreatments ? 'success' : 'warning'}
            icon={hasImmediateTreatments ? <CheckCircleIcon /> : <WarningIcon />}
          />
        </Stack>

        {tcp.immediate_intervention.focus && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Focus:</strong> {tcp.immediate_intervention.focus}
          </Typography>
        )}

        {hasImmediateTreatments ? (
          <List dense>
            {tcp.immediate_intervention.treatments.map((treatment, index) => (
              <ListItem key={treatment.id || index}>
                <ListItemIcon>
                  <CheckCircleIcon color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={treatment.name}
                  secondary={treatment.cost ? `$${treatment.cost}` : undefined}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No immediate treatments specified.
          </Typography>
        )}

        {tcp.post_care_instructions.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Post-Care Instructions ({tcp.post_care_instructions.length})
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Short-Term Goals */}
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <CalendarMonthIcon color="primary" />
          <Typography variant="h6">Short-Term Goals</Typography>
          <Chip
            size="small"
            label={hasShortTermTreatments ? 'Complete' : 'No treatments'}
            color={hasShortTermTreatments ? 'success' : 'warning'}
            icon={hasShortTermTreatments ? <CheckCircleIcon /> : <WarningIcon />}
          />
        </Stack>

        {tcp.short_term_goals.focus && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Focus:</strong> {tcp.short_term_goals.focus}
          </Typography>
        )}

        {hasShortTermTreatments ? (
          <List dense>
            {tcp.short_term_goals.treatments.map((treatment, index) => (
              <ListItem key={treatment.id || index}>
                <ListItemIcon>
                  <CheckCircleIcon color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={treatment.name}
                  secondary={treatment.cost ? `$${treatment.cost}` : undefined}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No short-term treatments specified.
          </Typography>
        )}

        {tcp.short_term_goals.follow_up_schedule.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Follow-Up Schedule ({tcp.short_term_goals.follow_up_schedule.length} appointments)
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Long-Term Strategy */}
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <ScheduleIcon color="primary" />
          <Typography variant="h6">Long-Term Strategy</Typography>
          <Chip
            size="small"
            label={hasMaintenanceSchedule ? 'Complete' : 'No schedule'}
            color={hasMaintenanceSchedule ? 'success' : 'warning'}
            icon={hasMaintenanceSchedule ? <CheckCircleIcon /> : <WarningIcon />}
          />
        </Stack>

        {tcp.long_term_strategy.focus && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Focus:</strong> {tcp.long_term_strategy.focus}
          </Typography>
        )}

        {hasMaintenanceSchedule ? (
          <List dense>
            {tcp.long_term_strategy.maintenance_schedule.map((item, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircleIcon color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={item.treatment} secondary={item.frequency} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No maintenance schedule specified.
          </Typography>
        )}

        {tcp.long_term_strategy.skincare_routine && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Skincare Routine Included
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Clinical Safety */}
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <HealthAndSafetyIcon color="primary" />
          <Typography variant="h6">Clinical Safety Protocols</Typography>
          <Chip
            size="small"
            label={hasSafetyProtocols ? 'Complete' : 'None specified'}
            color={hasSafetyProtocols ? 'success' : 'default'}
            icon={hasSafetyProtocols ? <CheckCircleIcon /> : undefined}
          />
        </Stack>

        {tcp.clinical_safety_protocols.coordination_requirements.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Coordination Requirements
            </Typography>
            <List dense>
              {tcp.clinical_safety_protocols.coordination_requirements.map((req, index) => (
                <ListItem key={index}>
                  <ListItemText primary={req} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {hasSafetyProtocols ? (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Safety Protocols
            </Typography>
            <List dense>
              {tcp.clinical_safety_protocols.safety_protocols.map((protocol, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <WarningIcon color="warning" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={protocol} />
                </ListItem>
              ))}
            </List>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No safety protocols specified.
          </Typography>
        )}
      </Paper>
    </Stack>
  );
}
