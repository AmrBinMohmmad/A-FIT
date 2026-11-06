import { I18nManager } from "react-native";

import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Direction-aware helpers. `isRTL` is the direction the native layout engine is ACTUALLY
 * using (I18nManager), not the language: until a direction change has been applied by a
 * reload the two can differ, and positioning must follow the layout, never the language.
 * Prefer logical style props; use `isRTL` only where content must mirror explicitly.
 */
export function useRTL() {
  const { language } = useLanguage();
  const isRTL = I18nManager.isRTL;
  return {
    isRTL,
    /** True while the chosen language and the applied layout direction disagree (pending reload). */
    directionPending: (language === "ar") !== isRTL,
    direction: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
    sign: isRTL ? -1 : 1,
  } as const;
}
