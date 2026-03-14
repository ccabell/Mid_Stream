/**
 * AICard Component (Production-style)
 *
 * Priced treatment card with title/price header and label/value items.
 */

import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

interface AICardProps {
  title: string;
  price?: string;
  items: Array<{ label: string; value: React.ReactNode }>;
}

export function AICard({ title, price, items }: AICardProps) {
  if (!title) return null;

  return (
    <Stack
      sx={{
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        '@media print': {
          breakInside: 'avoid',
          pageBreakInside: 'avoid',
        },
      }}
    >
      {/* Header with title and price */}
      <Stack
        direction="row"
        alignItems="center"
        gap={1.5}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          p: 2,
          bgcolor: 'grey.50',
        }}
        justifyContent="space-between"
      >
        <Typography variant="body1" fontWeight={500} color="text.primary">
          {title}
        </Typography>
        {price && (
          <Typography variant="body1" fontWeight={600} color="primary.main">
            {price}
          </Typography>
        )}
      </Stack>

      {/* Items list */}
      <Stack component="ul" gap={0.25} px={2} py={1} sx={{ listStyle: 'none', m: 0 }}>
        {items.map((item, index) => (
          <Stack
            key={`${item.label}-${index}`}
            pt={1}
            pb={index === items.length - 1 ? 0 : 1}
            component="li"
            direction={{ xs: 'column', sm: 'row' }}
            gap={1}
            borderBottom={index !== items.length - 1 ? '1px solid' : 'none'}
            borderColor="divider"
          >
            <Typography variant="body1" fontWeight={500} minWidth={100} color="text.secondary">
              {item.label}
            </Typography>
            <Typography variant="body1" fontWeight={400} color="text.secondary">
              {item.value || '-'}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
