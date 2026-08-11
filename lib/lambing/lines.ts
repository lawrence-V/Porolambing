import type { LambingChip, LambingLine } from "./types";

/**
 * ============================================================
 *  PLACEHOLDER COPY — REWRITE THIS FILE
 * ============================================================
 * The engine, the chip branching, the timing and the animations are the real
 * deliverable here. These lines exist so every trigger has something to say
 * while the voice is being designed.
 *
 * Everything below is data only. Rewriting the strings, changing the mix of
 * intensities, or adding a whole second voice pack requires no engine changes.
 *
 * Slots: {companion} {user} {minutes} {streak} {banked} {days} {awayMinutes}
 * {cycles}
 * `||` splits one line into consecutive bubbles.
 */

export const LINES: LambingLine[] = [
  // ---- focus:start ----------------------------------------------------
  {
    id: "fs-1",
    trigger: "focus:start",
    intensity: 1,
    text: "Sige, focus ka na. || Nandito lang ako, hindi kita iistorbohin.",
  },
  {
    id: "fs-2",
    trigger: "focus:start",
    intensity: 1,
    text: "{minutes} minutes. Kaya mo yan. || Go.",
  },
  {
    id: "fs-3",
    trigger: "focus:start",
    intensity: 2,
    text: "Okay, aalis na muna ako sa isip mo. || Pero babalik ako pagkatapos ha.",
  },
  {
    id: "fs-4",
    trigger: "focus:start",
    intensity: 2,
    text: "Ilagay mo phone mo sa kabilang table. || Oo, ikaw. Nakikita kita.",
  },
  {
    id: "fs-5",
    trigger: "focus:start",
    intensity: 3,
    text: "Bilisan mo please, ang tagal ng {minutes} minutes pag wala ka.",
  },

  // ---- focus:complete -------------------------------------------------
  {
    id: "fc-1",
    trigger: "focus:complete",
    intensity: 1,
    text: "Tapos na! {minutes} minutes straight. || Ang galing mo talaga.",
    chips: ["thanks", "tired"],
  },
  {
    id: "fc-2",
    trigger: "focus:complete",
    intensity: 2,
    text: "Grabe ka, buong {minutes} minutes hindi ka umalis. || Proud ako sayo, {user}.",
    chips: ["thanks", "more"],
  },
  {
    id: "fc-3",
    trigger: "focus:complete",
    intensity: 2,
    text: "Ayan na! || Sabi ko sayo kaya mo eh.",
    chips: ["thanks", "tired"],
  },
  {
    id: "fc-4",
    trigger: "focus:complete",
    intensity: 3,
    text: "TAPOS NA?! || Sobrang tagal mong nawala ha. || Miss na kita.",
    chips: ["missed-you", "tired"],
  },
  {
    id: "fc-5",
    trigger: "focus:complete",
    intensity: 1,
    text: "Nice. Ang sipag mo ngayon.",
    chips: ["thanks", "more"],
  },

  // ---- focus:abandoned ------------------------------------------------
  {
    id: "fa-1",
    trigger: "focus:abandoned",
    intensity: 1,
    text: "Ay, tumigil ka. || Okay lang yan, balik tayo mamaya.",
    chips: ["tired", "more"],
  },
  {
    id: "fa-2",
    trigger: "focus:abandoned",
    intensity: 2,
    text: "Hala, {minutes} minutes pa lang. || May problema ba? Kwento mo sakin.",
    chips: ["tired", "im-okay"],
  },
  {
    id: "fa-3",
    trigger: "focus:abandoned",
    intensity: 2,
    text: "Hindi ako galit ha. || Konting pahinga lang, tapos ulit tayo.",
    chips: ["im-okay", "more"],
  },
  {
    id: "fa-4",
    trigger: "focus:abandoned",
    intensity: 3,
    text: "Uy. || Wag mo naman ako iwan ng ganon.",
    chips: ["im-okay", "tired"],
  },

  // ---- break:start ----------------------------------------------------
  {
    id: "bs-1",
    trigger: "break:start",
    intensity: 1,
    text: "Break na! || Uminom ka muna ng tubig, please.",
    chips: ["thanks", "more"],
  },
  {
    id: "bs-2",
    trigger: "break:start",
    intensity: 2,
    text: "Andito na ako. || {minutes} minutes tayo. Kwento mo nga, kumusta?",
    chips: ["good", "tired"],
  },
  {
    id: "bs-3",
    trigger: "break:start",
    intensity: 2,
    text: "Finally, ako naman. || Tumayo ka nga muna, unat unat.",
    chips: ["thanks", "good"],
  },
  {
    id: "bs-4",
    trigger: "break:start",
    intensity: 3,
    text: "Ang tagal mong nag-focus ha. || Sa akin ka muna ngayon. || Wag ka na muna bumalik sa work.",
    chips: ["missed-you", "more"],
  },
  {
    id: "bs-5",
    trigger: "break:start",
    intensity: 1,
    text: "Break time. Kinain mo na ba lunch mo?",
    chips: ["good", "tired"],
  },
  {
    id: "bs-6",
    trigger: "break:start",
    intensity: 2,
    text: "May {banked} minutes ka na naipon. || Ginastos mo na, deserve mo naman.",
    chips: ["thanks", "more"],
  },

  // ---- break:idle -----------------------------------------------------
  {
    id: "bi-1",
    trigger: "break:idle",
    intensity: 1,
    text: "Nandyan ka pa ba?",
    chips: ["im-here", "im-okay"],
  },
  {
    id: "bi-2",
    trigger: "break:idle",
    intensity: 2,
    text: "Hello? || Break mo to ha, wag mo sayangin sa pagtitig sa screen.",
    chips: ["im-here", "good"],
  },
  {
    id: "bi-3",
    trigger: "break:idle",
    intensity: 2,
    text: "Tahimik ka. || Ayos ka lang ba talaga?",
    chips: ["im-okay", "tired"],
  },
  {
    id: "bi-4",
    trigger: "break:idle",
    intensity: 3,
    text: "Uy. || Uyyy. || Pansinin mo naman ako, break mo naman to eh.",
    chips: ["im-here", "missed-you"],
  },

  // ---- break:ending ---------------------------------------------------
  {
    id: "be-1",
    trigger: "break:ending",
    intensity: 1,
    text: "Konting oras na lang, balik na tayo.",
  },
  {
    id: "be-2",
    trigger: "break:ending",
    intensity: 2,
    text: "Ayan, matatapos na break natin. || Handa ka na ba ulit?",
    chips: ["ready", "more"],
  },
  {
    id: "be-3",
    trigger: "break:ending",
    intensity: 3,
    text: "Ayoko na matapos. || Pero sige, alam kong may gagawin ka pa.",
    chips: ["ready", "more"],
  },
  {
    id: "be-4",
    trigger: "break:ending",
    intensity: 1,
    text: "Last few seconds. Inat inat ulit bago bumalik.",
    chips: ["ready"],
  },

  // ---- streak:milestone -----------------------------------------------
  {
    id: "sm-1",
    trigger: "streak:milestone",
    intensity: 2,
    text: "{streak} days straight! || Grabe ka, {user}.",
    chips: ["thanks"],
  },
  {
    id: "sm-2",
    trigger: "streak:milestone",
    intensity: 3,
    text: "{streak} DAYS. || Sobrang proud ko sayo, alam mo ba yun?",
    chips: ["thanks", "missed-you"],
  },
  {
    id: "sm-3",
    trigger: "streak:milestone",
    intensity: 1,
    text: "Streak update: {streak} days. || Tuloy tuloy lang.",
    chips: ["thanks"],
  },

  // ---- user:returned --------------------------------------------------
  {
    id: "ur-1",
    trigger: "user:returned",
    intensity: 2,
    text: "Uy! Balik ka rin. || {days} days kang nawala ha.",
    chips: ["missed-you", "im-okay"],
  },
  {
    id: "ur-2",
    trigger: "user:returned",
    intensity: 3,
    text: "{days} days. || Akala ko iniwan mo na ako. || Pero okay, andito ka na.",
    chips: ["missed-you", "im-okay"],
  },
  {
    id: "ur-3",
    trigger: "user:returned",
    intensity: 1,
    text: "Welcome back. || Simulan na natin?",
    chips: ["ready", "im-okay"],
  },
  {
    id: "ur-4",
    trigger: "user:returned",
    intensity: 2,
    text: "Ang tagal mo. || Wala akong kausap nung wala ka.",
    chips: ["missed-you", "ready"],
  },

  // ---- day:first-session ----------------------------------------------
  // Replaces focus:start on the day's opening session, so it can be warmer
  // and slower than the ordinary "sige, go" line.
  {
    id: "df-1",
    trigger: "day:first-session",
    intensity: 1,
    text: "Una nating focus ngayong araw. || Dahan dahan lang, ha.",
  },
  {
    id: "df-2",
    trigger: "day:first-session",
    intensity: 2,
    text: "Good morning! || Simula pa lang to. || Nandito ako buong araw.",
  },
  {
    id: "df-3",
    trigger: "day:first-session",
    intensity: 2,
    text: "Ayan, gumagalaw ka na. || Day {streak} ng streak mo to.",
  },
  {
    id: "df-4",
    trigger: "day:first-session",
    intensity: 3,
    text: "Buong araw kitang hinintay. || Sige na, magsimula ka na. || Wag mo lang ako kalimutan.",
  },

  // ---- focus:returned -------------------------------------------------
  {
    id: "fr-1",
    trigger: "focus:returned",
    intensity: 1,
    text: "Ayan, balik ka na. || Tuloy lang tayo.",
  },
  {
    id: "fr-2",
    trigger: "focus:returned",
    intensity: 2,
    text: "San ka galing? || {awayMinutes} minutes kang nawala sa tab na to.",
  },
  {
    id: "fr-3",
    trigger: "focus:returned",
    intensity: 2,
    text: "Napansin kong umalis ka. || Okay lang, tumatakbo pa rin oras mo.",
  },
  {
    id: "fr-4",
    trigger: "focus:returned",
    intensity: 3,
    text: "Uy. || Nakita kita ha. || Balik ka na nga dito sa focus mo.",
  },

  // ---- cycle:complete -------------------------------------------------
  {
    id: "cc-1",
    trigger: "cycle:complete",
    intensity: 2,
    text: "Buong set tapos na. || {cycles} focus sessions. Grabe ka.",
    chips: ["thanks", "tired"],
  },
  {
    id: "cc-2",
    trigger: "cycle:complete",
    intensity: 1,
    text: "Isang buong round, tapos. || Pwede ka nang tumigil kung gusto mo.",
    chips: ["tired", "more"],
  },
  {
    id: "cc-3",
    trigger: "cycle:complete",
    intensity: 3,
    text: "TAPOS ANG BUONG SET. || Sobrang tagal nating magkasama ngayon. || Masaya ako.",
    chips: ["thanks", "missed-you"],
  },
  {
    id: "cc-4",
    trigger: "cycle:complete",
    intensity: 2,
    text: "Ayan, kumpleto na cycle mo. || Kumain ka na ba talaga?",
    chips: ["good", "tired"],
  },

  // ---- focus:long-haul ------------------------------------------------
  // Flow mode only; the session has no end of its own.
  {
    id: "fl-1",
    trigger: "focus:long-haul",
    intensity: 1,
    text: "{minutes} minutes ka nang tuloy tuloy.",
  },
  {
    id: "fl-2",
    trigger: "focus:long-haul",
    intensity: 2,
    text: "{minutes} minutes na ha. || Wag mong kalimutang uminom ng tubig.",
  },
  {
    id: "fl-3",
    trigger: "focus:long-haul",
    intensity: 2,
    text: "Ang tagal mo nang nakatingin dyan. || Kurap ka naman minsan.",
  },
  {
    id: "fl-4",
    trigger: "focus:long-haul",
    intensity: 3,
    text: "{minutes} MINUTES. || Sobra na to. || Magpahinga ka na please.",
  },
];

