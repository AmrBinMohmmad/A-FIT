import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, I18nManager } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  IBMPlexSansArabic_400Regular,
  IBMPlexSansArabic_700Bold,
} from '@expo-google-fonts/ibm-plex-sans-arabic';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { AlertProvider } from '@/context/AlertContext';

import { profileStorage } from '@/storage/profileStorage';

// Force RTL at startup for native components
if (!I18nManager.isRTL) {
  try {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
  } catch (e) {
    console.log('RTL initialization error', e);
  }
}

function RootNavigation() {
  const { isAuthenticated, isEmailVerified, isLoading } = useAuth();
  const { colors, isDark } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const currentRoute = segments[1];

    if (!isAuthenticated) {
      // User is not logged in: send them to login if not already in (auth)
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else if (!isEmailVerified) {
      // User is logged in but email is not verified yet
      if (currentRoute !== 'verify-email') {
        router.replace('/(auth)/verify-email');
      }
    } else {
      // User is fully authenticated & verified: check if onboarding profile is completed
      profileStorage.hasProfile().then((hasProfile) => {
        const onOnboarding = segments[0] === 'onboarding';
        if (!hasProfile) {
          if (!onOnboarding) {
            router.replace('/onboarding');
          }
        } else {
          if (inAuthGroup || onOnboarding) {
            router.replace('/(tabs)');
          }
        }
      });
    }
  }, [isAuthenticated, isEmailVerified, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    IBMPlexSansArabic_400Regular,
    IBMPlexSansArabic_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, direction: 'rtl' }}>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <AlertProvider>
              <RootNavigation />
            </AlertProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0D1117',
    justifyContent: 'center',
    alignItems: 'center',
  },
});