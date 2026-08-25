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
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/styles/global';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { OtpInput } from '@/components/auth/OtpInput';

export default function VerifyEmailScreen() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { user, submitEmailVerification, resendEmailVerification, logout } =
    useAuth();

  const handleVerify = async () => {
    if (code.length !== 6) {
      setErrorMessage('Please enter the full 6-digit code');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await submitEmailVerification(code);
      // Navigation is automatically handled by AuthContext state change in root _layout
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (isResending) return;

    setIsResending(true);
    setErrorMessage(null);
    setResendSuccess(false);

    try {
      await resendEmailVerification();
      setResendSuccess(true);
      setCode('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeader
          title="Verify Your Email"
          subtitle={`We sent a 6-digit activation code to\n${user?.email || 'your email'}`}
        />

        <View style={styles.card}>
          <OtpInput
            value={code}
            onChange={(val) => {
              setCode(val);
              if (errorMessage) setErrorMessage(null);
              if (resendSuccess) setResendSuccess(false);
            }}
            disabled={isLoading}
          />

          {resendSuccess ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>
                A new verification code has been sent to your email.
              </Text>
            </View>
          ) : null}

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[
              styles.button,
              (isLoading || code.length !== 6) && styles.buttonDisabled,
            ]}
            onPress={handleVerify}
            disabled={isLoading || code.length !== 6}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#1a1a2e" />
            ) : (
              <Text style={styles.buttonText}>Verify Email & Start</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <TouchableOpacity
              onPress={handleResend}
              disabled={isResending}
              activeOpacity={0.7}
            >
              <Text style={styles.resendLink}>
                {isResending ? 'Sending...' : 'Resend Verification Code'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>Cancel & Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  successContainer: {
    backgroundColor: 'rgba(79, 195, 247, 0.15)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 195, 247, 0.3)',
  },
  successText: {
    color: colors.primary,
    fontSize: 13,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 82, 82, 0.15)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.3)',
  },
  errorText: {
    color: colors.alert,
    fontSize: 13,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  resendLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoutButton: {
    alignSelf: 'center',
    marginTop: 28,
  },
  logoutText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
