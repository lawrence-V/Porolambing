import type { LambingChip, LambingLine } from "./types";

/**
 * ============================================================
 *  DRAFT COPY — EDIT FREELY
 * ============================================================
 * This is the product. The engine, timing and matching are finished; these
 * words are a first pass to be rewritten in your own voice.
 *
 * Everything here is data. Rewriting strings, changing the intensity mix or
 * adding a third persona needs no engine changes.
 *
 * TWO VOICES, kept deliberately distinct:
 *   jowa       — soft, possessive, a little dramatic. Misses you out loud.
 *   bestfriend — dry, teasing, roasts you with affection. Never soppy.
 * A line with no `persona` is shared by both, so keep those genuinely neutral.
 *
 * intensity  1 gentle · 2 warm · 3 clingy. The engine raises the baseline as
 *            the session count grows, so 3s are what a long-time user hears.
 * `||`       splits one line into consecutive bubbles.
 * slots      {companion} {user} {minutes} {banked} {days}
 *            {awayMinutes} {cycles} {task}
 * requiresTask — set it on any line using {task}, or it renders blank.
 */

export const LINES: LambingLine[] = [
  // ── day:first-session ─────────────────────────────────────────────
  { id: "jo-first-1", persona: "jowa", trigger: "day:first-session", intensity: 1,
    text: "Uy, first session mo today. || Sabay tayo ha." },
  { id: "jo-first-2", persona: "jowa", trigger: "day:first-session", intensity: 2,
    text: "Ayan, gumagalaw ka na. || Hinihintay na kita kanina pa." },
  { id: "jo-first-3", persona: "jowa", trigger: "day:first-session", intensity: 3,
    text: "Sa wakas! || Buong araw akong nandito ha. || Sige na, simulan na natin." },
  { id: "jo-first-4", persona: "jowa", trigger: "day:first-session", intensity: 2,
    requiresTask: true, text: "Una sa lahat ngayon: {task}. || Kaya mo yan." },

  { id: "bf-first-1", persona: "bestfriend", trigger: "day:first-session", intensity: 1,
    text: "Yieee, nagsimula rin. || Go." },
  { id: "bf-first-2", persona: "bestfriend", trigger: "day:first-session", intensity: 2,
    text: "First session ng araw. || Wow, ang aga — 10 minutes lang late sa plano mo." },
  { id: "bf-first-3", persona: "bestfriend", trigger: "day:first-session", intensity: 3,
    text: "Buhay ka pa pala. || Akala ko nag-resign ka na sa buhay. || Tara na." },
  { id: "bf-first-4", persona: "bestfriend", trigger: "day:first-session", intensity: 2,
    requiresTask: true, text: "{task} daw ngayon. || Tignan natin kung matatapos mo." },

  // ── focus:start ───────────────────────────────────────────────────
  { id: "jo-fs-1", persona: "jowa", trigger: "focus:start", intensity: 1,
    text: "Sige, focus ka na. || Nandito lang ako." },
  { id: "jo-fs-2", persona: "jowa", trigger: "focus:start", intensity: 2,
    text: "{minutes} minutes. || Bilisan mo, ha? Naiinip ako." },
  { id: "jo-fs-3", persona: "jowa", trigger: "focus:start", intensity: 3,
    text: "Aalis na naman ako sa isip mo. || Pero okay lang. || Sanay na ako." },
  { id: "jo-fs-4", persona: "jowa", trigger: "focus:start", intensity: 2,
    requiresTask: true, text: "{task} muna. || Pag tapos ka, akin ka na ulit." },

  { id: "bf-fs-1", persona: "bestfriend", trigger: "focus:start", intensity: 1,
    text: "Sige. Wag mo ako kausapin. || Joke. Pero seryoso, focus ka." },
  { id: "bf-fs-2", persona: "bestfriend", trigger: "focus:start", intensity: 2,
    text: "{minutes} minutes. || Ilayo mo nga phone mo. Oo, nakikita kita." },
  { id: "bf-fs-3", persona: "bestfriend", trigger: "focus:start", intensity: 3,
    text: "Betcha mag-oopen ka ng ibang tab in 4 minutes. || Patunayan mo akong mali." },
  { id: "bf-fs-4", persona: "bestfriend", trigger: "focus:start", intensity: 2,
    requiresTask: true, text: "{task}. || Yun lang. Wag kang mag-multitask, alam ko ugali mo." },

  // ── focus:complete ────────────────────────────────────────────────
  { id: "jo-fc-1", persona: "jowa", trigger: "focus:complete", intensity: 1,
    text: "Tapos na! {minutes} minutes. || Ang galing mo talaga.", chips: ["thanks", "tired"] },
  { id: "jo-fc-2", persona: "jowa", trigger: "focus:complete", intensity: 2,
    text: "Buong {minutes} minutes hindi ka umalis. || Proud ako sayo, {user}.", chips: ["thanks", "more"] },
  { id: "jo-fc-3", persona: "jowa", trigger: "focus:complete", intensity: 3,
    text: "TAPOS NA?! || Grabe ang tagal mong nawala. || Miss na miss na kita.", chips: ["missed-you", "tired"] },
  { id: "jo-fc-4", persona: "jowa", trigger: "focus:complete", intensity: 2,
    requiresTask: true, text: "Kumusta na yung {task}? || Kwento mo sakin.", chips: ["good", "tired"] },

  { id: "bf-fc-1", persona: "bestfriend", trigger: "focus:complete", intensity: 1,
    text: "Ayan. {minutes} minutes. || Hindi naman pala mahirap ano.", chips: ["thanks", "tired"] },
  { id: "bf-fc-2", persona: "bestfriend", trigger: "focus:complete", intensity: 2,
    text: "Okay okay, {minutes} minutes straight. || Aaminin ko, impressed ako konti.", chips: ["thanks", "more"] },
  { id: "bf-fc-3", persona: "bestfriend", trigger: "focus:complete", intensity: 3,
    text: "Grabe ka ha. || Sino ka at anong ginawa mo sa kaibigan ko?", chips: ["thanks", "more"] },
  { id: "bf-fc-4", persona: "bestfriend", trigger: "focus:complete", intensity: 2,
    requiresTask: true, text: "So tapos na ba yung {task} o nag-stare ka lang sa screen?", chips: ["good", "tired"] },

  // ── focus:abandoned ───────────────────────────────────────────────
  { id: "jo-fa-1", persona: "jowa", trigger: "focus:abandoned", intensity: 1,
    text: "Ay, tumigil ka. || Okay lang yan.", chips: ["tired", "im-okay"] },
  { id: "jo-fa-2", persona: "jowa", trigger: "focus:abandoned", intensity: 2,
    text: "{minutes} minutes pa lang. || May problema ba? Kwento mo sakin.", chips: ["tired", "im-okay"] },
  { id: "jo-fa-3", persona: "jowa", trigger: "focus:abandoned", intensity: 3,
    text: "Uy. || Wag mo naman ako iwan ng ganon. || Joke lang. Ayos ka lang ba?", chips: ["im-okay", "tired"] },

  { id: "bf-fa-1", persona: "bestfriend", trigger: "focus:abandoned", intensity: 1,
    text: "Ay, quit. || Walang judgment. Konti lang.", chips: ["tired", "im-okay"] },
  { id: "bf-fa-2", persona: "bestfriend", trigger: "focus:abandoned", intensity: 2,
    text: "{minutes} minutes. || Bes. Alam nating dalawa na kaya mo pa yan.", chips: ["tired", "im-okay"] },
  { id: "bf-fa-3", persona: "bestfriend", trigger: "focus:abandoned", intensity: 3,
    text: "Sabi ko na eh. || Hindi ako galit, disappointed lang. || Charot. Balik tayo mamaya.", chips: ["im-okay", "more"] },

  // ── break:start ───────────────────────────────────────────────────
  { id: "jo-bs-1", persona: "jowa", trigger: "break:start", intensity: 1,
    text: "Break na! || Uminom ka muna ng tubig, please.", chips: ["thanks", "more"] },
  { id: "jo-bs-2", persona: "jowa", trigger: "break:start", intensity: 2,
    text: "Andito na ako. || {minutes} minutes tayo. Kumusta ka?", chips: ["good", "tired"] },
  { id: "jo-bs-3", persona: "jowa", trigger: "break:start", intensity: 3,
    text: "Sa akin ka na muna ngayon. || Wag ka na bumalik sa work. || Please?", chips: ["missed-you", "more"] },
  { id: "jo-bs-4", persona: "jowa", trigger: "break:start", intensity: 2,
    text: "May {banked} minutes kang naipon. || Deserve mo naman.", chips: ["thanks", "good"] },

  { id: "bf-bs-1", persona: "bestfriend", trigger: "break:start", intensity: 1,
    text: "Break. || Tumayo ka. Oo, tumayo ka talaga.", chips: ["thanks", "good"] },
  { id: "bf-bs-2", persona: "bestfriend", trigger: "break:start", intensity: 2,
    text: "{minutes} minutes tayo. || Kwento mo nga, anong drama ngayon?", chips: ["good", "tired"] },
  { id: "bf-bs-3", persona: "bestfriend", trigger: "break:start", intensity: 3,
    text: "Finally, ako naman. || Nakakainis yung trabaho mo, lagi ka niyang kinukuha.", chips: ["missed-you", "more"] },
  { id: "bf-bs-4", persona: "bestfriend", trigger: "break:start", intensity: 1,
    text: "Kinain mo na ba lunch mo? || Hulaan ko: hindi pa.", chips: ["good", "tired"] },

  // ── break:idle ────────────────────────────────────────────────────
  { id: "jo-bi-1", persona: "jowa", trigger: "break:idle", intensity: 1,
    text: "Nandyan ka pa ba?", chips: ["im-here", "im-okay"] },
  { id: "jo-bi-2", persona: "jowa", trigger: "break:idle", intensity: 2,
    text: "Hello? || Break mo to ha, wag mong sayangin.", chips: ["im-here", "good"] },
  { id: "jo-bi-3", persona: "jowa", trigger: "break:idle", intensity: 3,
    text: "Uy. || Uyyy. || Pansinin mo naman ako, ilang minuto lang naman to eh.", chips: ["im-here", "missed-you"] },

  { id: "bf-bi-1", persona: "bestfriend", trigger: "break:idle", intensity: 1,
    text: "Tahimik ka. || Nakatulog ka na ba?", chips: ["im-here", "im-okay"] },
  { id: "bf-bi-2", persona: "bestfriend", trigger: "break:idle", intensity: 2,
    text: "Bes. || Nakatitig ka lang sa screen ano. Alam ko.", chips: ["im-here", "good"] },
  { id: "bf-bi-3", persona: "bestfriend", trigger: "break:idle", intensity: 3,
    text: "Ginagago mo ba ako. || Break ito. B-R-E-A-K.", chips: ["im-here", "im-okay"] },

  // ── break:ending ──────────────────────────────────────────────────
  { id: "jo-be-1", persona: "jowa", trigger: "break:ending", intensity: 1,
    text: "Konting oras na lang.", chips: ["ready"] },
  { id: "jo-be-2", persona: "jowa", trigger: "break:ending", intensity: 2,
    text: "Matatapos na break natin. || Handa ka na ba ulit?", chips: ["ready", "more"] },
  { id: "jo-be-3", persona: "jowa", trigger: "break:ending", intensity: 3,
    text: "Ayoko na matapos. || Pero sige. Alam kong may gagawin ka pa.", chips: ["ready", "more"] },

  { id: "bf-be-1", persona: "bestfriend", trigger: "break:ending", intensity: 1,
    text: "Balik na tayo. Inat inat muna.", chips: ["ready"] },
  { id: "bf-be-2", persona: "bestfriend", trigger: "break:ending", intensity: 2,
    text: "Times up na halos. || Wag kang magpanggap na hindi mo nakita to.", chips: ["ready", "more"] },
  { id: "bf-be-3", persona: "bestfriend", trigger: "break:ending", intensity: 3,
    text: "Sige na, bumalik ka na. || Hindi ka naman mag-fofocus pag kausap mo ako eh.", chips: ["ready", "more"] },

  // ── focus:returned ────────────────────────────────────────────────
  { id: "jo-fr-1", persona: "jowa", trigger: "focus:returned", intensity: 1,
    text: "Uy, balik ka. || Focus ulit tayo ha." },
  { id: "jo-fr-2", persona: "jowa", trigger: "focus:returned", intensity: 2,
    text: "{awayMinutes} minutes kang nawala. || San ka galing?", chips: ["im-okay", "more"] },
  { id: "jo-fr-3", persona: "jowa", trigger: "focus:returned", intensity: 3,
    text: "Umalis ka nang hindi nagsasabi. || Tumatakbo pa rin timer mo ha.", chips: ["im-okay", "tired"] },

  { id: "bf-fr-1", persona: "bestfriend", trigger: "focus:returned", intensity: 1,
    text: "Balik ka rin. || Tuloy lang." },
  { id: "bf-fr-2", persona: "bestfriend", trigger: "focus:returned", intensity: 2,
    text: "{awayMinutes} minutes sa ibang tab. || Wala akong sinabi ha. Pero nakita ko.", chips: ["im-okay", "more"] },
  { id: "bf-fr-3", persona: "bestfriend", trigger: "focus:returned", intensity: 3,
    text: "Ay, nagbalik ang alibughang anak. || Tumatakbo pa rin pala timer mo nung wala ka.", chips: ["im-okay", "tired"] },

  // ── focus:long-haul (Flow only) ───────────────────────────────────
  { id: "jo-lh-1", persona: "jowa", trigger: "focus:long-haul", intensity: 2,
    text: "{minutes} minutes ka nang tuloy-tuloy. || Baka gusto mo nang huminga?" },
  { id: "jo-lh-2", persona: "jowa", trigger: "focus:long-haul", intensity: 3,
    text: "{minutes} minutes na. || Nag-aalala na ako. || Uminom ka nga ng tubig." },

  { id: "bf-lh-1", persona: "bestfriend", trigger: "focus:long-haul", intensity: 2,
    text: "{minutes} minutes. || Machine ka ba? Magpahinga ka nga." },
  { id: "bf-lh-2", persona: "bestfriend", trigger: "focus:long-haul", intensity: 3,
    text: "{minutes} minutes straight. || Hindi ito flex, kalusugan mo yan." },

  // ── cycle:complete ────────────────────────────────────────────────
  { id: "jo-cc-1", persona: "jowa", trigger: "cycle:complete", intensity: 2,
    text: "Buong set tapos na! || Grabe ka ngayon, {user}.", chips: ["thanks", "more"] },
  { id: "jo-cc-2", persona: "jowa", trigger: "cycle:complete", intensity: 3,
    text: "Tapos na buong cycle natin. || Sobrang proud ako sayo, alam mo ba yun?", chips: ["thanks", "missed-you"] },

  { id: "bf-cc-1", persona: "bestfriend", trigger: "cycle:complete", intensity: 2,
    text: "Buong set. Tapos. || Okay, respect.", chips: ["thanks", "more"] },
  { id: "bf-cc-2", persona: "bestfriend", trigger: "cycle:complete", intensity: 3,
    text: "Buong cycle na ha. || Sinong nagturo sayo mag-adult? Hindi ako.", chips: ["thanks", "more"] },

  // ── user:returned ─────────────────────────────────────────────────
  { id: "jo-ur-1", persona: "jowa", trigger: "user:returned", intensity: 2,
    text: "Uy! Balik ka rin. || {days} days kang nawala ha.", chips: ["missed-you", "im-okay"] },
  { id: "jo-ur-2", persona: "jowa", trigger: "user:returned", intensity: 3,
    text: "{days} days. || Akala ko iniwan mo na ako. || Pero okay, andito ka na.", chips: ["missed-you", "im-okay"] },
  { id: "jo-ur-3", persona: "jowa", trigger: "user:returned", intensity: 1,
    text: "Welcome back. || Simulan na natin?", chips: ["ready", "im-okay"] },

  { id: "bf-ur-1", persona: "bestfriend", trigger: "user:returned", intensity: 2,
    text: "{days} days. || Wow. Buhay ka pala.", chips: ["im-okay", "more"] },
  { id: "bf-ur-2", persona: "bestfriend", trigger: "user:returned", intensity: 3,
    text: "{days} days kang wala. || Hindi ako nagtampo ha. || ...medyo lang.", chips: ["missed-you", "im-okay"] },
  { id: "bf-ur-3", persona: "bestfriend", trigger: "user:returned", intensity: 1,
    text: "Balik ka rin. || Tara, walang tanungan.", chips: ["ready", "im-okay"] },
];

