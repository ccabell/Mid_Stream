/**
 * AccordionCard - Card Type 2: Accordion Card
 *
 * A container pattern with a concise surface-level value
 * and an expandable internal data set.
 *
 * Variant 2A: Short Value Accordion (percentage, score, enum)
 * Variant 2B: Long Value Accordion (phrase/sentence)
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

export interface AccordionCardProps {
  /** Card title/label */
  title: string;
  /** The surface-level value (short: "85%", "High" or long: sentence) */
  value: string | number;
  /** Whether value is short (percentage/enum) or long (sentence) */
  variant?: 'short' | 'long';
  /** Color indicator for value */
  valueColor?: 'success' | 'warning' | 'error' | 'info' | 'default';
  /** Expanded content - can be any React node */
  children?: React.ReactNode;
  /** Info content explaining how value was calculated */
  infoContent?: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Default expanded state */
  defaultExpanded?: boolean;
}

function getValueColorHex(color: AccordionCardProps['valueColor']) {
  switch (color) {
    case 'success': return '#16a34a';
    case 'warning': return '#d97706';
    case 'error': return '#dc2626';
    case 'info': return '#2563eb';
    default: return '#6b7280';
  }
}

export function AccordionCard({
  title,
  value,
  variant = 'short',
  valueColor = 'default',
  children,
  infoContent,
  icon,
  defaultExpanded = false,
}: AccordionCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [infoOpen, setInfoOpen] = useState(false);
  const hasContent = !!children;
  const displayValue = typeof value === 'number' ? `${value}%` : value;

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
        {/* Header - always visible */}
        <Box
          onClick={hasContent ? () => setExpanded(!expanded) : undefined}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            cursor: hasContent ? 'pointer' : 'default',
            '&:hover': hasContent ? { backgroundColor: 'action.hover' } : {},
            borderRadius: expanded ? '8px 8px 0 0' : 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
            {icon && (
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  backgroundColor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary',
                  '& svg': { fontSize: 20 },
                }}
              >
                {icon}
              </Box>
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.25 }}>
                {title}
              </Typography>
              {variant === 'short' ? (
                <Chip
                  label={displayValue}
                  size="small"
                  sx={{
                    backgroundColor: `${getValueColorHex(valueColor)}15`,
                    color: getValueColorHex(valueColor),
                    fontWeight: 600,
                    fontSize: 13,
                    height: 26,
                  }}
                />
              ) : (
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 500,
                    color: 'text.primary',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {displayValue}
                </Typography>
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
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
            {hasContent && (
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
        {hasContent && (
          <Collapse in={expanded}>
            <CardContent
              sx={{
                pt: 0,
                px: 2,
                pb: 2,
                '&:last-child': { pb: 2 },
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              {children}
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
