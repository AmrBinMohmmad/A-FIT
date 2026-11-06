import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  TextInput,
  TouchableOpacity,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";

import { RText } from "@/components/RText";
import { MIN_TOUCH_TARGET } from "@/constants/tokens";
import { useTheme } from "@/contexts/ThemeContext";
import { useRTL } from "@/hooks/useRTL";
import { makeStyles } from "@/hooks/useStyles";
import { toWesternDigits } from "@/utils/number";

/**
 * The input primitive — fully controlled, RTL-safe, with label / error / helper, start/end
 * adornments and Arabic→Western digit normalisation. The ONLY place input styling lives.
 */
export interface RTextInputProps extends Omit<TextInputProps, "style" | "value" | "onChangeText"> {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  error?: string;
  helper?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  englishNumbers?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  /** Large, centered figure entry (weights, steps). */
  figure?: boolean;
}

const useStyles = makeStyles((theme) => ({
  label: { marginBottom: theme.spacing.xs },
  field: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.inputBackground,
    paddingHorizontal: theme.spacing.md,
    columnGap: theme.spacing.sm,
    minHeight: MIN_TOUCH_TARGET + 4,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    fontFamily: theme.fontFamily.regular,
    fontSize: theme.fontSize.callout,
    color: theme.colors.textPrimary,
    textAlign: "left",
    writingDirection: "ltr",
  },
  inputRtl: { textAlign: "right", writingDirection: "rtl" },
  figure: {
    fontFamily: theme.fontFamily.bold,
    fontSize: theme.fontSize.largeTitle,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
    paddingVertical: theme.spacing.sm,
  },
  message: { marginTop: theme.spacing.xs },
}));

export function RTextInput({
  value,
  onChangeText,
  label,
  error,
  helper,
  startAdornment,
  endAdornment,
  englishNumbers,
  editable = true,
  containerStyle,
  figure,
  keyboardType,
  ...rest
}: RTextInputProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useRTL();
  const styles = useStyles();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? theme.colors.danger
    : focused
      ? theme.colors.inputFocusBorder
      : theme.colors.inputBorder;
  const numeric =
    keyboardType === "numeric" || keyboardType === "number-pad" || keyboardType === "decimal-pad";
  const isRtlText = isRTL && keyboardType !== "email-address";

  const handleChange = (text: string) =>
    onChangeText(englishNumbers || numeric ? toWesternDigits(text) : text);
  const showClear = value.length > 0 && editable && !endAdornment && !figure;

  return (
    <View style={containerStyle}>
      {label ? (
        <RText variant="footnote" color="textSecondary" style={styles.label}>
          {label}
        </RText>
      ) : null}

      <View style={[styles.field, { borderColor }]}>
        {startAdornment}
        <TextInput
          style={[styles.input, isRtlText && styles.inputRtl, figure && styles.figure]}
          value={value}
          onChangeText={handleChange}
          placeholderTextColor={theme.colors.placeholder}
          keyboardAppearance={theme.isDark ? "dark" : "light"}
          keyboardType={keyboardType}
          editable={editable}
          accessibilityLabel={label}
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
        />
        {showClear ? (
          <TouchableOpacity
            onPress={() => onChangeText("")}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("common.clear")}>
            <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        ) : (
          endAdornment
        )}
      </View>

      {error ? (
        <RText variant="caption" color="danger" style={styles.message}>
          {error}
        </RText>
      ) : helper ? (
        <RText variant="caption" color="textMuted" style={styles.message}>
          {helper}
        </RText>
      ) : null}
    </View>
  );
}
