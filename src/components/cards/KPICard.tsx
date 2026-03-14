/**
 * KPICard - Specialized accordion card for KPI scores
 *
 * Displays a percentage/score with color-coded indicator,
 * expandable details, and optional evidence.
 */
import { useState } from 'react';
import Card from '@mui/material/Card';
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
import LinearProgress from '@mui/material/LinearProgress';
import { EvidenceList } from './EvidenceQuote';

export interface KPIEvidence {
  quote: string;
  speaker: 'patient' | 'provider';
  confidence?: number;
}

export interface KPICardProps {
  /** KPI name/title */
  title: string;
  /** Score value (0-100) */
  score: number;
  /** Short description of what this KPI measures */
  description?: string;
  /** Detailed bullet points explaining the score */
  details?: string[];
  /** Evidence from transcript */
  evidence?: KPIEvidence[];
  /** Info content explaining KPI methodology */
  infoContent?: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Default expanded state */
  defaultExpanded?: boolean;
}

function getScoreColor(score: number): { main: string; light: string; label: string } {
  if (score >= 80) return { main: '#16a34a', light: '#dcfce7', label: 'Excellent' };
  if (score >= 60) return { main: '#2563eb', light: '#dbeafe', label: 'Good' };
  if (score >= 40) return { main: '#d97706', light: '#fef9c3', label: 'Needs Work' };
  return { main: '#dc2626', light: '#fee2e2', label: 'Critical' };
}

export function KPICard({
  title,
  score,
  description,
  details = [],
  evidence = [],
  infoContent,
  icon,
  defaultExpanded = false,
}: KPICardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [infoOpen, setInfoOpen] = useState(false);
  const colors = getScoreColor(score);
  const hasExpandedContent = details.length > 0 || evidence.length > 0;
  const clampedScore = Math.max(0, Math.min(100, score));

  return (
    <>
      <Card
        sx={{
          borderRadius: 2,
          border: '1px solid',
          borderColor: expanded ? colors.main : 'divider',
          boxShadow: 'none',
          transition: 'all 200ms ease',
          '&:hover': {
            borderColor: colors.main,
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
            {icon && (
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  backgroundColor: colors.light,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.main,
                  '& svg': { fontSize: 22 },
                }}
              >
                {icon}
              </Box>
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.25 }}>
                {title}
              </Typography>
              {/* Progress bar with score */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={clampedScore}
                  sx={{
                    flex: 1,
                    height: 8,
                    borderRadius: 1,
                    backgroundColor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: colors.main,
                      borderRadius: 1,
                    },
                  }}
                />
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    color: colors.main,
                    minWidth: 45,
                    textAlign: 'right',
                  }}
                >
                  {Math.round(clampedScore)}%
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
            <Box
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: 0.75,
                backgroundColor: colors.light,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: colors.main,
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                {colors.label}
              </Typography>
            </Box>
            {infoContent && (
              <Tooltip title="How this is calculated">
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

        {/* Expanded Content */}
        {hasExpandedContent && (
          <Collapse in={expanded}>
            <Box
              sx={{
                px: 2,
                pb: 2,
                pt: 0,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              {/* Description */}
              {description && (
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5, mb: 1 }}>
                  {description}
                </Typography>
              )}

              {/* Details bullets */}
              {details.length > 0 && (
                <Box component="ul" sx={{ m: 0, pl: 2.5, mt: 1.5 }}>
                  {details.map((detail, i) => (
                    <Box component="li" key={i} sx={{ mb: 0.5 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {detail}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Evidence */}
              {evidence.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, color: 'text.secondary', mb: 1, display: 'block' }}
                  >
                    Supporting Evidence
                  </Typography>
                  <EvidenceList evidence={evidence} maxItems={3} compact />
                </Box>
              )}
            </Box>
          </Collapse>
        )}
      </Card>

      {/* Info Dialog */}
      <Dialog open={infoOpen} onClose={() => setInfoOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ lineHeight: 1.7, mb: 2 }}>
            {infoContent}
          </Typography>
          <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
              Score Interpretation
            </Typography>
            <Box sx={{ display: 'grid', gap: 0.5 }}>
              <Typography variant="caption" sx={{ color: '#16a34a' }}>80-100%: Excellent</Typography>
              <Typography variant="caption" sx={{ color: '#2563eb' }}>60-79%: Good</Typography>
              <Typography variant="caption" sx={{ color: '#d97706' }}>40-59%: Needs Work</Typography>
              <Typography variant="caption" sx={{ color: '#dc2626' }}>0-39%: Critical</Typography>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
