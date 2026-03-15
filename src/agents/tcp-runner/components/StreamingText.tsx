/**
 * Streaming Text Component
 *
 * Displays streaming text with a blinking cursor effect.
 */

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { keyframes } from '@mui/system';

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

interface StreamingTextProps {
  text: string;
  isStreaming: boolean;
  variant?: 'body1' | 'body2' | 'code';
}

export function StreamingText({
  text,
  isStreaming,
  variant = 'body2',
}: StreamingTextProps) {
  const isCode = variant === 'code';

  return (
    <Box
      sx={{
        fontFamily: isCode ? 'monospace' : 'inherit',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        lineHeight: 1.6,
      }}
    >
      <Typography
        variant={isCode ? 'body2' : variant}
        component="span"
        sx={{
          fontFamily: isCode ? 'monospace' : 'inherit',
        }}
      >
        {text}
      </Typography>
      {isStreaming && (
        <Box
          component="span"
          sx={{
            display: 'inline-block',
            width: 2,
            height: '1em',
            bgcolor: 'primary.main',
            ml: 0.25,
            verticalAlign: 'text-bottom',
            animation: `${blink} 1s step-end infinite`,
          }}
        />
      )}
    </Box>
  );
}

export default StreamingText;
