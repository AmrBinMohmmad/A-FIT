import { Platform } from "react-native";

/**
 * Dimensional tokens — theme-independent. 4pt spacing, signage radii (tight, never pill
 * except the roundel), a fixed type scale on IBM Plex Sans Arabic, 150–250ms motion.
 */

export const spacing = { none: 0, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

export const radii = { none: 0, sm: 6, md: 10, lg: 12, xl: 16, full: 999 } as const;

export const fontSize = {
  caption: 11,
  footnote: 13,
  body: 15,
  callout: 16,
  subtitle: 18,
  title: 22,
  largeTitle: 28,
  display: 44,
} as const;

export const lineHeight = {
  caption: 16,
  footnote: 18,
  body: 22,
  callout: 24,
  subtitle: 26,
  title: 28,
  largeTitle: 34,
  display: 48,
} as const;

export const fontWeight = { regular: "400", medium: "500", bold: "700" } as const;

/** Registered with useFonts in app/_layout.tsx — keys must match those names. */
export const fontFamily = {
  regular: "IBMPlexSansArabic_400Regular",
  medium: "IBMPlexSansArabic_500Medium",
  bold: "IBMPlexSansArabic_700Bold",
} as const;

export const duration = { fast: 150, base: 200, slow: 250, travel: 600 } as const;

export const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 } as const;
/** 44pt on iOS (HIG), 48dp on Android (Material 3). */
export const MIN_TOUCH_TARGET: number = Platform.select({ android: 48, default: 44 });

export type Spacing = typeof spacing;
export type Radii = typeof radii;
export type FontSize = typeof fontSize;
export type LineHeight = typeof lineHeight;
export type FontWeight = typeof fontWeight;
export type FontFamily = typeof fontFamily;
export type Duration = typeof duration;
