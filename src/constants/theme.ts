import { darkColors, lightColors, type ThemeColors } from "@/constants/colors";
import { shadows, type Shadows } from "@/constants/shadows";
import {
  duration,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  radii,
  spacing,
  type Duration,
  type FontFamily,
  type FontSize,
  type FontWeight,
  type LineHeight,
  type Radii,
  type Spacing,
} from "@/constants/tokens";

export type ThemeMode = "system" | "light" | "dark";

export interface Theme {
  isDark: boolean;
  colors: ThemeColors;
  spacing: Spacing;
  radii: Radii;
  fontSize: FontSize;
  lineHeight: LineHeight;
  fontWeight: FontWeight;
  fontFamily: FontFamily;
  duration: Duration;
  shadows: Shadows;
}

const shared = { spacing, radii, fontSize, lineHeight, fontWeight, fontFamily, duration, shadows } as const;

export const lightTheme: Theme = { isDark: false, colors: lightColors, ...shared };
export const darkTheme: Theme = { isDark: true, colors: darkColors, ...shared };

export function themeFor(isDark: boolean): Theme {
  return isDark ? darkTheme : lightTheme;
}
