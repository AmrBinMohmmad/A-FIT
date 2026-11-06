import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import { STORAGE_KEYS } from "@/constants/storage";
import { themeFor, type Theme, type ThemeMode } from "@/constants/theme";
import { duration } from "@/constants/tokens";
import { getItem, setItem } from "@/utils/storage";

/** Where the user tapped, so the new appearance can sweep out from there. */
export interface ThemeOrigin {
  x: number;
  y: number;
}

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  theme: Theme;
  setMode: (mode: ThemeMode, origin?: ThemeOrigin) => void;
  ready: boolean;
}

interface Ripple extends ThemeOrigin {
  color: string;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Tri-state appearance (system | light | dark), persisted; memoised so the tree only re-renders
 * on real changes. Switching with a tap origin plays a wave: a disc in the new background
 * colour grows from the tap until it covers the screen, the theme flips underneath, and the
 * disc fades to reveal it. Reduce Motion (or no origin) switches instantly.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const reduceMotion = useReducedMotion();
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [ready, setReady] = useState(false);
  const [ripple, setRipple] = useState<Ripple | null>(null);
  const progress = useSharedValue(0);
  const fade = useSharedValue(1);

  useEffect(() => {
    let active = true;
    void getItem<ThemeMode>(STORAGE_KEYS.themeMode).then((stored) => {
      if (!active) return;
      if (stored === "light" || stored === "dark" || stored === "system") setModeState(stored);
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const isDark = mode === "system" ? systemScheme === "dark" : mode === "dark";

  const commit = useCallback(
    (next: ThemeMode) => {
      setModeState(next);
      fade.set(
        withDelay(
          duration.fast / 2,
          withTiming(0, { duration: duration.slow }, (finished) => {
            if (finished) runOnJS(setRipple)(null);
          }),
        ),
      );
    },
    [fade],
  );

  const setMode = useCallback(
    (next: ThemeMode, origin?: ThemeOrigin) => {
      void setItem(STORAGE_KEYS.themeMode, next);
      const nextIsDark = next === "system" ? systemScheme === "dark" : next === "dark";
      if (!origin || reduceMotion || nextIsDark === isDark || ripple !== null) {
        setModeState(next);
        return;
      }
      setRipple({ ...origin, color: themeFor(nextIsDark).colors.background });
      progress.set(0);
      fade.set(1);
      progress.set(
        withTiming(1, { duration: duration.travel * 0.6, easing: Easing.inOut(Easing.cubic) }, (finished) => {
          if (finished) runOnJS(commit)(next);
        }),
      );
    },
    [commit, fade, isDark, progress, reduceMotion, ripple, systemScheme],
  );

  const theme = useMemo(() => themeFor(isDark), [isDark]);
  const value = useMemo<ThemeContextValue>(
    () => ({ mode, isDark, theme, setMode, ready }),
    [mode, isDark, theme, setMode, ready],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
      {ripple ? <ThemeRipple ripple={ripple} progress={progress} fade={fade} /> : null}
    </ThemeContext.Provider>
  );
}

function ThemeRipple({
  ripple,
  progress,
  fade,
}: {
  ripple: Ripple;
  progress: ReturnType<typeof useSharedValue<number>>;
  fade: ReturnType<typeof useSharedValue<number>>;
}) {
  const { width, height } = useWindowDimensions();
  // Radius to the farthest corner, so the disc covers the whole screen at scale 1.
  const radius = Math.hypot(Math.max(ripple.x, width - ripple.x), Math.max(ripple.y, height - ripple.y));
  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: progress.value }],
    opacity: fade.value,
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: ripple.x - radius,
          top: ripple.y - radius,
          width: radius * 2,
          height: radius * 2,
          borderRadius: radius,
          backgroundColor: ripple.color,
          zIndex: 1000,
          elevation: 1000,
        },
        animated,
      ]}
    />
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
