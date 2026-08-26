import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { OtpInput } from '@/components/auth/OtpInput';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function VerifyEmailScreen() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { user, submitEmailVerification, resendEmailVerification, logout } = useAuth();
  const { colors, isDark } = useTheme();
  const toast = useToast();

  const handleVerify = async () => {
    if (code.length !== 6) {
      setErrorMessage('يرجى إدخال رمز التفعيل المكوّن من 6 أرقام');
      toast.warning('يرجى إدخال رمز التفعيل المكوّن من 6 أرقام');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    try {
      await submitEmailVerification(code);
      toast.success('تم تأكيد البريد الإلكتروني بنجاح! أهلاً بك في أي-فت 🎉');
    } catch (err: any) {
      const msg = err?.message || 'رمز التحقق غير صحيح أو منتهي الصلاحية';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (isResending) return;

    setIsResending(true);
    setErrorMessage(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    try {
      await resendEmailVerification();
      toast.success('تم إرسال رمز تفعيل جديد إلى بريدك الإلكتروني');
      setCode('');
    } catch (err: any) {
      const msg = err?.message || 'تعذر إعادة إرسال الرمز. يرجى المحاولة لاحقاً.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <AuthHeader
              title="تأكيد البريد الإلكتروني ✉️"
              subtitle={`أرسلنا رمز التفعيل المكوّن من 6 أرقام إلى\n${user?.email || 'بريدك الإلكتروني'}`}
            />

            <View
              style={[
                styles.card,
                {
                  backgroundColor: isDark ? colors.surface : colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <OtpInput
                value={code}
                onChange={(val) => {
                  setCode(val);
                  if (errorMessage) setErrorMessage(null);
                }}
                disabled={isLoading}
              />

              {errorMessage ? (
                <View
                  style={[
                    styles.errorContainer,
                    {
                      backgroundColor: isDark ? 'rgba(248, 81, 73, 0.12)' : 'rgba(220, 38, 38, 0.08)',
                      borderColor: isDark ? 'rgba(248, 81, 73, 0.25)' : 'rgba(220, 38, 38, 0.2)',
                    },
                  ]}
                >
                  <Ionicons name="alert-circle" size={16} color={colors.danger} />
                  <Text style={[styles.errorText, { color: colors.danger }]}>
                    {errorMessage}
                  </Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: colors.primary },
                  (isLoading || code.length !== 6) && styles.buttonDisabled,
                ]}
                onPress={handleVerify}
                disabled={isLoading || code.length !== 6}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#0D1117" />
                ) : (
                  <Text style={styles.buttonText}>تأكيد البريد والبدء</Text>
                )}
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                <TouchableOpacity
                  onPress={handleResend}
                  disabled={isResending}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.resendLink, { color: colors.primary }]}>
                    {isResending ? 'جاري الإرسال...' : 'إعادة إرسال رمز التفعيل'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={logout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.logoutText, { color: colors.textSecondary }]}>
                إلغاء وتسجيل الخروج
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  card: {
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  button: {
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#0D1117',
    fontSize: 16,
    fontWeight: '900',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '800',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 28,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
