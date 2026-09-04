import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Text,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { FONTS } from '@/styles/global';

export interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface CustomAlertProps {
  visible: boolean;
  title?: string;
  message?: string;
  buttons?: AlertButton[];
  onClose?: () => void;
}

export default function CustomAlert({
  visible,
  title,
  message,
  buttons = [],
  onClose,
}: CustomAlertProps) {
  const { colors, isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={[
          styles.overlay,
          {
            backgroundColor: isDark
              ? 'rgba(0, 0, 0, 0.72)'
              : 'rgba(15, 23, 42, 0.45)',
          },
        ]}
        onPress={onClose}
      >
        <Pressable
          style={[
            styles.container,
            {
              backgroundColor: colors.surface,
              borderColor: isDark ? colors.border : '#E2E8F0',
              shadowColor: isDark ? '#000000' : '#0F172A',
              shadowOpacity: isDark ? 0.45 : 0.12,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {title ? (
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          ) : null}

          {message ? (
            <Text style={[styles.message, { color: colors.textSecondary }]}>
              {message}
            </Text>
          ) : null}

          <View
            style={[
              styles.buttonsRow,
              buttons.length === 1 && styles.buttonsRowSingle,
            ]}
          >
            {buttons.map((btn, index) => {
              const btnStyle = btn.style || 'default';

              let bgStyle = { backgroundColor: colors.primary, borderWidth: 0, borderColor: 'transparent' };
              let textColor = isDark ? '#0D1117' : '#FFFFFF';

              if (btnStyle === 'destructive') {
                bgStyle = {
                  backgroundColor: isDark
                    ? 'rgba(239, 68, 68, 0.15)'
                    : 'rgba(220, 38, 38, 0.1)',
                  borderWidth: 1,
                  borderColor: isDark
                    ? 'rgba(239, 68, 68, 0.35)'
                    : 'rgba(220, 38, 38, 0.25)',
                };
                textColor = colors.danger;
              } else if (btnStyle === 'cancel') {
                bgStyle = {
                  backgroundColor: colors.surfaceElevated,
                  borderWidth: 1,
                  borderColor: isDark ? colors.border : '#E2E8F0',
                };
                textColor = colors.textSecondary;
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.buttonBase,
                    bgStyle,
                    buttons.length === 1 && styles.buttonFull,
                  ]}
                  onPress={() => {
                    onClose?.();
                    btn.onPress?.();
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      {
                        color: textColor,
                        fontWeight: btnStyle !== 'cancel' ? '800' : '600',
                        fontFamily: btnStyle !== 'cancel' ? FONTS.bold : FONTS.regular,
                      },
                    ]}
                  >
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  container: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 22,
    paddingTop: 26,
    paddingHorizontal: 22,
    paddingBottom: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    textAlign: 'center',
    marginBottom: 8,
    writingDirection: 'rtl',
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 22,
    fontFamily: FONTS.regular,
    writingDirection: 'rtl',
    paddingHorizontal: 6,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  buttonsRowSingle: {
    flexDirection: 'column',
  },
  buttonBase: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonFull: {
    flex: 0,
    width: '100%',
  },
  buttonText: {
    fontSize: 15,
    textAlign: 'center',
  },
});

