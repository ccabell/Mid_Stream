import type { TypographyVariants } from '@mui/material';

const FONT_PRIMARY = 'Plus Jakarta Sans, Noto Sans, serif';

const FONT_STYLES = {
  fontFamily: FONT_PRIMARY,
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightSemiBold: 600,
  fontWeightBold: 700,
};

const FONT_SIZES = {
  bodySmall: 12,
  bodyMedium: 14,
  bodyLarge: 16,
  subtitleMedium: 18,
  subtitleLarge: 20,
  titleSmall: 24,
  titleMedium: 28,
  titleLarge: 36,
  titleXLarge: 42,
  displayMedium: 54,
  displayLarge: 62,
  displayXLarge: 72,
};

const typography: Omit<TypographyVariants, 'pxToRem' | 'htmlFontSize' | 'fontSize'> = {
  ...FONT_STYLES,

  h1: {
    fontSize: FONT_SIZES.displayMedium,
    fontWeight: FONT_STYLES.fontWeightBold,
    lineHeight: 64.8 / FONT_SIZES.displayMedium,
  },
  h2: {
    fontSize: FONT_SIZES.titleXLarge,
    fontWeight: FONT_STYLES.fontWeightSemiBold,
    lineHeight: 50.4 / FONT_SIZES.titleXLarge,
  },
  h3: {
    fontSize: FONT_SIZES.titleLarge,
    fontWeight: FONT_STYLES.fontWeightSemiBold,
    lineHeight: 46.8 / FONT_SIZES.titleLarge,
  },
  h4: {
    fontSize: FONT_SIZES.titleXLarge,
    fontWeight: FONT_STYLES.fontWeightMedium,
    lineHeight: 50.4 / FONT_SIZES.titleXLarge,
  },
  h5: {
    fontSize: FONT_SIZES.titleMedium,
    fontWeight: FONT_STYLES.fontWeightMedium,
    lineHeight: 39.2 / FONT_SIZES.titleMedium,
  },
  h6: {
    fontSize: FONT_SIZES.titleSmall,
    fontWeight: FONT_STYLES.fontWeightMedium,
    lineHeight: 33.6 / FONT_SIZES.titleSmall,
  },
  subtitle1: {
    fontSize: FONT_SIZES.subtitleLarge,
    fontWeight: FONT_STYLES.fontWeightRegular,
    lineHeight: 30 / FONT_SIZES.subtitleLarge,
  },
  subtitle2: {
    fontSize: FONT_SIZES.subtitleMedium,
    fontWeight: FONT_STYLES.fontWeightMedium,
    lineHeight: 27 / FONT_SIZES.subtitleMedium,
  },
  body1: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: FONT_STYLES.fontWeightRegular,
    lineHeight: 24 / FONT_SIZES.bodyLarge,
  },
  body2: {
    fontSize: FONT_SIZES.bodyMedium,
    fontWeight: FONT_STYLES.fontWeightLight,
    lineHeight: 21 / FONT_SIZES.bodyMedium,
  },
  caption: {
    fontSize: FONT_SIZES.bodySmall,
    fontWeight: FONT_STYLES.fontWeightLight,
    lineHeight: 18 / FONT_SIZES.bodySmall,
  },
  button: {
    fontSize: FONT_SIZES.bodyMedium,
    fontWeight: FONT_STYLES.fontWeightLight,
    lineHeight: 21 / FONT_SIZES.bodyMedium,
    textTransform: 'initial' as const,
  },
  overline: {
    fontFamily: FONT_STYLES.fontFamily,
  },
};

export default typography;
