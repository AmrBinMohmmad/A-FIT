import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable, View, type GestureResponderEvent } from "react-native";

import { RText } from "@/components/RText";
import { MIN_TOUCH_TARGET } from "@/constants/tokens";
import { useTheme } from "@/contexts/ThemeContext";
import { makeStyles } from "@/hooks/useStyles";

interface ChoiceRowProps {
  title: string;
  hint?: string;
  selected: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: (event: GestureResponderEvent) => void;
}

const useStyles = makeStyles((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    minHeight: MIN_TOUCH_TARGET + 8,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  selected: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryMuted },
  text: { flex: 1, gap: 2 },
}));

/** A selectable option row with a clear selected state (border + fill + check). */
export function ChoiceRow({ title, hint, selected, icon, onPress }: ChoiceRowProps) {
  const styles = useStyles();
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={(event) => {
        void Haptics.selectionAsync().catch(() => undefined);
        onPress(event);
      }}
      style={[styles.row, selected && styles.selected]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}>
      {icon ? (
        <Ionicons name={icon} size={22} color={selected ? theme.colors.primary : theme.colors.textMuted} />
      ) : null}
      <View style={styles.text}>
        <RText variant="callout" weight={selected ? "bold" : "medium"}>
          {title}
        </RText>
        {hint ? (
          <RText variant="footnote" color="textSecondary">
            {hint}
          </RText>
        ) : null}
      </View>
      {selected ? <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} /> : null}
    </Pressable>
  );
}
