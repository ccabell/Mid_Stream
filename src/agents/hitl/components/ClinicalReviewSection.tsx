/**
 * Clinical Review Section
 *
 * Optional section for provider attestation via initials.
 * Can be made required per practice configuration.
 */

import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

interface ClinicalReviewSectionProps {
  clinicalReviewRequired: boolean;
  clinicalReviewCompleted: boolean;
  clinicalReviewedBy: string | null;
  clinicalReviewedAt: string | null;
  onCompleteClinicalReview: (reviewerId: string) => void;
}

export function ClinicalReviewSection({
  clinicalReviewRequired,
  clinicalReviewCompleted,
  clinicalReviewedBy,
  clinicalReviewedAt,
  onCompleteClinicalReview,
}: ClinicalReviewSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [initials, setInitials] = useState('');

  const handleComplete = () => {
    if (initials.trim()) {
      onCompleteClinicalReview(initials.toUpperCase());
      setDialogOpen(false);
      setInitials('');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  if (!clinicalReviewRequired) {
    return null;
  }

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <MedicalServicesIcon fontSize="small" color="action" />
          <Typography variant="subtitle2" color="text.secondary">
            Clinical Review {clinicalReviewRequired ? '(Required)' : '(Optional)'}
          </Typography>
        </Stack>

        {clinicalReviewCompleted ? (
          <Stack direction="row" alignItems="center" spacing={2}>
            <CheckCircleIcon color="success" />
            <Typography variant="body2">
              Reviewed by <strong>{clinicalReviewedBy}</strong>
              {clinicalReviewedAt && ` at ${formatDate(clinicalReviewedAt)}`}
            </Typography>
          </Stack>
        ) : (
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Optional: Add provider initials to confirm clinical review
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<VerifiedUserIcon />}
              onClick={() => setDialogOpen(true)}
            >
              Add Initials
            </Button>
          </Stack>
        )}
      </CardContent>

      {/* Review Completion Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <MedicalServicesIcon color="primary" />
            <Typography variant="h6">Clinical Review</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter your initials to confirm the clinical review.
          </Typography>

          <TextField
            label="Initials"
            value={initials}
            onChange={(e) => setInitials(e.target.value.slice(0, 4))}
            fullWidth
            required
            placeholder="JS"
            inputProps={{ maxLength: 4, style: { textTransform: 'uppercase' } }}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleComplete}
            disabled={!initials.trim()}
            startIcon={<CheckCircleIcon />}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
