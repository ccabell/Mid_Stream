/**
 * AIHeading Component (Production-style)
 *
 * Section header with size variants and optional subtitle.
 */

import { memo } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type AIHeadingSize = 'small' | 'medium' | 'large';

interface AIHeadingProps {
  title: string;
  subtitle?: string;
  size?: AIHeadingSize;
}

const SIZE_CONFIG = {
  small: {
    gap: 0.5,
    titleVariant: 'body2' as const,
    subtitleVariant: 'body2' as const,
    color: 'text.secondary',
    fontWeight: 500,
    isDivider: false,
    px: 0,
  },
  medium: {
    gap: 0.75,
    titleVariant: 'body1' as const,
    subtitleVariant: 'body2' as const,
    color: 'text.primary',
    fontWeight: 500,
    isDivider: false,
    px: 0,
  },
  large: {
    gap: 1,
    titleVariant: 'h6' as const,
    subtitleVariant: 'body1' as const,
    color: 'text.primary',
    fontWeight: 600,
    isDivider: true,
    px: 1,
  },
};

export const AIHeading = memo(function AIHeading({ title, subtitle, size = 'large' }: AIHeadingProps) {
  const config = SIZE_CONFIG[size];

  return (
    <Stack
      gap={config.gap}
      sx={{
        ...(config.isDivider && {
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 1,
        }),
        ...(config.px && { px: config.px }),
      }}
    >
      <Typography
        variant={config.titleVariant}
        color={config.color}
        fontWeight={config.fontWeight}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography variant={config.subtitleVariant} color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Stack>
  );
});
