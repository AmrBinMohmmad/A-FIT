import type { AppLanguage } from "@/utils/localization/i18n";

/**
 * The one sanctioned reader of bilingual `*_ar` columns (D3.2): returns the Arabic value for
 * Arabic, otherwise (or when Arabic is empty) the base value. Components never touch `_ar`
 * fields directly — the lint rule enforces it — so the fallback is applied everywhere.
 */
export function localizedField(record: object, base: string, language: AppLanguage): string {
  const values = record as Record<string, unknown>;
  const arabic = language === "ar" ? values[`${base}_ar`] : null;
  const value = typeof arabic === "string" && arabic !== "" ? arabic : values[base];
  return typeof value === "string" ? value : "";
}
