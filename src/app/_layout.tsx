import "@/utils/localization/i18n";
import "@/utils/steps/backgroundTask";

import {
  IBMPlexSansArabic_400Regular,
  IBMPlexSansArabic_500Medium,
  IBMPlexSansArabic_700Bold,
  useFonts,
} from "@expo-google-fonts/ibm-plex-sans-arabic";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AlertProvider } from "@/contexts/AlertContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { MealDraftProvider } from "@/contexts/MealDraftContext";
import { QueryProvider } from "@/contexts/QueryProvider";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/contexts/ToastContext";

void SplashScreen.preventAutoHideAsync();

/**
 * Provider order: Gesture → SafeArea → Theme → Language → Query →
 * Auth → Toast/Alert. Auth sits inside Query because it clears the cache on sign-out. The
 * splash stays until fonts, theme, language/direction and the session have resolved.
 */
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    IBMPlexSansArabic_400Regular,
    IBMPlexSansArabic_500Medium,
    IBMPlexSansArabic_700Bold,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <LanguageProvider>
            <QueryProvider>
              <MealDraftProvider>
                <ToastProvider>
                  <AuthProvider>
                    <AlertProvider>
                      <Root fontsLoaded={fontsLoaded} />
                    </AlertProvider>
                  </AuthProvider>
                </ToastProvider>
              </MealDraftProvider>
            </QueryProvider>
          </LanguageProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function Root({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { theme, isDark, ready: themeReady } = useTheme();
  const { ready: languageReady } = useLanguage();
  const { status } = useAuth();

  const ready = fontsLoaded && themeReady && languageReady && status !== "booting";

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: "fade",
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="meals/new" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
        <Stack.Screen name="meals/[id]" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
        <Stack.Screen name="foods/new" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
        <Stack.Screen name="foods/scan" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
        <Stack.Screen name="groups/new" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
        <Stack.Screen
          name="groups/join"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen name="groups/[id]" options={{ animation: "slide_from_right" }} />
        <Stack.Screen
          name="groups/[id]/challenges/new"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="groups/[id]/rename"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen name="challenges/[id]" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="steps" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="weight" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="water" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="settings" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="avatar" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
      </Stack>
    </>
  );
}
