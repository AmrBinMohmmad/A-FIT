import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { RText, type TextColor } from "@/components/RText";
import { MIN_TOUCH_TARGET } from "@/constants/tokens";
import { useTheme } from "@/contexts/ThemeContext";
import { makeStyles } from "@/hooks/useStyles";

type Variant = "primary" | "accent" | "secondary" | "ghost" | "danger";

interface ButtonProps extends Omit<PressableProps, "style" | "children"> {
  title: string;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  size?: "md" | "lg";
  style?: StyleProp<ViewStyle>;
}

const useStyles = makeStyles((theme) => ({
  base: {
    minHeight: MIN_TOUCH_TARGET,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    borderWidth: 1,
  },
  lg: { minHeight: 52 },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
}));

/** One button vocabulary: primary (line teal), accent (signal orange, one per screen), secondary, ghost, danger. */
export function Button({
  title,
  variant = "primary",
  icon,
  loading,
  size = "md",
  style,
  disabled,
  onPress,
  ...rest
}: ButtonProps) {
  const { theme } = useTheme();
  const styles = useStyles();
  const c = theme.colors;

  const palette: Record<Variant, { bg: string; border: string; text: TextColor }> = {
    primary: { bg: c.primary, border: c.primary, text: "onPrimary" },
    accent: { bg: c.accent, border: c.accent, text: "onAccent" },
    secondary: { bg: c.surface, border: c.border, text: "textPrimary" },
    ghost: { bg: "transparent", border: "transparent", text: "primary" },
    danger: { bg: c.dangerBg, border: c.dangerBg, text: "danger" },
  };
  const p = palette[variant];
  const isDisabled = Boolean(disabled) || Boolean(loading);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: Boolean(loading) }}
      disabled={isDisabled}
      onPress={(e) => {
        if (variant === "accent") void Haptics.selectionAsync().catch(() => undefined);
        onPress?.(e);
      }}
      style={({ pressed }) => [
        styles.base,
        size === "lg" && styles.lg,
        { backgroundColor: p.bg, borderColor: p.border },
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={c[p.text]} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={c[p.text]} /> : null}
          <RText variant="callout" weight="bold" color={p.text}>
            {title}
          </RText>
        </>
      )}
    </Pressable>
  );
}
