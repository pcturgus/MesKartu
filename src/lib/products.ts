// Guesses a grocery emoji from a Lithuanian product name typed into the
// shopping list, so items get a little icon without any manual picking.
import { normalizeLt } from "@/lib/text";

const PRODUCT_EMOJI_MAP: { kw: string[]; icon: string; exclude?: string[] }[] = [
  { kw: ["obuol"], icon: "🍎" },
  { kw: ["banan"], icon: "🍌" },
  { kw: ["apelsin"], icon: "🍊" },
  { kw: ["mandarin"], icon: "🍊" },
  { kw: ["citrin"], icon: "🍋" },
  { kw: ["vynuog"], icon: "🍇" },
  { kw: ["arbūz", "arbuz"], icon: "🍉" },
  { kw: ["braškė", "braske", "braskiu"], icon: "🍓" },
  { kw: ["melion"], icon: "🍈" },
  { kw: ["kriauš", "kriaus"], icon: "🍐" },
  { kw: ["persik"], icon: "🍑" },
  { kw: ["slyv"], icon: "🍑" },
  { kw: ["ananas"], icon: "🍍" },
  { kw: ["mango"], icon: "🥭" },
  { kw: ["avokad"], icon: "🥑" },
  { kw: ["kivi"], icon: "🥝" },
  { kw: ["pomidor"], icon: "🍅" },
  { kw: ["agurk"], icon: "🥒" },
  { kw: ["mork"], icon: "🥕" },
  { kw: ["bulv"], icon: "🥔" },
  { kw: ["svogūn", "svogun"], icon: "🧅" },
  { kw: ["česnak", "cesnak"], icon: "🧄" },
  { kw: ["paprik"], icon: "🫑" },
  { kw: ["brokol"], icon: "🥦" },
  { kw: ["kopūst", "kopust"], icon: "🥬" },
  { kw: ["salot"], icon: "🥬" },
  { kw: ["kukurūz", "kukuruz"], icon: "🌽" },
  { kw: ["grybai", "grybu", "grybų", "grybas"], icon: "🍄" },
  { kw: ["moliūg", "moliug"], icon: "🎃" },
  { kw: ["pien"], icon: "🥛" },
  // "sur" also matches inside "sūrus"/"sūri" (salty) after diacritics are
  // stripped — exclude those specific (already-normalized) words so e.g.
  // "sūrūs riešutai" (salty nuts) falls through to the nuts keyword
  // instead of cheese.
  { kw: ["sūr", "sur"], icon: "🧀", exclude: ["surus", "suri", "surios", "suraus", "suriau", "suresnis"] },
  { kw: ["kiaušin", "kiausin"], icon: "🥚" },
  { kw: ["jogurt"], icon: "🥣" },
  { kw: ["sviest"], icon: "🧈" },
  { kw: ["grietin"], icon: "🥛" },
  { kw: ["duon"], icon: "🍞" },
  { kw: ["baton"], icon: "🥖" },
  { kw: ["bandel"], icon: "🥐" },
  { kw: ["mėsa", "mesa", "mėsos", "mesos"], icon: "🥩" },
  { kw: ["vištien", "vistien", "viští", "visti"], icon: "🍗" },
  { kw: ["kiaulien"], icon: "🥓" },
  { kw: ["jautien"], icon: "🥩" },
  { kw: ["dešrel", "desrel", "dešra", "desra"], icon: "🌭" },
  { kw: ["žuv", "zuv"], icon: "🐟" },
  { kw: ["lašiš", "lasis"], icon: "🐟" },
  { kw: ["krevet"], icon: "🍤" },
  { kw: ["vanden", "vandenio", "vanduo"], icon: "💧" },
  { kw: ["sult"], icon: "🧃" },
  { kw: ["kav"], icon: "☕" },
  { kw: ["arbat"], icon: "🍵" },
  { kw: ["alus", "alaus"], icon: "🍺" },
  { kw: ["vyn"], icon: "🍷" },
  { kw: ["šokolad", "sokolad"], icon: "🍫" },
  { kw: ["saldain"], icon: "🍬" },
  { kw: ["sausain"], icon: "🍪" },
  { kw: ["led"], icon: "🍨" },
  { kw: ["traškuč", "traskuc", "čipsai", "cipsai"], icon: "🍟" },
  { kw: ["ryži", "ryzi"], icon: "🍚" },
  { kw: ["makaron"], icon: "🍝" },
  { kw: ["grik"], icon: "🌾" },
  { kw: ["avižų", "avizu", "avižos", "avizos"], icon: "🌾" },
  { kw: ["milt"], icon: "🌾" },
  { kw: ["pica"], icon: "🍕" },
  { kw: ["tualet", "popier"], icon: "🧻" },
  { kw: ["muil"], icon: "🧼" },
  { kw: ["dantų", "dantu", "pasta"], icon: "🦷" },
  { kw: ["skalbim"], icon: "🧺" },
  { kw: ["indų", "indu"], icon: "🧽" },
  { kw: ["servetė", "serveti"], icon: "🧻" },
  { kw: ["šampūn", "sampun"], icon: "🧴" },
  { kw: ["vystykl"], icon: "👶" },
  // "gel" also matches inside "gelis" (shower/hair gel) after diacritics
  // are stripped from "gėl" — exclude those forms so "dušo gelis" falls
  // through instead of showing a flower.
  { kw: ["gėl", "gel"], icon: "💐", exclude: ["gelis", "gelio", "geliu", "gelyje", "gelio"] },
  { kw: ["žvak", "zvak"], icon: "🕯️" },
  { kw: ["šuns", "suns", "katės", "kates", "gyvūn", "gyvun"], icon: "🐾" },
  { kw: ["riešut", "riesut"], icon: "🥜" },
  { kw: ["medus"], icon: "🍯" },
  { kw: ["kiaušinien"], icon: "🍳" },
];

export function guessProductEmoji(text: string): string {
  const n = normalizeLt(text);
  const words = n.split(/\s+/).filter(Boolean);
  for (const entry of PRODUCT_EMOJI_MAP) {
    for (const kw of entry.kw) {
      if (n.indexOf(kw) === -1) continue;
      // A plain substring hit can land inside an unrelated word that
      // happens to share the same root after diacritics are stripped
      // (e.g. "sur" inside "sūrus"/salty, not "sūris"/cheese). If the
      // matched keyword's containing word is explicitly excluded, skip
      // this keyword instead of guessing wrong.
      if (entry.exclude?.some((bad) => words.some((w) => w.indexOf(kw) !== -1 && w === bad))) continue;
      return entry.icon;
    }
  }
  return "🛒";
}
