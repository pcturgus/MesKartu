import { guessCountryCode } from "@/lib/countries";

// ISO-3166 alpha-2 -> flag emoji: each letter maps to its Regional
// Indicator Symbol codepoint. No image/network fetch, no bundled asset —
// previously this pulled in every one of the country-flag-icons package's
// ~270 SVG components (several hundred KB of JS) just to ever show one or
// two flags at a time, so this drops that dependency entirely.
function flagEmoji(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

export function FlagIcon({ country }: { country: string }) {
  const code = guessCountryCode(country);

  if (code) {
    return (
      <span
        className="inline-flex items-center justify-center w-[30px] h-5 shrink-0 text-base leading-none"
        title={code}
      >
        {flagEmoji(code)}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center w-[30px] h-5 rounded-[3px] bg-surface-2 text-xs shrink-0"
      title="?"
    >
      🌍
    </span>
  );
}
