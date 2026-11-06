import * as Updates from "expo-updates";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DevSettings, I18nManager } from "react-native";

import { STORAGE_KEYS } from "@/constants/storage";
import i18n, { type AppLanguage } from "@/utils/localization/i18n";
import { logger } from "@/utils/logger";
import { getItem, setItem } from "@/utils/storage";

interface LanguageContextValue {
  language: AppLanguage;
  isRTL: boolean;
  setLanguage: (lang: AppLanguage) => Promise<void>;
  ready: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/** RN applies forceRTL only after a reload; returns true when the direction actually changed. */
function applyDirection(lang: AppLanguage): boolean {
  const shouldRTL = lang === "ar";
  if (I18nManager.isRTL === shouldRTL) return false;
  I18nManager.allowRTL(shouldRTL);
  I18nManager.forceRTL(shouldRTL);
  return true;
}

async function reloadApp(): Promise<void> {
  try {
    await Updates.reloadAsync();
    return;
  } catch (error) {
    logger.debug("expo-updates reload unavailable, falling back", error);
  }
  if (__DEV__) {
    DevSettings.reload();
    return;
  }
  logger.warn("Could not auto-reload to apply the layout direction; restart the app.");
}

/**
 * Owns the language choice and the layout direction. The device locale is only a first-run
 * suggestion (see i18n.ts); the persisted choice wins (i18n-rtl §6).
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLang] = useState<AppLanguage>(i18n.language as AppLanguage);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const stored = await getItem<AppLanguage>(STORAGE_KEYS.language);
      const lang = stored ?? (i18n.language as AppLanguage);
      if (!active) return;
      if (lang !== i18n.language) await i18n.changeLanguage(lang);
      setLang(lang);
      if (applyDirection(lang)) {
        await reloadApp();
        return;
      }
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  const setLanguage = useCallback(async (lang: AppLanguage) => {
    await i18n.changeLanguage(lang);
    await setItem(STORAGE_KEYS.language, lang);
    setLang(lang);
    if (applyDirection(lang)) await reloadApp();
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({ language, isRTL: language === "ar", setLanguage, ready }),
    [language, setLanguage, ready],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
