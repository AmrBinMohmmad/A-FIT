import { Text, type StyleProp, type TextProps, type TextStyle } from "react-native";

import type { ThemeColors } from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * The typography primitive — the ONLY place text styling lives (ESLint bans RN Text
 * elsewhere). Sets no textAlign by default so text follows the writing direction.
 * `tabular` turns on tabular numerals for figures that must line up.
 */
export type TextVariant =
  "display" | "largeTitle" | "title" | "subtitle" | "body" | "callout" | "footnote" | "caption";

export type TextColor = keyof Pick<
  ThemeColors,
  | "textPrimary"
  | "textSecondary"
  | "textMuted"
  | "textInverted"
  | "primary"
  | "onPrimary"
  | "accent"
  | "onAccent"
  | "onSignPanel"
  | "signPanelMuted"
  | "danger"
  | "success"
  | "warning"
>;

type Weight = "regular" | "medium" | "bold";

const VARIANT_WEIGHT: Record<TextVariant, Weight> = {
  display: "bold",
  largeTitle: "bold",
  title: "bold",
  subtitle: "bold",
  body: "regular",
  callout: "medium",
  footnote: "regular",
  caption: "medium",
};

export interface RTextProps extends TextProps {
  variant?: TextVariant;
  weight?: Weight;
  color?: TextColor;
  align?: TextStyle["textAlign"];
  tabular?: boolean;
  style?: StyleProp<TextStyle>;
}

export function RText({
  variant = "body",
  weight,
  color = "textPrimary",
  align,
  tabular,
  style,
  children,
  ...rest
}: RTextProps) {
  const { theme } = useTheme();
  const resolvedWeight = weight ?? VARIANT_WEIGHT[variant];

  const base: TextStyle = {
    color: theme.colors[color],
    fontFamily: theme.fontFamily[resolvedWeight],
    fontSize: theme.fontSize[variant],
    lineHeight: theme.lineHeight[variant],
    ...(align ? { textAlign: align } : null),
    ...(tabular ? { fontVariant: ["tabular-nums"] } : null),
  };

  return (
    <Text style={[base, style]} {...rest}>
      {children}
    </Text>
  );
}
