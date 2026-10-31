import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { CodeChip } from "@/components/line/CodeChip";
import { RText } from "@/components/RText";
import { MIN_TOUCH_TARGET } from "@/constants/tokens";
import { useTheme } from "@/contexts/ThemeContext";
import { makeStyles } from "@/hooks/useStyles";
import { useRTL } from "@/hooks/useRTL";

interface ExitRowProps {
  code: string | number;
  title: string;
  subtitle?: string;
  value?: string;
  valueTone?: "default" | "accent" | "muted";
  tone?: "primary" | "accent" | "muted";
  onPress?: () => void;
  /** Rendered under the value: e.g. a thin budget bar. */
  trailing?: React.ReactNode;
  first?: boolean;
}

const useStyles = makeStyles((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    minHeight: MIN_TOUCH_TARGET + theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  first: { borderTopWidth: 0 },
  text: { flex: 1, gap: 1 },
  end: { alignItems: "flex-end", gap: theme.spacing.xs },
  pressed: { opacity: 0.7 },
}));

/** One exit on the station sign: a numbered chip, a title, a quiet subtitle and the live value. */
export function ExitRow({
  code,
  title,
  subtitle,
  value,
  valueTone = "default",
  tone = "primary",
  onPress,
  trailing,
  first,
}: ExitRowProps) {
  const styles = useStyles();
  const { theme } = useTheme();
  const { isRTL } = useRTL();

  const content = (
    <>
      <CodeChip code={code} tone={tone} />
      <View style={styles.text}>
        <RText variant="callout" weight="medium">
          {title}
        </RText>
        {subtitle ? (
          <RText variant="footnote" color="textSecondary" numberOfLines={1}>
            {subtitle}
          </RText>
        ) : null}
      </View>
      <View style={styles.end}>
        {value ? (
          <RText
            variant="callout"
            weight="bold"
            tabular
            color={valueTone === "accent" ? "accent" : valueTone === "muted" ? "textMuted" : "textPrimary"}>
            {value}
          </RText>
        ) : null}
        {trailing}
      </View>
      {onPress ? (
        <Ionicons
          name={isRTL ? "chevron-back" : "chevron-forward"}
          size={18}
          color={theme.colors.textMuted}
        />
      ) : null}
    </>
  );

  if (!onPress) return <View style={[styles.row, first && styles.first]}>{content}</View>;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, first && styles.first, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={title}>
      {content}
    </Pressable>
  );
}
