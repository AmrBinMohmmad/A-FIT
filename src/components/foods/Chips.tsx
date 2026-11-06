import { Pressable, ScrollView } from "react-native";

import { RText } from "@/components/RText";
import { makeStyles } from "@/hooks/useStyles";

export interface Chip<K extends string> {
  key: K;
  label: string;
  emoji?: string;
}

interface ChipsProps<K extends string> {
  items: readonly Chip<K>[];
  selected: K | null;
  onSelect: (key: K | null) => void;
  /** Tapping the selected chip again clears the selection. */
  clearable?: boolean;
}

const useStyles = makeStyles((theme) => ({
  row: { gap: theme.spacing.sm, paddingVertical: theme.spacing.xs },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    minHeight: 36,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  on: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
}));

/** A horizontal row of selectable chips (aisles, meal types). */
export function Chips<K extends string>({ items, selected, onSelect, clearable = true }: ChipsProps<K>) {
  const styles = useStyles();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps="handled">
      {items.map((item) => {
        const on = item.key === selected;
        return (
          <Pressable
            key={item.key}
            onPress={() => onSelect(on && clearable ? null : item.key)}
            style={[styles.chip, on && styles.on]}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={item.label}>
            {item.emoji ? <RText variant="footnote">{item.emoji}</RText> : null}
            <RText
              variant="footnote"
              weight={on ? "bold" : "medium"}
              color={on ? "onPrimary" : "textPrimary"}>
              {item.label}
            </RText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
