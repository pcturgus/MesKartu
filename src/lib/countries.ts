// Guesses an ISO-3166 alpha-2 country code from a Lithuanian country name,
// so we can show a real flag next to a typed-in destination like "Turkija".
import { normalizeLt } from "@/lib/text";

const COUNTRY_MAP: { kw: string[]; code: string }[] = [
  { kw: ["lietuv"], code: "LT" },
  { kw: ["latvij"], code: "LV" },
  { kw: ["estij"], code: "EE" },
  { kw: ["lenkij"], code: "PL" },
  { kw: ["vokietij"], code: "DE" },
  { kw: ["pranc"], code: "FR" },
  { kw: ["ispanij"], code: "ES" },
  { kw: ["itali"], code: "IT" },
  { kw: ["portugalij"], code: "PT" },
  { kw: ["angl", "britanij", "jungtine karalyste"], code: "GB" },
  { kw: ["airij"], code: "IE" },
  { kw: ["oland", "nyderland"], code: "NL" },
  { kw: ["belgij"], code: "BE" },
  { kw: ["sveicarij"], code: "CH" },
  { kw: ["austrij"], code: "AT" },
  { kw: ["cekij"], code: "CZ" },
  { kw: ["slovakij"], code: "SK" },
  { kw: ["vengrij"], code: "HU" },
  { kw: ["kroatij"], code: "HR" },
  { kw: ["slovenij"], code: "SI" },
  { kw: ["graikij"], code: "GR" },
  { kw: ["turkij"], code: "TR" },
  { kw: ["suomij"], code: "FI" },
  { kw: ["svedij"], code: "SE" },
  { kw: ["norvegij"], code: "NO" },
  { kw: ["danij"], code: "DK" },
  { kw: ["islandij"], code: "IS" },
  { kw: ["rumunij"], code: "RO" },
  { kw: ["bulgarij"], code: "BG" },
  { kw: ["serbij"], code: "RS" },
  { kw: ["juodkalnij"], code: "ME" },
  { kw: ["albanij"], code: "AL" },
  { kw: ["malta"], code: "MT" },
  { kw: ["kipr"], code: "CY" },
  { kw: ["ukrain"], code: "UA" },
  { kw: ["moldov"], code: "MD" },
  { kw: ["gruzij"], code: "GE" },
  { kw: ["armenij"], code: "AM" },
  { kw: ["azerbaidz"], code: "AZ" },
  { kw: ["egipt"], code: "EG" },
  { kw: ["marok"], code: "MA" },
  { kw: ["tunis"], code: "TN" },
  { kw: ["emyrat", "dubaj"], code: "AE" },
  { kw: ["izraeli"], code: "IL" },
  { kw: ["maldyv"], code: "MV" },
  { kw: ["indij"], code: "IN" },
  { kw: ["tailand"], code: "TH" },
  { kw: ["vietnam"], code: "VN" },
  { kw: ["indonezij", "bali"], code: "ID" },
  { kw: ["kinij"], code: "CN" },
  { kw: ["japonij"], code: "JP" },
  { kw: ["korej"], code: "KR" },
  { kw: ["amerik", "jav"], code: "US" },
  { kw: ["kanad"], code: "CA" },
  { kw: ["meksik"], code: "MX" },
  { kw: ["brazilij"], code: "BR" },
  { kw: ["argentin"], code: "AR" },
  { kw: ["cile"], code: "CL" },
  { kw: ["australij"], code: "AU" },
  { kw: ["zelandij"], code: "NZ" },
  { kw: ["pietu afrik"], code: "ZA" },
  { kw: ["rusij"], code: "RU" },
  { kw: ["baltarusij"], code: "BY" },
];

export function guessCountryCode(text: string): string | null {
  const n = normalizeLt(text);
  for (const entry of COUNTRY_MAP) {
    for (const kw of entry.kw) {
      if (n.indexOf(kw) !== -1) return entry.code;
    }
  }
  return null;
}