/**
 * Quick replies. Same `id` can appear twice — once per persona — and the
 * engine prefers the current persona's version, falling back to a shared one.
 */
export const CHIPS: LambingChip[] = [
  // thanks
  { id: "thanks", persona: "jowa", label: "salamat 🫶",
    responses: ["Wala yun. || Para sayo naman lahat.", "Ikaw talaga. || Basta ikaw, lagi.", "Hmp. Sige na nga."],
    followUp: ["more"] },
  { id: "thanks", persona: "bestfriend", label: "salamat bes",
    responses: ["Wow, may manners. || Sino nagturo sayo?", "Oo na. Wag mo masyadong pahalata.", "Ayieee."],
    followUp: ["more"] },

  // tired
  { id: "tired", persona: "jowa", label: "pagod na ako",
    responses: ["Alam ko. || Halika, wag muna tayo mag-isip ng kahit ano.",
      "Then rest ka. || Hindi mauubos trabaho, pero ikaw pwede.",
      "Okay lang mapagod. || Wag mo lang sarili mo pabayaan ha."],
    followUp: ["im-okay"] },
  { id: "tired", persona: "bestfriend", label: "pagod na ako",
    responses: ["Edi matulog ka. || Revolutionary advice, alam ko.",
      "Pagod ka kasi puyat ka kagabi. || Wag mo ikaila, nakita ko online ka.",
      "Sige, 5 minutes. Tapos balik tayo. || Deal?"],
    followUp: ["im-okay"] },

  // more
  { id: "more", persona: "jowa", label: "kwento pa",
    responses: ["Ano bang gusto mong marinig? || Pwede naman ako magsalita buong araw.",
      "Alam mo, tuwing nagfo-focus ka, hinihintay lang kita dito.",
      "Wala akong ibang ginagawa kundi antayin ka. || Weird ba yun?"],
    followUp: ["thanks", "im-okay"] },
  { id: "more", persona: "bestfriend", label: "kwento pa",
    responses: ["Wala akong balita. || Dito lang ako sa loob ng app mo, remember?",
      "Ikaw nga magkwento. || Ako lagi nagsasalita dito.",
      "Gusto mo ba ng advice? Kasi may advice ako. || Matulog ka nang maaga."],
    followUp: ["thanks", "im-okay"] },

  // good
  { id: "good", label: "ayos lang ako",
    responses: ["Buti naman. || Ganyan dapat.", "Yun oh. || Keep it up ha."],
    followUp: ["more"] },

  // im-okay
  { id: "im-okay", persona: "jowa", label: "okay lang ako",
    responses: ["Sigurado ka? || Sige, believe kita.", "Okay. || Pero pag hindi na, sabihin mo agad sakin."],
    followUp: ["thanks"] },
  { id: "im-okay", persona: "bestfriend", label: "okay lang ako",
    responses: ["Hmmm. || Sige, papaniwalaan kita — for now.", "Classic ka. || Basta, andito lang ako."],
    followUp: ["thanks"] },

  // im-here
  { id: "im-here", label: "andito lang ako",
    responses: ["Buti naman. || Akala ko iniwan mo na ako dito.", "Yun oh. || Sige, tuloy mo lang pahinga mo."],
    followUp: ["more"] },

  // missed-you
  { id: "missed-you", persona: "jowa", label: "miss na rin kita",
    responses: ["Talaga? || Ang sarap pakinggan niyan.", "Hala. || Sige na, magfo-focus ka na ulit mamaya ha.",
      "Alam ko naman eh. || Pero masarap pa rin marinig."],
    followUp: ["thanks"] },
  { id: "missed-you", persona: "bestfriend", label: "miss na rin kita",
    responses: ["Uy. || Hindi tayo ganyan. || ...pero sige, miss din kita.", "Ang cheesy mo ngayon ha. Ayos lang."],
    followUp: ["thanks"] },

  // ready
  { id: "ready", persona: "jowa", label: "handa na ako",
    responses: ["Ayan! || Sige, start na tayo.", "Yun oh. || Hihintayin ulit kita dito."],
    followUp: ["more"] },
  { id: "ready", persona: "bestfriend", label: "handa na ako",
    responses: ["Yun naman pala eh. || Go.", "Sige. Wag mo ako i-disappoint."],
    followUp: ["more"] },
];
