import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ar from "@/utils/localization/locales/ar.json";
import en from "@/utils/localization/locales/en.json";

export const SUPPORTED_LANGUAGES = ["ar", "en"] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const resources = {
  ar: { translation: ar },
  en: { translation: en },
} as const;

/**
 * First-run SUGGESTION only (Rakaya i18n-rtl §6): the persisted choice in LanguageContext
 * is the source of truth; the device locale never silently overrides it.
 */
export function deviceLanguage(): AppLanguage {
  const code = getLocales()[0]?.languageCode;
  return code === "en" ? "en" : "ar";
}

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: deviceLanguage(),
    fallbackLng: "ar",
    supportedLngs: [...SUPPORTED_LANGUAGES],
    interpolation: { escapeValue: false },
    returnNull: false,
  });
}

export default i18n;
