/**
 * TCP Preview
 *
 * Displays the final generated TCP document in a printable format.
 */

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Button from '@mui/material/Button';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EventIcon from '@mui/icons-material/Event';

import type { TCPDocument } from '../types';

interface TCPPreviewProps {
  document: TCPDocument;
  onPrint?: () => void;
  onDownload?: () => void;
}

export function TCPPreview({ document, onPrint, onDownload }: TCPPreviewProps) {
  const tcp = document.treatment_care_plan;

  const formatCurrency = (value: string | undefined) => {
    if (!value) return '-';
    const num = parseFloat(value);
    return isNaN(num) ? value : `$${num.toFixed(2)}`;
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      {/* Header Actions */}
      <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mb: 3 }}>
        <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>
          Print
        </Button>
        {onDownload && (
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={onDownload}>
            Download PDF
          </Button>
        )}
      </Stack>

      {/* Document */}
      <Paper
        sx={{
          p: 4,
          '@media print': {
            boxShadow: 'none',
            border: 'none',
          },
        }}
      >
        {/* Document Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Treatment Care Plan
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Patient
              </Typography>
              <Typography variant="h6">{document.patient}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Date
              </Typography>
              <Typography variant="h6">{document.consultation_date}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Provider
              </Typography>
              <Typography variant="h6">{document.provider || '-'}</Typography>
            </Box>
          </Stack>
        </Box>

        {/* Immediate Intervention */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" color="primary" gutterBottom>
            Immediate Intervention
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            {tcp.immediate_intervention.focus}
          </Typography>

          {tcp.immediate_intervention.treatments.length > 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Treatment</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell align="right">Cost</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tcp.immediate_intervention.treatments.map((t, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <strong>{t.name}</strong>
                      </TableCell>
                      <TableCell>{t.description || '-'}</TableCell>
                      <TableCell>{t.details || '-'}</TableCell>
                      <TableCell align="right">{formatCurrency(t.cost)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {tcp.post_care_instructions.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Post-Care Instructions
              </Typography>
              <List dense>
                {tcp.post_care_instructions.map((instruction, i) => (
                  <ListItem key={i}>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={instruction} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Short-Term Goals */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" color="primary" gutterBottom>
            Short-Term Goals
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            {tcp.short_term_goals.focus}
          </Typography>

          {tcp.short_term_goals.treatments.length > 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Treatment</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell align="right">Cost</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tcp.short_term_goals.treatments.map((t, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <strong>{t.name}</strong>
                      </TableCell>
                      <TableCell>{t.description || '-'}</TableCell>
                      <TableCell>{t.details || '-'}</TableCell>
                      <TableCell align="right">{formatCurrency(t.cost)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {tcp.short_term_goals.follow_up_schedule.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Follow-Up Schedule
              </Typography>
              <Stack spacing={1}>
                {tcp.short_term_goals.follow_up_schedule.map((item, i) => (
                  <Stack
                    key={i}
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{
                      p: 1.5,
                      bgcolor: 'grey.50',
                      borderRadius: 1,
                    }}
                  >
                    <EventIcon color="action" />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {item.event}
                      </Typography>
                    </Box>
                    <Chip label={item.date} size="small" />
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Long-Term Strategy */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" color="primary" gutterBottom>
            Long-Term Strategy
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            {tcp.long_term_strategy.focus}
          </Typography>

          {tcp.long_term_strategy.maintenance_schedule.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Maintenance Schedule
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Treatment</TableCell>
                      <TableCell>Frequency</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tcp.long_term_strategy.maintenance_schedule.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{item.treatment}</TableCell>
                        <TableCell>{item.frequency}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {tcp.long_term_strategy.skincare_routine && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Skincare Routine
              </Typography>
              <Stack direction="row" spacing={4}>
                {tcp.long_term_strategy.skincare_routine.morning.length > 0 && (
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Morning
                    </Typography>
                    <List dense>
                      {tcp.long_term_strategy.skincare_routine.morning.map((step, i) => (
                        <ListItem key={i}>
                          <ListItemText
                            primary={`${step.step}. ${step.product}`}
                            secondary={step.instructions}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
                {tcp.long_term_strategy.skincare_routine.evening.length > 0 && (
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Evening
                    </Typography>
                    <List dense>
                      {tcp.long_term_strategy.skincare_routine.evening.map((step, i) => (
                        <ListItem key={i}>
                          <ListItemText
                            primary={`${step.step}. ${step.product}`}
                            secondary={step.instructions}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Stack>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Clinical Safety Protocols */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" color="primary" gutterBottom>
            Clinical Safety Protocols
          </Typography>

          {tcp.clinical_safety_protocols.coordination_requirements.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Coordination Requirements
              </Typography>
              <List dense>
                {tcp.clinical_safety_protocols.coordination_requirements.map((req, i) => (
                  <ListItem key={i}>
                    <ListItemText primary={req} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {tcp.clinical_safety_protocols.safety_protocols.length > 0 && (
            <Box
              sx={{
                p: 2,
                bgcolor: 'warning.light',
                borderRadius: 1,
                border: 1,
                borderColor: 'warning.main',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <WarningAmberIcon color="warning" />
                <Typography variant="subtitle2">Important Safety Information</Typography>
              </Stack>
              <List dense>
                {tcp.clinical_safety_protocols.safety_protocols.map((protocol, i) => (
                  <ListItem key={i}>
                    <ListItemText primary={protocol} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Divider sx={{ my: 3 }} />
        <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
          <Typography variant="caption">
            Generated on {new Date().toLocaleDateString()} | Document Version:{' '}
            {document.metadata?.version || 1}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
