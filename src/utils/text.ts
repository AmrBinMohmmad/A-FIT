/** Up to two initials for an avatar fallback: "Faisal Al-Amri" → "FA", "فيصل" → "ف". */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "•";
  const first = Array.from(words[0] ?? "")[0] ?? "";
  const second = words.length > 1 ? (Array.from(words[words.length - 1] ?? "")[0] ?? "") : "";
  return (first + second).toUpperCase();
}
