/**
 * InsightCard - Card Type 3: Summary + Values + Snippet Card
 *
 * Renders structured insight with evidence for traceability.
 * Shows: summary text, extracted values, transcript snippets, confidence scores.
 */
import { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { EvidenceList } from './EvidenceQuote';

export interface InsightValue {
  /** Value label */
  label: string;
  /** The extracted value */
  value: string | number | boolean | null;
  /** Confidence score 0-1 */
  confidence?: number;
  /** Color indicator */
  color?: 'success' | 'warning' | 'error' | 'info' | 'default';
}

export interface InsightEvidence {
  quote: string;
  speaker: 'patient' | 'provider';
  confidence?: number;
}

export interface InsightCardProps {
  /** Card title */
  title: string;
  /** Summary text (AI-generated) */
  summary?: string;
  /** Extracted values */
  values?: InsightValue[];
  /** Evidence snippets from transcript */
  evidence?: InsightEvidence[];
  /** Overall confidence score 0-1 */
  confidence?: number;
  /** Info content explaining methodology */
  infoContent?: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Default expanded state */
  defaultExpanded?: boolean;
  /** Badge/count to show in header */
  badge?: number;
}

function getChipColor(color: InsightValue['color']) {
  switch (color) {
    case 'success': return { bg: '#dcfce7', text: '#166534' };
    case 'warning': return { bg: '#fef9c3', text: '#854d0e' };
    case 'error': return { bg: '#fee2e2', text: '#991b1b' };
    case 'info': return { bg: '#dbeafe', text: '#1e40af' };
    default: return { bg: '#f3f4f6', text: '#374151' };
  }
}

function formatValue(value: InsightValue['value']): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

export function InsightCard({
  title,
  summary,
  values = [],
  evidence = [],
  confidence,
  infoContent,
  icon,
  defaultExpanded = false,
  badge,
}: InsightCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [infoOpen, setInfoOpen] = useState(false);
  const hasExpandedContent = evidence.length > 0 || values.length > 3;

  return (
    <>
      <Card
        sx={{
          borderRadius: 2,
          border: '1px solid',
          borderColor: expanded ? 'primary.light' : 'divider',
          boxShadow: 'none',
          transition: 'all 200ms ease',
          '&:hover': {
            borderColor: 'primary.light',
          },
        }}
      >
        {/* Header */}
        <Box
          onClick={hasExpandedContent ? () => setExpanded(!expanded) : undefined}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            cursor: hasExpandedContent ? 'pointer' : 'default',
            '&:hover': hasExpandedContent ? { backgroundColor: 'action.hover' } : {},
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {icon && (
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  backgroundColor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '& svg': { fontSize: 20 },
                }}
              >
                {icon}
              </Box>
            )}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {title}
                </Typography>
                {badge !== undefined && (
                  <Chip
                    label={badge}
                    size="small"
                    sx={{
                      height: 20,
                      minWidth: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      backgroundColor: 'primary.main',
                      color: 'white',
                    }}
                  />
                )}
              </Box>
              {confidence !== undefined && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {Math.round(confidence * 100)}% confidence
                </Typography>
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {infoContent && (
              <Tooltip title="Learn more">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setInfoOpen(true);
                  }}
                  sx={{ color: 'text.secondary' }}
                >
                  <InfoOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
            {hasExpandedContent && (
              <IconButton
                size="small"
                sx={{
                  color: 'text.secondary',
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 200ms ease',
                }}
              >
                <ExpandMoreIcon sx={{ fontSize: 20 }} />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Always visible content */}
        <CardContent sx={{ pt: 0, px: 2, pb: 2, '&:last-child': { pb: 2 } }}>
          {/* Summary */}
          {summary && (
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', lineHeight: 1.6, mb: values.length > 0 ? 1.5 : 0 }}
            >
              {summary}
            </Typography>
          )}

          {/* Values preview (first 3) */}
          {values.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {values.slice(0, 3).map((v, i) => {
                const colors = getChipColor(v.color);
                return (
                  <Chip
                    key={i}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 500 }}>
                          {v.label}:
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {formatValue(v.value)}
                        </Typography>
                      </Box>
                    }
                    size="small"
                    sx={{
                      height: 'auto',
                      py: 0.25,
                      backgroundColor: colors.bg,
                      color: colors.text,
                      '& .MuiChip-label': { px: 1 },
                    }}
                  />
                );
              })}
              {values.length > 3 && (
                <Chip
                  label={`+${values.length - 3} more`}
                  size="small"
                  variant="outlined"
                  sx={{ height: 24, fontSize: 11 }}
                />
              )}
            </Box>
          )}
        </CardContent>

        {/* Expanded content */}
        {hasExpandedContent && (
          <Collapse in={expanded}>
            <Divider />
            <CardContent sx={{ pt: 2, px: 2, pb: 2, '&:last-child': { pb: 2 } }}>
              {/* All values */}
              {values.length > 3 && (
                <Box sx={{ mb: evidence.length > 0 ? 2 : 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1, display: 'block' }}>
                    All Values
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 1 }}>
                    {values.map((v, i) => {
                      const colors = getChipColor(v.color);
                      return (
                        <Box
                          key={i}
                          sx={{
                            p: 1,
                            borderRadius: 1,
                            backgroundColor: colors.bg,
                          }}
                        >
                          <Typography variant="caption" sx={{ color: colors.text, display: 'block' }}>
                            {v.label}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }}>
                            {formatValue(v.value)}
                          </Typography>
                          {v.confidence !== undefined && (
                            <Typography variant="caption" sx={{ color: colors.text, opacity: 0.7 }}>
                              {Math.round(v.confidence * 100)}% conf
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

              {/* Evidence */}
              {evidence.length > 0 && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1, display: 'block' }}>
                    Evidence from Transcript
                  </Typography>
                  <EvidenceList evidence={evidence} maxItems={5} />
                </Box>
              )}
            </CardContent>
          </Collapse>
        )}
      </Card>

      {/* Info Dialog */}
      <Dialog open={infoOpen} onClose={() => setInfoOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
            {infoContent}
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  );
}
