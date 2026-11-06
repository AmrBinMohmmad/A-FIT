import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable, View } from "react-native";

import { RText } from "@/components/RText";
import { RTextInput } from "@/components/RTextInput";
import { MIN_TOUCH_TARGET } from "@/constants/tokens";
import { useTheme } from "@/contexts/ThemeContext";
import { makeStyles } from "@/hooks/useStyles";
import { parseIntSafe } from "@/utils/number";

interface StepperProps {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

const useStyles = makeStyles((theme) => ({
  wrap: { gap: theme.spacing.sm },
  row: { flexDirection: "row", alignItems: "center", gap: theme.spacing.md },
  btn: {
    width: MIN_TOUCH_TARGET + 4,
    height: MIN_TOUCH_TARGET + 4,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  field: { flex: 1 },
}));

/** A bounded numeric stepper: minus / figure field / plus, Arabic digits normalised. */
export function Stepper({ label, unit, value, min, max, step = 1, onChange }: StepperProps) {
  const styles = useStyles();
  const { theme } = useTheme();
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const bump = (delta: number) => {
    void Haptics.selectionAsync().catch(() => undefined);
    onChange(clamp(value + delta));
  };

  return (
    <View style={styles.wrap}>
      <RText variant="footnote" color="textSecondary">
        {label}
      </RText>
      <View style={styles.row}>
        <Pressable
          onPress={() => bump(-step)}
          style={styles.btn}
          accessibilityRole="button"
          accessibilityLabel={`− ${label}`}>
          <Ionicons name="remove" size={22} color={theme.colors.textPrimary} />
        </Pressable>
        <RTextInput
          figure
          value={String(value)}
          onChangeText={(text) => {
            const n = parseIntSafe(text);
            if (n !== null) onChange(clamp(n));
          }}
          keyboardType="number-pad"
          maxLength={5}
          containerStyle={styles.field}
          accessibilityLabel={label}
          endAdornment={
            <RText variant="footnote" color="textMuted">
              {unit}
            </RText>
          }
        />
        <Pressable
          onPress={() => bump(step)}
          style={styles.btn}
          accessibilityRole="button"
          accessibilityLabel={`+ ${label}`}>
          <Ionicons name="add" size={22} color={theme.colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}
