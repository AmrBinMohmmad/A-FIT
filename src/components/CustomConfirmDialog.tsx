import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { FONTS } from '@/styles/global';

interface CustomConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function CustomConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  icon = 'alert-circle',
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel,
}: CustomConfirmDialogProps) {
  const { colors, isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View
          style={[
            styles.overlay,
            {
              backgroundColor: isDark
                ? 'rgba(0, 0, 0, 0.72)'
                : 'rgba(15, 23, 42, 0.45)',
            },
          ]}
        >
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: isDark ? colors.border : '#E2E8F0',
                  shadowColor: isDark ? '#000000' : '#0F172A',
                  shadowOpacity: isDark ? 0.45 : 0.12,
                },
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: isDestructive
                      ? isDark
                        ? 'rgba(239, 68, 68, 0.15)'
                        : 'rgba(220, 38, 38, 0.1)'
                      : isDark
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'rgba(5, 150, 105, 0.1)',
                  },
                ]}
              >
                <Ionicons
                  name={icon}
                  size={32}
                  color={isDestructive ? colors.danger : colors.primary}
                />
              </View>

              <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
              <Text style={[styles.message, { color: colors.textSecondary }]}>
                {message}
              </Text>

              <TouchableOpacity
                style={[
                  styles.confirmBtn,
                  {
                    backgroundColor: isDestructive ? colors.danger : colors.primary,
                  },
                  isLoading && styles.btnDisabled,
                ]}
                onPress={onConfirm}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmBtnText}>{confirmText}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.cancelBtn,
                  {
                    backgroundColor: isDark ? 'transparent' : '#F1F5F9',
                    borderColor: isDark ? colors.border : '#E2E8F0',
                  },
                ]}
                onPress={onCancel}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: FONTS.regular,
    paddingHorizontal: 6,
  },
  confirmBtn: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    fontFamily: FONTS.bold,
  },
  cancelBtn: {
    width: '100%',
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FONTS.bold,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});

