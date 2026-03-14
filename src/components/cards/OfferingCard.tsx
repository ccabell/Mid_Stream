/**
 * OfferingCard - Display a product/service offering with disposition
 *
 * Shows treatment/product with status indicator, value, and evidence.
 */
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import type { OfferingDisposition } from 'apiServices';

export interface OfferingCardProps {
  /** Name of the product/service */
  name: string;
  /** Type: product, service, or package */
  type: 'product' | 'service' | 'package';
  /** Disposition status */
  disposition: OfferingDisposition;
  /** Treatment area */
  area?: string | null;
  /** Quantity if applicable */
  quantity?: string | null;
  /** Monetary value */
  value?: number | null;
  /** Evidence quote */
  evidence?: {
    quote: string;
    speaker: 'patient' | 'provider';
    confidence?: number;
  };
  /** Compact display mode */
  compact?: boolean;
}

function getDispositionConfig(disposition: OfferingDisposition) {
  switch (disposition) {
    case 'performed':
      return { label: 'Performed', color: '#16a34a', bg: '#dcfce7' };
    case 'scheduled':
      return { label: 'Scheduled', color: '#2563eb', bg: '#dbeafe' };
    case 'agreed_pending':
      return { label: 'Agreed', color: '#0891b2', bg: '#cffafe' };
    case 'purchased':
      return { label: 'Purchased', color: '#16a34a', bg: '#dcfce7' };
    case 'recommended_receptive':
      return { label: 'Receptive', color: '#7c3aed', bg: '#ede9fe' };
    case 'recommended_hesitant':
      return { label: 'Hesitant', color: '#d97706', bg: '#fef9c3' };
    case 'recommended_declined':
      return { label: 'Declined', color: '#dc2626', bg: '#fee2e2' };
    case 'discussed':
    default:
      return { label: 'Discussed', color: '#6b7280', bg: '#f3f4f6' };
  }
}

function getTypeConfig(type: OfferingCardProps['type']) {
  switch (type) {
    case 'product':
      return { label: 'Product', color: '#059669' };
    case 'package':
      return { label: 'Package', color: '#7c3aed' };
    case 'service':
    default:
      return { label: 'Service', color: '#2563eb' };
  }
}

export function OfferingCard({
  name,
  type,
  disposition,
  area,
  quantity,
  value,
  evidence,
  compact = false,
}: OfferingCardProps) {
  const dispConfig = getDispositionConfig(disposition);
  const typeConfig = getTypeConfig(type);

  if (compact) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1.25,
          borderRadius: 1.5,
          backgroundColor: 'grey.50',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: dispConfig.color,
              flexShrink: 0,
            }}
          />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </Typography>
          {area && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              ({area})
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Chip
            label={dispConfig.label}
            size="small"
            sx={{
              height: 20,
              fontSize: 10,
              fontWeight: 600,
              backgroundColor: dispConfig.bg,
              color: dispConfig.color,
            }}
          />
          {value !== null && value !== undefined && (
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
              ${value.toLocaleString()}
            </Typography>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: 'white',
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          borderColor: 'primary.light',
        },
        transition: 'border-color 200ms ease',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.25 }}>
            {name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Chip
              label={typeConfig.label}
              size="small"
              sx={{
                height: 18,
                fontSize: 10,
                fontWeight: 500,
                backgroundColor: `${typeConfig.color}15`,
                color: typeConfig.color,
              }}
            />
            {area && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {area}
              </Typography>
            )}
            {quantity && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Qty: {quantity}
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
          <Chip
            label={dispConfig.label}
            size="small"
            sx={{
              height: 22,
              fontSize: 11,
              fontWeight: 600,
              backgroundColor: dispConfig.bg,
              color: dispConfig.color,
            }}
          />
          {value !== null && value !== undefined && (
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.main' }}>
              ${value.toLocaleString()}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Evidence */}
      {evidence && (
        <Box
          sx={{
            mt: 1.5,
            p: 1.25,
            borderRadius: 1,
            backgroundColor: 'grey.50',
            borderLeft: '3px solid',
            borderColor: evidence.speaker === 'patient' ? '#6366f1' : '#0891b2',
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            "{evidence.quote}"
          </Typography>
        </Box>
      )}
    </Box>
  );
}

/** List of offerings */
export interface OfferingListProps {
  offerings: OfferingCardProps[];
  compact?: boolean;
  maxItems?: number;
}

export function OfferingList({ offerings, compact = false, maxItems }: OfferingListProps) {
  const displayOfferings = maxItems ? offerings.slice(0, maxItems) : offerings;
  const remainingCount = maxItems ? offerings.length - maxItems : 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: compact ? 0.75 : 1.5 }}>
      {displayOfferings.map((offering, i) => (
        <OfferingCard key={i} {...offering} compact={compact} />
      ))}
      {remainingCount > 0 && (
        <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
          +{remainingCount} more offerings
        </Typography>
      )}
    </Box>
  );
}
