import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RText } from "@/components/RText";
import { useTheme } from "@/contexts/ThemeContext";
import { makeStyles } from "@/hooks/useStyles";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

const useStyles = makeStyles((theme) => ({
  container: {
    position: "absolute",
    insetInlineStart: theme.spacing.lg,
    insetInlineEnd: theme.spacing.lg,
    zIndex: 1000,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.signPanel,
    ...theme.shadows.md,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: theme.radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { flex: 1 },
}));

const ICON: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
  success: "checkmark",
  error: "alert",
  info: "information",
};

/** Signage-style toast: a dark sign panel sliding in from the top; tap to dismiss. */
export function Toast({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = useStyles();
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);

  const dismiss = () => {
    translateY.value = withTiming(-120, { duration: theme.duration.base }, () =>
      runOnJS(onDismiss)(toast.id),
    );
    opacity.value = withTiming(0, { duration: theme.duration.fast });
  };

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 18, stiffness: 180 });
    opacity.value = withTiming(1, { duration: theme.duration.base });
    const timer = setTimeout(dismiss, toast.type === "error" ? 5000 : 3200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per toast id
  }, [toast.id]);

  const animated = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const iconBg =
    toast.type === "error"
      ? theme.colors.danger
      : toast.type === "success"
        ? theme.colors.primary
        : theme.colors.signPanelMuted;

  return (
    <Animated.View
      style={[styles.container, { top: insets.top + theme.spacing.sm }, animated]}
      accessibilityLiveRegion="polite">
      <TouchableOpacity activeOpacity={0.9} onPress={dismiss} style={styles.inner} accessibilityRole="button">
        <View style={[styles.icon, { backgroundColor: iconBg }]}>
          <Ionicons name={ICON[toast.type]} size={16} color={theme.colors.onSignPanel} />
        </View>
        <RText variant="footnote" color="onSignPanel" style={styles.text} numberOfLines={3}>
          {toast.message}
        </RText>
      </TouchableOpacity>
    </Animated.View>
  );
}
