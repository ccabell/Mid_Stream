import type { SimplePaletteColorOptions, TypeBackground, TypeText } from '@mui/material';

type DisabledColor = {
  disabledSoft: string;
  disabledMedium: string;
};

interface PaletteTypes {
  background: TypeBackground;
  text: TypeText;
  primary: SimplePaletteColorOptions;
  secondary: SimplePaletteColorOptions;
  info: SimplePaletteColorOptions;
  success: SimplePaletteColorOptions;
  warning: SimplePaletteColorOptions;
  error: SimplePaletteColorOptions;
  disabledColor: DisabledColor;
  divider: string;
}

const WHITE_COLOR = '#fff';

const PRIMARY_COLORS = {
  main: '#547BA3',
  dark: '#416288',
  darker: '#324A68',
  contrastText: WHITE_COLOR,
};

const SECONDARY_COLORS = {
  main: '#C5CCD9',
  dark: '#98A2B3',
  darker: '#344054',
  contrastText: WHITE_COLOR,
};

const INFO_COLORS = {
  main: '#F5F7FA',
  contrastText: WHITE_COLOR,
};

const WARNING_COLORS = {
  light: '#FFFAEB',
  main: '#F79009',
  contrastText: WHITE_COLOR,
};

const ERRORS_COLORS = {
  light: '#FEF3F2',
  main: '#FF6666',
  contrastText: WHITE_COLOR,
};

const SUCCESS_COLORS = {
  light: '#ECFDF3',
  main: '#17826A',
  contrastText: WHITE_COLOR,
};

const DISABLED_COLORS = {
  disabledSoft: '#EDEDED',
  disabledMedium: '#96999E',
};

const TEXT_COLORS: TypeText = {
  secondary: '#667085',
  primary: '#344054',
  disabled: DISABLED_COLORS.disabledSoft,
};

const BACKGROUND_COLORS = {
  default: WHITE_COLOR,
  paper: WHITE_COLOR,
  surfaceSoft: '#F9FAFB',
  surfaceMedium: '#F2F4F7',
  surfaceStrong: '#EAECF0',
};

export const palette: PaletteTypes = {
  background: BACKGROUND_COLORS,
  disabledColor: DISABLED_COLORS,
  divider: BACKGROUND_COLORS.surfaceStrong,
  text: TEXT_COLORS,
  primary: PRIMARY_COLORS,
  secondary: SECONDARY_COLORS,
  info: INFO_COLORS,
  success: SUCCESS_COLORS,
  warning: WARNING_COLORS,
  error: ERRORS_COLORS,
} as const;
