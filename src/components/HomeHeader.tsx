import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useAlert } from '@/context/AlertContext';
import { FONTS } from '@/styles/global';

export default function HomeHeader() {
  const { user, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const { showAlert } = useAlert();

  const currentDate = new Date().toLocaleDateString('ar-SA', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  const handleLogoutPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    showAlert('تسجيل الخروج', 'هل أنت متأكد من رغبتك في تسجيل الخروج من حسابك؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'تسجيل الخروج',
        style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          logout();
        },
      },
    ]);
  };

  const handleThemeToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    toggleTheme();
  };

  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'ب';

  return (
    <View style={styles.container}>
      <View style={styles.userSection}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(5, 150, 105, 0.12)' },
          ]}
        >
          <Text style={[styles.avatarText, { color: colors.primary }]}>{userInitial}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>مرحباً يا بطل 👋</Text>
          <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
            {user?.name || 'مستخدم أي-فت'}
          </Text>
          <Text style={[styles.date, { color: colors.textMuted }]}>{currentDate}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.iconButton,
            {
              backgroundColor: isDark ? colors.surfaceElevated : colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={handleThemeToggle}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={20}
            color={isDark ? '#FBBF24' : colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.iconButton,
            {
              backgroundColor: isDark ? colors.surfaceElevated : colors.surface,
              borderColor: isDark ? 'rgba(248, 81, 73, 0.2)' : 'rgba(220, 38, 38, 0.2)',
            },
          ]}
          onPress={handleLogoutPress}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 6,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: FONTS.regular,
    marginBottom: 2,
    writingDirection: 'rtl',
  },
  userName: {
    fontSize: 19,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    marginBottom: 2,
    writingDirection: 'rtl',
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: FONTS.regular,
    writingDirection: 'rtl',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});