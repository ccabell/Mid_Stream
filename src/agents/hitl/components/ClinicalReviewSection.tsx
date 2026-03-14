/**
 * Clinical Review Section
 *
 * Displays clinical review status and allows providers to complete
 * the required clinical review before TCP generation.
 */

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
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
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerCredentials, setReviewerCredentials] = useState('');

  const handleComplete = () => {
    if (reviewerName.trim()) {
      const reviewerId = `${reviewerName}${reviewerCredentials ? ` (${reviewerCredentials})` : ''}`;
      onCompleteClinicalReview(reviewerId);
      setDialogOpen(false);
      setReviewerName('');
      setReviewerCredentials('');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  if (!clinicalReviewRequired) {
    return null;
  }

  return (
    <Card sx={{ mb: 3, border: 2, borderColor: clinicalReviewCompleted ? 'success.main' : 'warning.main' }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <MedicalServicesIcon color={clinicalReviewCompleted ? 'success' : 'warning'} />
          <Typography variant="h6" fontWeight={600}>
            Clinical Review
          </Typography>
          <Chip
            label={clinicalReviewCompleted ? 'Completed' : 'Required'}
            color={clinicalReviewCompleted ? 'success' : 'warning'}
            size="small"
            icon={clinicalReviewCompleted ? <CheckCircleIcon /> : undefined}
          />
        </Stack>

        {clinicalReviewCompleted ? (
          <Box>
            <Alert severity="success" icon={<VerifiedUserIcon />}>
              <AlertTitle>Clinical Review Completed</AlertTitle>
              This verification has been reviewed and approved by a clinical provider.
            </Alert>

            <Stack spacing={1} mt={2} sx={{ pl: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  <strong>Reviewed by:</strong> {clinicalReviewedBy}
                </Typography>
              </Stack>
              {clinicalReviewedAt && (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AccessTimeIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    <strong>Reviewed at:</strong> {formatDate(clinicalReviewedAt)}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>
        ) : (
          <Box>
            <Alert severity="warning">
              <AlertTitle>Clinical Review Required</AlertTitle>
              A licensed provider must review and approve this verification before
              the Treatment Care Plan can be generated. This ensures clinical accuracy
              and patient safety.
            </Alert>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="text.secondary" mb={2}>
              As the reviewing provider, you are confirming that:
            </Typography>

            <Stack component="ul" spacing={0.5} sx={{ pl: 2, mb: 2 }}>
              <Typography component="li" variant="body2">
                All treatment information has been verified for accuracy
              </Typography>
              <Typography component="li" variant="body2">
                Patient safety considerations have been reviewed
              </Typography>
              <Typography component="li" variant="body2">
                Recommendations are clinically appropriate for this patient
              </Typography>
              <Typography component="li" variant="body2">
                The checklist items reflect the actual consultation
              </Typography>
            </Stack>

            <Button
              variant="contained"
              color="primary"
              startIcon={<VerifiedUserIcon />}
              onClick={() => setDialogOpen(true)}
              fullWidth
            >
              Complete Clinical Review
            </Button>
          </Box>
        )}
      </CardContent>

      {/* Review Completion Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <MedicalServicesIcon color="primary" />
            <Typography variant="h6">Complete Clinical Review</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please enter your information to complete the clinical review.
            This will be recorded in the audit trail.
          </Typography>

          <Stack spacing={3}>
            <TextField
              label="Provider Name"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              fullWidth
              required
              placeholder="Dr. Jane Smith"
              helperText="Enter your full name"
            />

            <TextField
              label="Credentials (optional)"
              value={reviewerCredentials}
              onChange={(e) => setReviewerCredentials(e.target.value)}
              fullWidth
              placeholder="MD, NP, PA-C, RN, etc."
              helperText="Enter your professional credentials"
            />

            <Alert severity="info" variant="outlined">
              By completing this review, you are attesting that you have reviewed
              all verification data and approve it for TCP generation.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleComplete}
            disabled={!reviewerName.trim()}
            startIcon={<CheckCircleIcon />}
          >
            Complete Review
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
