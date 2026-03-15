/**
 * Generation Controls Component
 *
 * Start/Stop/Retry controls for TCP generation.
 */

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TokenIcon from '@mui/icons-material/Token';
import type { TokenUsage } from '../types';

interface GenerationControlsProps {
  isGenerating: boolean;
  canGenerate: boolean;
  progress: number;
  completedSections: number;
  totalSections: number;
  hasErrors: boolean;
  allComplete: boolean;
  totalTokens: TokenUsage;
  onStart: () => void;
  onStop: () => void;
  onRetryFailed: () => void;
  onContinue: () => void;
}

export function GenerationControls({
  isGenerating,
  canGenerate,
  progress,
  completedSections,
  totalSections,
  hasErrors,
  allComplete,
  totalTokens,
  onStart,
  onStop,
  onRetryFailed,
  onContinue,
}: GenerationControlsProps) {
  const totalTokenCount = totalTokens.promptTokens + totalTokens.completionTokens;

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        {/* Progress Bar */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Progress: {completedSections} / {totalSections} sections
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round(progress)}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 1,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                bgcolor: hasErrors ? 'warning.main' : allComplete ? 'success.main' : 'primary.main',
              },
            }}
          />
        </Box>

        {/* Token Usage */}
        {totalTokenCount > 0 && (
          <Stack direction="row" spacing={2}>
            <Chip
              icon={<TokenIcon />}
              label={`${totalTokens.promptTokens.toLocaleString()} prompt tokens`}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<TokenIcon />}
              label={`${totalTokens.completionTokens.toLocaleString()} completion tokens`}
              size="small"
              variant="outlined"
            />
          </Stack>
        )}

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="center">
          {/* Not started or can retry */}
          {!isGenerating && !allComplete && (
            <Button
              variant="contained"
              size="large"
              startIcon={completedSections === 0 ? <PlayArrowIcon /> : <RefreshIcon />}
              onClick={onStart}
              disabled={!canGenerate}
            >
              {completedSections === 0 ? 'Start Generation' : 'Restart Generation'}
            </Button>
          )}

          {/* Currently generating */}
          {isGenerating && (
            <Button
              variant="outlined"
              size="large"
              color="error"
              startIcon={<StopIcon />}
              onClick={onStop}
            >
              Stop Generation
            </Button>
          )}

          {/* Has errors - retry failed */}
          {!isGenerating && hasErrors && (
            <Button
              variant="contained"
              color="warning"
              size="large"
              startIcon={<RefreshIcon />}
              onClick={onRetryFailed}
            >
              Retry Failed Sections
            </Button>
          )}

          {/* All complete */}
          {allComplete && (
            <Button
              variant="contained"
              color="success"
              size="large"
              startIcon={<CheckCircleIcon />}
              onClick={onContinue}
            >
              Review & Finalize
            </Button>
          )}
        </Stack>

        {/* Status Message */}
        <Box textAlign="center">
          {isGenerating && (
            <Typography variant="body2" color="primary">
              Generating TCP sections... Please wait.
            </Typography>
          )}
          {!isGenerating && hasErrors && (
            <Typography variant="body2" color="error">
              Some sections failed to generate. Click retry to try again.
            </Typography>
          )}
          {allComplete && (
            <Typography variant="body2" color="success.main">
              All sections generated successfully! Ready to review.
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}

export default GenerationControls;
