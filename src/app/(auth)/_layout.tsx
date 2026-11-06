import { Redirect, Stack } from "expo-router";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

/** Sign-in group: a signed-in user never sees it. */
export default function AuthLayout() {
  const { status } = useAuth();
  const { theme } = useTheme();

  if (status === "signedIn") return <Redirect href="/(tabs)" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: "slide_from_right",
      }}>
      <Stack.Screen name="email" />
      <Stack.Screen name="code" />
      <Stack.Screen name="name" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="verify-login" />
    </Stack>
  );
}
