import { useMemo } from "react";
import { StyleSheet } from "react-native";

import type { Theme } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * The one styling pattern: a factory of the theme, memoised per active theme.
 * `const useStyles = makeStyles((theme) => ({ ... }))` then `const styles = useStyles()`.
 */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(factory: (theme: Theme) => T): () => T {
  return function useStyles(): T {
    const { theme } = useTheme();
    return useMemo(() => StyleSheet.create(factory(theme)), [theme]);
  };
}
