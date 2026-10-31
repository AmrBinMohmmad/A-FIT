/**
 * Numerals. The app stores and sends Western digits; Arabic-Indic input is normalised on
 * entry. Display uses Western digits in both languages so figures stay tabular.
 */
const ARABIC_INDIC = "٠١٢٣٤٥٦٧٨٩";
const EXTENDED_ARABIC_INDIC = "۰۱۲۳۴۵۶۷۸۹";

export function toWesternDigits(input: string): string {
  return input.replace(/[٠-٩۰-۹]/g, (char) => {
    const arabic = ARABIC_INDIC.indexOf(char);
    if (arabic !== -1) return String(arabic);
    const extended = EXTENDED_ARABIC_INDIC.indexOf(char);
    return extended !== -1 ? String(extended) : char;
  });
}

export function formatInt(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(value));
}

export function formatDecimal(value: number, digits = 1): string {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: digits }).format(
    value,
  );
}

/** "7.5k" style compaction for station labels. */
export function formatCompact(value: number): string {
  if (value >= 1000) return `${formatDecimal(value / 1000, value % 1000 === 0 ? 0 : 1)}k`;
  return formatInt(value);
}

export function parseIntSafe(input: string): number | null {
  const n = Number.parseInt(toWesternDigits(input).replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

export function parseFloatSafe(input: string): number | null {
  const n = Number.parseFloat(
    toWesternDigits(input)
      .replace(",", ".")
      .replace(/[^\d.-]/g, ""),
  );
  return Number.isFinite(n) ? n : null;
}
