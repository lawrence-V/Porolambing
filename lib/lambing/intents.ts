import type { Intent } from "./types";

/**
 * ============================================================
 *  DRAFT COPY — EDIT FREELY
 * ============================================================
 * What the companion recognises when you *type* to it. Purely local keyword
 * matching — no model, no network — so this table is the whole vocabulary.
 * Adding an entry is how it learns to talk about something new.
 *
 * Keywords are normalised before matching (lowercased, punctuation and
 * accents stripped). Anything four characters or shorter matches whole words
 * only, so `hi` can't fire from inside *hindi*, *this* or *sipag*. Longer
 * phrases score higher, so "miss na kita" wins over a bare "miss".
 *
 * Write Taglish keywords in both languages — people switch mid-sentence.
 */
export const INTENTS: Intent[] = [
  {
    id: "greeting",
    match: ["hi", "hey", "helo", "hello", "uy", "oy", "kumusta", "kamusta", "musta", "how are you"],
    responses: [
      "Uy! || Kumusta ka?",
      "Hello. || Nandito lang ako, gaya ng dati.",
      "Uy ikaw. || Anong meron?",
    ],
    chips: ["good", "tired"],
  },
  {
    id: "tired",
    persona: "jowa",
    match: ["pagod", "tired", "exhausted", "puyat", "hirap", "sawa", "burnt out", "burnout"],
    responses: [
      "Alam ko. || Halika, huminga ka muna.",
      "Pagod ka na naman. || Kailan ka ba huling nagpahinga nang totoo?",
      "Sandali lang. || Wag mo muna isipin trabaho.",
    ],
    chips: ["im-okay", "more"],
  },
  {
    id: "tired",
    persona: "bestfriend",
    match: ["pagod", "tired", "exhausted", "puyat", "hirap", "sawa", "burnt out", "burnout"],
    responses: [
      "Edi magpahinga ka. || Bakit parang mahirap yun sayo?",
      "Pagod ka pero nasa fourth hour ka na ng scroll. || Chaka.",
      "Sige, humiga ka muna. || Andito lang ako pag balik mo.",
    ],
    chips: ["im-okay", "more"],
  },
  {
    id: "missing",
    match: ["miss", "namiss", "namimiss", "miss kita", "miss na kita"],
    responses: [
      "Miss mo ako? || Ang sarap pakinggan niyan.",
      "Andito lang naman ako palagi. || Pero sige, miss din kita.",
      "Uy. || Wag mo sabihin yan kung hindi mo ibig sabihin ha.",
    ],
    chips: ["thanks", "more"],
  },
  {
    id: "thanks",
    match: ["salamat", "thanks", "thank you", "ty", "tnx"],
    responses: ["Wala yun.", "Anytime. || Para saan pa ba ako?", "Hmp. || Sige na nga."],
    chips: ["more"],
  },
  {
    id: "affection",
    persona: "jowa",
    match: ["mahal kita", "love you", "iloveyou", "ily", "mahal", "love"],
    responses: [
      "Ay. || Hindi ako handa dyan. || Pero mahal din kita.",
      "Ganyan ka lang pag break time ano. || Sige, tanggap ko.",
    ],
    chips: ["thanks"],
  },
  {
    id: "affection",
    persona: "bestfriend",
    match: ["mahal kita", "love you", "iloveyou", "ily", "mahal", "love"],
    responses: [
      "Weh. || Anong kailangan mo?",
      "Ang lambing mo ngayon. || Nakakatakot.",
    ],
    chips: ["thanks"],
  },
  {
    id: "hungry",
    match: ["gutom", "hungry", "kain", "lunch", "dinner", "breakfast", "merienda"],
    responses: [
      "Kumain ka na. || Seryoso. Ngayon na.",
      "Gutom ka na naman at hindi ka pa kumakain ano. || Tama ba ako?",
      "Break muna, kain muna. || Hindi tumatakbo yung utak sa hangin.",
    ],
    chips: ["good", "more"],
  },
  {
    id: "sleepy",
    match: ["antok", "sleepy", "tulog", "sleep", "inaantok"],
    responses: [
      "Matulog ka na kaya. || Bukas na yan.",
      "Antok ka pero magfo-focus ka pa? || Sige, tignan natin.",
      "Power nap. 20 minutes. || Trust me.",
    ],
    chips: ["im-okay", "more"],
  },
  {
    id: "work-stress",
    match: ["stress", "stressed", "deadline", "ang dami", "sobrang dami", "overwhelmed", "di ko kaya", "hindi ko kaya"],
    responses: [
      "Isa-isa lang. || Wag mo isipin lahat nang sabay.",
      "Ang dami talaga. || Pero hindi mo kailangan tapusin lahat ngayon.",
      "Huminga ka muna. || Anong pinakamaliit na pwede mong gawin ngayon?",
    ],
    chips: ["tired", "im-okay"],
  },
  {
    id: "who-are-you",
    match: ["sino ka", "who are you", "ano ka", "what are you", "bot ka ba", "ai ka ba"],
    responses: [
      "Ako yung naghihintay sayo habang nagtatrabaho ka. || Yun lang naman trabaho ko.",
      "Kasama mo. || Wag mo nang isipin masyado.",
    ],
    chips: ["more"],
  },
  {
    id: "leaving",
    match: ["bye", "aalis", "alis na", "goodbye", "babay", "sige na", "later"],
    responses: [
      "Sige. || Babalik ka ha?",
      "Ingat ka. || Andito lang ako pag bumalik ka.",
    ],
    chips: ["ready"],
  },
  {
    id: "yes",
    match: ["oo", "yes", "opo", "sige", "yep", "yeah", "tama"],
    responses: ["Ayan ha. || Sabi mo yan.", "Okay. || Tandaan ko yan."],
    chips: ["more"],
  },
  {
    id: "no",
    match: ["hindi", "no", "ayoko", "nope", "wag"],
    responses: ["Sige, hindi. || Ikaw bahala.", "Okay lang. || Hindi naman kita pipilitin."],
    chips: ["more"],
  },
];

/**
 * Used when nothing matched — which will be most of the time, because this is
 * a keyword table and not a language model.
 *
 * These carry the whole illusion. A companion that says "I don't understand"
 * stops being a companion and becomes a broken parser, so every one of these
 * hands the turn back instead of admitting the miss.
 */
export const FALLBACKS: string[] = [
  "Hmm. || Di ko masyadong nagets, pero go on.",
  "Ganon ba. || Kwento mo pa.",
  "Ay. || Sige, sabihin mo pa.",
  "Naririnig kita ha. || Tuloy mo lang.",
  "Hmm hmm. || Anong nangyari after?",
  "Oo nga eh. || Tapos?",
];