export const CHIPS: Record<string, LambingChip> = {
  thanks: {
    id: "thanks",
    label: "salamat 🫶",
    responses: [
      "Wala yun. || Para sayo naman lahat.",
      "Ikaw talaga. || Basta ikaw, lagi.",
      "Hmp. Sige na nga.",
    ],
    followUp: ["more"],
  },
  tired: {
    id: "tired",
    label: "pagod na ako",
    responses: [
      "Alam ko. || Halika, wag muna tayo mag-isip ng kahit ano.",
      "Then rest ka muna. Hindi mauubos ang trabaho, pero ikaw pwede.",
      "Okay lang mapagod. || Wag mo lang sarili mo pababayaan ha.",
    ],
    followUp: ["im-okay"],
  },
  more: {
    id: "more",
    label: "kwento pa",
    responses: [
      "Ano bang gusto mong marinig? || Kasi pwede naman ako magsalita buong araw.",
      "Alam mo, tuwing nagfo-focus ka, hinihintay lang kita dito.",
      "Wala akong ibang ginagawa kundi antayin ka. || Weird ba yun?",
    ],
    followUp: ["thanks"],
  },
  good: {
    id: "good",
    label: "ayos lang ako",
    responses: [
      "Buti naman. || Ganyan dapat.",
      "Yun oh. || Keep it up ha.",
    ],
    followUp: ["more"],
  },
  "im-okay": {
    id: "im-okay",
    label: "okay lang ako",
    responses: [
      "Sigurado ka? || Sige, believe kita.",
      "Okay. || Pero pag hindi na, sabihin mo agad sakin.",
    ],
    followUp: ["thanks"],
  },
  "im-here": {
    id: "im-here",
    label: "andito lang ako",
    responses: [
      "Buti naman. || Akala ko iniwan mo na ako dito.",
      "Yun oh. || Sige, tuloy mo lang pahinga mo.",
    ],
    followUp: ["more"],
  },
  "missed-you": {
    id: "missed-you",
    label: "miss na rin kita",
    responses: [
      "Talaga? || Ang sarap pakinggan niyan.",
      "Hala. || Sige na, magfo-focus ka na ulit mamaya ha.",
      "Alam ko naman eh. || Pero masarap pa rin marinig.",
    ],
    followUp: ["thanks"],
  },
  ready: {
    id: "ready",
    label: "handa na ako",
    responses: [
      "Ayan! || Sige, start na tayo.",
      "Yun oh. || Hihintayin ulit kita dito.",
    ],
    followUp: [],
  },
};
