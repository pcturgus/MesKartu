// Shared Lithuanian-diacritics-insensitive normalizer, used by the
// country-flag guesser and the shopping-list product-icon guesser.
export function normalizeLt(s: string): string {
  const map: Record<string, string> = {
    ą: "a", č: "c", ę: "e", ė: "e", į: "i", š: "s", ų: "u", ū: "u", ž: "z",
  };
  return String(s ?? "")
    .toLowerCase()
    .replace(/[ąčęėįšųūž]/g, (c) => map[c] ?? c);
}
