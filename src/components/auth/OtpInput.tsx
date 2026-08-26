import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Text,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  disabled?: boolean;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  disabled = false,
}: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const { colors, isDark } = useTheme();

  const handlePress = () => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  };

  const digits = value.split('').slice(0, length);
  while (digits.length < length) {
    digits.push('');
  }

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => {
          const numericText = text.replace(/[^0-9]/g, '').slice(0, length);
          onChange(numericText);
        }}
        keyboardType="number-pad"
        maxLength={length}
        editable={!disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={styles.hiddenInput}
        autoFocus
      />

      <View style={styles.boxesContainer}>
        {digits.map((digit, index) => {
          const isCurrent = isFocused && index === value.length;
          const isFilled = digit !== '';

          return (
            <View
              key={index}
              style={[
                styles.box,
                {
                  backgroundColor: isDark ? colors.surfaceElevated : colors.surfaceElevated,
                  borderColor: isCurrent
                    ? colors.primary
                    : isFilled
                    ? colors.borderActive
                    : colors.border,
                },
                isCurrent && {
                  backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(5, 150, 105, 0.08)',
                },
                disabled && styles.boxDisabled,
              ]}
            >
              <Text style={[styles.digitText, { color: colors.text }]}>{digit}</Text>
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    alignItems: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  boxesContainer: {
    flexDirection: 'row',
    direction: 'ltr',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 320,
    gap: 8,
  },
  box: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxDisabled: {
    opacity: 0.5,
  },
  digitText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});
