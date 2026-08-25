import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Text,
} from 'react-native';
import { colors } from '@/styles/global';

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
      {/* Hidden real input capturing user keystrokes & paste */}
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

      {/* Visible segmented digit boxes */}
      <View style={styles.boxesContainer}>
        {digits.map((digit, index) => {
          const isCurrent = isFocused && index === value.length;
          const isFilled = digit !== '';

          return (
            <View
              key={index}
              style={[
                styles.box,
                isCurrent && styles.boxFocused,
                isFilled && styles.boxFilled,
                disabled && styles.boxDisabled,
              ]}
            >
              <Text style={styles.digitText}>{digit}</Text>
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
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 320,
    gap: 8,
  },
  box: {
    flex: 1,
    height: 54,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxFocused: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(79, 195, 247, 0.1)',
  },
  boxFilled: {
    borderColor: 'rgba(79, 195, 247, 0.5)',
  },
  boxDisabled: {
    opacity: 0.5,
  },
  digitText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
});
