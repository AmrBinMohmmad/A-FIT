import { useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { RText } from "@/components/RText";
import { useTheme } from "@/contexts/ThemeContext";
import { makeStyles } from "@/hooks/useStyles";
import { toWesternDigits } from "@/utils/number";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  disabled?: boolean;
  error?: string;
}

const useStyles = makeStyles((theme) => ({
  wrap: { gap: theme.spacing.sm },
  boxes: { flexDirection: "row", gap: theme.spacing.sm, direction: "ltr" },
  box: {
    flex: 1,
    height: 56,
    borderRadius: theme.radii.md,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.inputBackground,
  },
  hidden: { position: "absolute", opacity: 0, width: 1, height: 1 },
}));

/**
 * Six-cell code entry over one hidden TextInput (one-time-code autofill works). Cells are
 * always LTR because the code is a Western-digit string. This file is one of the two
 * sanctioned RN TextInput importers besides RTextInput (the hidden field is not a styled input).
 */
export function OtpInput({ length = 6, value, onChange, disabled, error }: OtpInputProps) {
  const ref = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const { theme } = useTheme();
  const styles = useStyles();

  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => !disabled && ref.current?.focus()}
        accessibilityRole="button"
        accessibilityLabel={value}>
        <TextInput
          ref={ref}
          value={value}
          onChangeText={(text) => onChange(toWesternDigits(text).replace(/\D/g, "").slice(0, length))}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          maxLength={length}
          editable={!disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={styles.hidden}
          autoFocus
          accessibilityLabel="code"
        />
        <View style={styles.boxes}>
          {digits.map((d, i) => {
            const current = focused && i === value.length;
            return (
              <View
                key={i}
                style={[
                  styles.box,
                  {
                    borderColor: error
                      ? theme.colors.danger
                      : current
                        ? theme.colors.inputFocusBorder
                        : d
                          ? theme.colors.primary
                          : theme.colors.inputBorder,
                  },
                  disabled && { opacity: 0.5 },
                ]}>
                <RText variant="title" tabular>
                  {d}
                </RText>
              </View>
            );
          })}
        </View>
      </Pressable>
      {error ? (
        <RText variant="caption" color="danger">
          {error}
        </RText>
      ) : null}
    </View>
  );
}
