/**
 * Input Selector Component
 *
 * Select between HITL output or raw extraction as input source.
 */

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { TCPRunnerInput, ExtractionOutput, HITLVerifiedOutput } from '../types';

interface InputSelectorProps {
  extractionOutput?: ExtractionOutput;
  hitlOutput?: HITLVerifiedOutput;
  runId?: string;
  onSelect: (input: TCPRunnerInput) => void;
}

export function InputSelector({
  extractionOutput,
  hitlOutput,
  runId,
  onSelect,
}: InputSelectorProps) {
  const hasHITL = hitlOutput !== undefined;
  const hasExtraction = extractionOutput !== undefined;

  const handleSelectHITL = () => {
    if (hitlOutput) {
      onSelect({ type: 'hitl', data: hitlOutput, runId });
    }
  };

  const handleSelectExtraction = () => {
    if (extractionOutput) {
      onSelect({ type: 'extraction', data: extractionOutput, runId });
    }
  };

  // Auto-select if only one option
  if (hasHITL && !hasExtraction) {
    handleSelectHITL();
    return null;
  }
  if (hasExtraction && !hasHITL) {
    handleSelectExtraction();
    return null;
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Typography variant="h6">Select Input Source</Typography>
          <Typography variant="body2" color="text.secondary">
            Choose which data to use for generating the Treatment Care Plan
          </Typography>
        </Box>

        {/* Options */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {/* HITL Option */}
          <Card
            sx={{
              flex: 1,
              border: 2,
              borderColor: hasHITL ? 'success.main' : 'divider',
              opacity: hasHITL ? 1 : 0.5,
            }}
          >
            <CardActionArea
              onClick={handleSelectHITL}
              disabled={!hasHITL}
              sx={{ height: '100%' }}
            >
              <CardContent>
                <Stack spacing={2} alignItems="center" textAlign="center">
                  <FactCheckIcon
                    sx={{ fontSize: 48, color: hasHITL ? 'success.main' : 'text.disabled' }}
                  />
                  <Box>
                    <Typography variant="h6">HITL Verified Output</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Use provider-verified data from the HITL workflow
                    </Typography>
                  </Box>
                  {hasHITL ? (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Available"
                      color="success"
                      size="small"
                    />
                  ) : (
                    <Chip label="Not Available" size="small" variant="outlined" />
                  )}
                  {hasHITL && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                      <Chip
                        label={`${hitlOutput!.todays_treatments.length} treatments`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`${hitlOutput!.recommendations.length} recommendations`}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>

          {/* Extraction Option */}
          <Card
            sx={{
              flex: 1,
              border: 2,
              borderColor: hasExtraction ? 'primary.main' : 'divider',
              opacity: hasExtraction ? 1 : 0.5,
            }}
          >
            <CardActionArea
              onClick={handleSelectExtraction}
              disabled={!hasExtraction}
              sx={{ height: '100%' }}
            >
              <CardContent>
                <Stack spacing={2} alignItems="center" textAlign="center">
                  <DescriptionIcon
                    sx={{
                      fontSize: 48,
                      color: hasExtraction ? 'primary.main' : 'text.disabled',
                    }}
                  />
                  <Box>
                    <Typography variant="h6">Raw Extraction</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Use Pass 1 + Pass 2 extraction output directly
                    </Typography>
                  </Box>
                  {hasExtraction ? (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Available"
                      color="primary"
                      size="small"
                    />
                  ) : (
                    <Chip label="Not Available" size="small" variant="outlined" />
                  )}
                  {hasExtraction && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                      <Chip
                        label={`${extractionOutput!.prompt_1.parsed_json.offerings.length} offerings`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={extractionOutput!.prompt_2.parsed_json.outcome.status.replace(
                          /_/g,
                          ' '
                        )}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        </Stack>

        {/* Recommendation */}
        {hasHITL && hasExtraction && (
          <Alert severity="info">
            <strong>Recommended:</strong> Use HITL Verified Output for best results. It contains
            provider-verified data and optimized recommendations.
          </Alert>
        )}

        {/* No input available */}
        {!hasHITL && !hasExtraction && (
          <Alert severity="warning">
            No input data available. Please run extraction or HITL verification first.
          </Alert>
        )}
      </Stack>
    </Paper>
  );
}

export default InputSelector;
