import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import type { ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

/** The four sections (Home, Meals, Groups, Me). Guards: signed-out → e-mail screen. */
export default function TabsLayout() {
  const { status } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  if (status !== "signedIn") return <Redirect href="/(auth)/email" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 56 + Math.max(insets.bottom, 8),
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        tabBarLabelStyle: { fontFamily: theme.fontFamily.medium, fontSize: theme.fontSize.caption },
        sceneStyle: { backgroundColor: theme.colors.background },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon on="home" off="home-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="meals"
        options={{
          title: t("tabs.meals"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon on="restaurant" off="restaurant-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: t("tabs.groups"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon on="people" off="people-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: t("tabs.me"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon on="person" off="person-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen name="add-meal" options={{ href: null }} />
    </Tabs>
  );
}

type IconName = keyof typeof Ionicons.glyphMap;

function TabIcon({
  on,
  off,
  color,
  focused,
}: {
  on: IconName;
  off: IconName;
  color: ColorValue;
  focused: boolean;
}) {
  return <Ionicons name={focused ? on : off} size={22} color={color} />;
}
