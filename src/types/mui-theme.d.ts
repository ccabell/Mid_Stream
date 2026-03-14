// src/types/mui-theme.d.ts
import '@mui/material/styles';

type TypographyHeadingProps = {
  fontFamily?: string;
  color?: string;
  fontSize: number | string;
  fontWeight: number;
  lineHeight: number;
};

type TypographyBodyProps = Pick<TypographyHeadingProps, 'fontSize' | 'fontWeight' | 'lineHeight'>;

type FontSize = {
  bodySmall: number;
  bodyMedium: number;
  bodyLarge: number;
  subtitleMedium: number;
  subtitleLarge: number;
  titleSmall: number;
  titleMedium: number;
  titleLarge: number;
  titleXLarge: number;
  displayMedium: number;
  displayLarge: number;
  displayXLarge: number;
};

export interface BackdropBlursTypes {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface BoxShadowTypes {
  none: string;
  'shadow-xs': string;
  'shadow-sm': string;
  'shadow-md': string;
  'shadow-lg': string;
  'shadow-xl': string;
  'shadow-2xl': string;
  'shadow-3xl': string;
}

type BorderWidth = {
  0: number;
  1: string;
  1.25: string;
  2: string;
  4: string;
  8: string;
};

type BorderRadius = {
  0: string;
  2: string;
  4: string;
  6: string;
  8: string;
  10: string;
  12: string;
  16: string;
  24: string;
  32: string;
  full: string;
};

export interface BorderTypes {
  borderWidth: BorderWidth;
  borderRadius: BorderRadius;
}

export interface ShadesTypes {
  overlayPrimarySoft: string;
  overlayPrimaryStrong: string;
  overlaySecondarySoft: string;
  overlaySecondaryStrong: string;
}

type DisabledColor = {
  disabledSoft: string;
  disabledMedium: string;
};

declare module '@mui/material/IconButton' {
  interface IconButtonOwnProps {
    variant?: 'rounded' | 'circle';
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    tertiary: true;
    ghost: true;
    secondary: true;
  }
}

declare module '@mui/material/styles' {
  interface ZIndex {
    negative: -1;
    z1: 1;
    z5: 5;
    z10: 10;
  }

  interface Theme {
    boxShadows: BoxShadowTypes;
    backdropBlurs: BackdropBlursTypes;
    borders: BorderTypes;
    shades: ShadesTypes;
  }

  interface ThemeOptions {
    boxShadows?: BoxShadowTypes;
    backdropBlurs?: BackdropBlursTypes;
    borders?: BorderTypes;
    shades?: ShadesTypes;
  }

  interface PaletteColor {
    darker?: string;
  }

  interface SimplePaletteColorOptions {
    darker?: string;
  }

  interface TypeBackground {
    surfaceSoft: string;
    surfaceMedium: string;
    surfaceStrong: string;
  }

  interface Palette {
    disabledColor: DisabledColor;
  }

  interface PaletteOptions {
    disabledColor?: DisabledColor;
  }
}
