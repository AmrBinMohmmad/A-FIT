import React, { useState, useEffect } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { OtpInput } from '@/components/auth/OtpInput';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function VerifyLoginScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(90);

  const { submitLoginOtp, requestLoginOtp } = useAuth();
  const { colors, isDark } = useTheme();
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async () => {
    if (code.length !== 6) {
      setErrorMessage('يرجى إدخال الرمز المكون من 6 أرقام كاملاً');
      toast.warning('يرجى إدخال الرمز المكون من 6 أرقام كاملاً');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    try {
      await submitLoginOtp(email || '', code);
      toast.success('تم تسجيل الدخول بنجاح 👋');
    } catch (err: any) {
      const msg = err?.message || 'رمز الدخول غير صحيح، حاول مرة أخرى';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;

    setIsResending(true);
    setErrorMessage(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    try {
      await requestLoginOtp(email || '');
      setCountdown(90);
      setCode('');
      toast.success('تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني');
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
              title="أدخل رمز الدخول 🔐"
              subtitle={`أرسلنا رمز تحقق مكوّن من 6 أرقام إلى\n${email || 'بريدك الإلكتروني'}`}
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
                  <Text style={styles.buttonText}>التحقق وتسجيل الدخول</Text>
                )}
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                {countdown > 0 ? (
                  <Text style={[styles.countdownText, { color: colors.textSecondary }]}>
                    إعادة الإرسال متاحة بعد {countdown} ثانية
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={handleResend}
                    disabled={isResending}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.resendLink, { color: colors.primary }]}>
                      {isResending ? 'جاري الإرسال...' : 'إعادة إرسال الرمز'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-forward" size={16} color={colors.textSecondary} />
              <Text style={[styles.backButtonText, { color: colors.textSecondary }]}>
                الرجوع واستخدام بريد إلكتروني آخر
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
  countdownText: {
    fontSize: 13,
    fontWeight: '500',
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '800',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 28,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
