import { colors } from "@/styles/global";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

export default function tabLayout(){
    return (
        <Tabs
        screenOptions={{
            headerShown: false,
            tabBarStyle: {
                backgroundColor: colors.header,
                borderTopColor: colors.surface,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textSecondary,
            }
        }
        >
            <Tabs.Screen
            name="index"
            options={{
                title: 'أي-فيت',
                tabBarIcon:({color,size}) => (
                    <Ionicons name="home" size={size} color={color} />
                )
            }}
            />
         <Tabs.Screen
        name='add-meal'
        options={{
          title: 'أضف وجبة',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='add-circle-outline' size={size} color={color} />
          ),
        }}
      />
          <Tabs.Screen
        name='meals'
        options={{
          title: 'جميع الوجبات',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='list' size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
