import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

import { STORAGE_KEYS } from "@/constants/storage";
import { themeFor, type Theme, type ThemeMode } from "@/constants/theme";
import { getItem, setItem } from "@/utils/storage";

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  theme: Theme;
  setMode: (mode: ThemeMode) => void;
  ready: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Tri-state appearance (system | light | dark), persisted; memoised so the tree only re-renders on real changes. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [ready, setReady] = useState(false);

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

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    void setItem(STORAGE_KEYS.themeMode, next);
  }, []);

  const isDark = mode === "system" ? systemScheme === "dark" : mode === "dark";
  const theme = useMemo(() => themeFor(isDark), [isDark]);
  const value = useMemo<ThemeContextValue>(
    () => ({ mode, isDark, theme, setMode, ready }),
    [mode, isDark, theme, setMode, ready],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
