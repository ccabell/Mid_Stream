/**
 * SummaryCard - Card Type 1: Summary-Only Card
 *
 * Displays a plain-language summary generated from a prompt.
 * No internal hierarchy, no required values.
 * Used for narrative summaries, explanations, overviews.
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

export interface SummaryCardProps {
  /** Card title/label */
  title: string;
  /** Summary text content */
  summary: string;
  /** Extended content (shown when expanded) */
  extendedSummary?: string;
  /** Info tooltip or modal content explaining how the summary was generated */
  infoContent?: string;
  /** Optional icon to display next to title */
  icon?: React.ReactNode;
  /** Whether the card is collapsible */
  collapsible?: boolean;
  /** Default expanded state */
  defaultExpanded?: boolean;
}

export function SummaryCard({
  title,
  summary,
  extendedSummary,
  infoContent,
  icon,
  collapsible = false,
  defaultExpanded = true,
}: SummaryCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <Card
        sx={{
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
          '&:hover': {
            borderColor: 'primary.light',
          },
          transition: 'border-color 200ms ease',
        }}
      >
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {icon && (
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '& svg': { fontSize: 18 },
                  }}
                >
                  {icon}
                </Box>
              )}
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {title}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {infoContent && (
                <Tooltip title="How this was generated">
                  <IconButton size="small" onClick={() => setInfoOpen(true)} sx={{ color: 'text.secondary' }}>
                    <InfoOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
              {collapsible && (
                <IconButton
                  size="small"
                  onClick={() => setExpanded(!expanded)}
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

          {/* Content */}
          <Collapse in={expanded}>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}
            >
              {summary}
            </Typography>
            {extendedSummary && (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.6,
                  mt: 1.5,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {extendedSummary}
              </Typography>
            )}
          </Collapse>
        </CardContent>
      </Card>

      {/* Info Dialog */}
      <Dialog open={infoOpen} onClose={() => setInfoOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>How this was generated</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
            {infoContent}
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  );
}
