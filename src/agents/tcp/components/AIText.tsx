/**
 * AIText Component (Production-style)
 *
 * Text display with variants for lists, values, and tags.
 */

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

type AITextVariant = 'default' | 'list' | 'value' | 'tags';

interface AITextProps {
  value: string | string[];
  variant?: AITextVariant;
  endAdornment?: string;
}

export function AIText({ value, variant = 'default', endAdornment }: AITextProps) {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return (
      <Typography variant="body2" color="text.secondary">
        -
      </Typography>
    );
  }

  switch (variant) {
    case 'list':
      if (!Array.isArray(value)) {
        return (
          <Typography variant="body2" color="text.secondary">
            {value}
          </Typography>
        );
      }
      return (
        <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
          {value.map((item, index) => (
            <Box component="li" key={index} sx={{ mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                {item}
              </Typography>
            </Box>
          ))}
        </Box>
      );

    case 'value':
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {Array.isArray(value) ? value.join(', ') : value}
          </Typography>
          {endAdornment && (
            <Typography variant="caption" color="text.secondary">
              {endAdornment}
            </Typography>
          )}
        </Box>
      );

    case 'tags':
      const tags = Array.isArray(value) ? value : [value];
      return (
        <Typography variant="body2" color="text.secondary">
          {tags.join(', ')}
        </Typography>
      );

    default:
      return (
        <Typography variant="body2" color="text.secondary">
          {Array.isArray(value) ? value.join(' ') : value}
        </Typography>
      );
  }
}
