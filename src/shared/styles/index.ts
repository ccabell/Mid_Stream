import { createTheme } from '@mui/material/styles';
import { palette } from './base/palette';
import typography from './base/typography';

// Box shadows matching A360
const boxShadows = {
  none: 'none',
  'shadow-xs': '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
  'shadow-sm': '0px 1px 3px 0px rgba(16, 24, 40, 0.10), 0px 1px 2px 0px rgba(16, 24, 40, 0.06)',
  'shadow-md': '0px 4px 8px -2px rgba(16, 24, 40, 0.10), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)',
  'shadow-lg': '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
  'shadow-xl': '0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03)',
  'shadow-2xl': '0px 24px 48px -12px rgba(16, 24, 40, 0.18)',
  'shadow-3xl': '0px 32px 64px -12px rgba(16, 24, 40, 0.14)',
};

// Border configuration
const borders = {
  borderWidth: {
    0: 0,
    1: '1px',
    1.25: '1.25px',
    2: '2px',
    4: '4px',
    8: '8px',
  },
  borderRadius: {
    0: '0px',
    2: '2px',
    4: '4px',
    6: '6px',
    8: '8px',
    10: '10px',
    12: '12px',
    16: '16px',
    24: '24px',
    32: '32px',
    full: '9999px',
  },
};

// Backdrop blurs
const backdropBlurs = {
  sm: 'blur(4px)',
  md: 'blur(8px)',
  lg: 'blur(12px)',
  xl: 'blur(16px)',
};

// Shades for overlays
const shades = {
  overlayPrimarySoft: 'rgba(84, 123, 163, 0.08)',
  overlayPrimaryStrong: 'rgba(84, 123, 163, 0.16)',
  overlaySecondarySoft: 'rgba(197, 204, 217, 0.08)',
  overlaySecondaryStrong: 'rgba(197, 204, 217, 0.16)',
};

export const theme = createTheme({
  palette: {
    ...palette,
    mode: 'light',
  },
  typography,
  boxShadows,
  borders,
  backdropBlurs,
  shades,
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: palette.background.surfaceSoft,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
        contained: {
          boxShadow: boxShadows['shadow-xs'],
          '&:hover': {
            boxShadow: boxShadows['shadow-sm'],
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: boxShadows['shadow-sm'],
          border: `1px solid ${palette.divider}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${palette.divider}`,
        },
        head: {
          fontWeight: 600,
          backgroundColor: palette.background.surfaceSoft,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
        },
      },
    },
  },
});

// Re-export for convenience
export { palette } from './base/palette';
export { default as typography } from './base/typography';
