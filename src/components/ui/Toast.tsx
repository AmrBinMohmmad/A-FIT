import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const { width } = Dimensions.get('window');

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Trigger subtle haptic feedback
    if (toast.type === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    } else if (toast.type === 'warning') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    } else if (toast.type === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }

    // Slide in
    translateY.value = withSpring(0, {
      damping: 15,
      stiffness: 140,
    });
    opacity.value = withTiming(1, { duration: 250 });

    // Auto dismiss timer
    const duration = toast.duration || 3500;
    const timer = setTimeout(() => {
      dismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    translateY.value = withTiming(-120, { duration: 250 }, () => {
      runOnJS(onDismiss)(toast.id);
    });
    opacity.value = withTiming(0, { duration: 200 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  const getToastConfig = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          color: colors.success,
          bgColor: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(22, 163, 74, 0.1)',
          borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(22, 163, 74, 0.25)',
          defaultTitle: 'تم بنجاح',
        };
      case 'error':
        return {
          icon: 'alert-circle' as const,
          color: colors.danger,
          bgColor: isDark ? 'rgba(248, 81, 73, 0.12)' : 'rgba(220, 38, 38, 0.1)',
          borderColor: isDark ? 'rgba(248, 81, 73, 0.3)' : 'rgba(220, 38, 38, 0.25)',
          defaultTitle: 'حدث خطأ',
        };
      case 'warning':
        return {
          icon: 'warning' as const,
          color: colors.warning,
          bgColor: isDark ? 'rgba(210, 153, 34, 0.12)' : 'rgba(217, 119, 6, 0.1)',
          borderColor: isDark ? 'rgba(210, 153, 34, 0.3)' : 'rgba(217, 119, 6, 0.25)',
          defaultTitle: 'تنبيه',
        };
      case 'info':
      default:
        return {
          icon: 'information-circle' as const,
          color: colors.info,
          bgColor: isDark ? 'rgba(88, 166, 255, 0.12)' : 'rgba(37, 99, 235, 0.1)',
          borderColor: isDark ? 'rgba(88, 166, 255, 0.3)' : 'rgba(37, 99, 235, 0.25)',
          defaultTitle: 'معلومات',
        };
    }
  };

  const config = getToastConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top > 0 ? insets.top + 8 : 16,
          backgroundColor: isDark ? colors.surfaceElevated : colors.surface,
          borderColor: config.borderColor,
        },
        animatedStyle,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={dismiss}
        style={styles.innerContent}
      >
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: config.bgColor },
          ]}
        >
          <Ionicons name={config.icon} size={22} color={config.color} />
        </View>

        <View style={styles.textWrapper}>
          {toast.title ? (
            <Text style={[styles.title, { color: colors.text }]}>
              {toast.title}
            </Text>
          ) : null}
          <Text
            style={[
              styles.message,
              { color: toast.title ? colors.textSecondary : colors.text },
            ]}
            numberOfLines={3}
          >
            {toast.message}
          </Text>
        </View>

        <TouchableOpacity
          onPress={dismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.closeBtn}
        >
          <Ionicons name="close" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  innerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'right',
    width: '100%',
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    textAlign: 'right',
    width: '100%',
  },
  closeBtn: {
    padding: 4,
    marginRight: 4,
  },
});
