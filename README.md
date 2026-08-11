# Porolambing

A pomodoro timer with *lambing*. Focus runs quiet; the moment your break starts,
a companion opens a chat and checks on you.

```bash
npm run dev        # http://localhost:3000
npm test           # timer machine unit tests
npm run typecheck
npm run lint
npm run build
```

Two routes: `/` is the marketing page, `/app` is the product. No backend, no
accounts, no API keys — your sessions, tasks and streaks live in the browser.

The deployed site does load **Vercel Analytics** (`<Analytics />` in
`app/layout.tsx`), which counts anonymous page views. That's the only thing
that leaves the device, and the on-site copy says so rather than claiming
otherwise. Remove that one line to make it literally nothing.

---

## Writing the lambing copy

**This is the next job, and it is entirely a data edit.** Every line the
companion says lives in [`lib/lambing/lines.ts`](lib/lambing/lines.ts). What
ships today is placeholder Taglish so that no trigger is ever silent; the
engine, timing, and chip branching around it are the real work and don't need
to change when you rewrite the words.

A line looks like this:

```ts
{
  id: "bs-4",
  trigger: "break:start",
  intensity: 3,          // 1 gentle · 2 warm · 3 clingy
  text: "Ang tagal mong nag-focus ha. || Sa akin ka muna ngayon.",
  chips: ["missed-you", "more"],
}
```

- `||` splits a line into consecutive bubbles, which reads far more like a
  person typing than one long paragraph.
- Slots: `{companion}` `{user}` `{minutes}` `{streak}` `{banked}` `{days}`
  `{awayMinutes}` `{cycles}`.
- `intensity` is how needy the line is. The engine picks based on context — a
  5-minute break gets a gentle nudge, forty minutes of focus or a three-day
  absence unlocks the dramatic reunion.
- `chips` are the tappable replies offered after the line. Chips and their
  responses live in the `CHIPS` map in the same file; each can offer a
  `followUp` for a second conversational beat.

Selection is weighted by intensity and filtered through a recently-used ring
buffer, so the same line won't repeat inside a session.

**Previewing lines:** there is no preview panel — an earlier dev-only
"Triggers" button was removed. To tune copy without sitting through real
sessions, call `emitLambingEvent("break:start", { minutes: 5 })` from the
browser console after importing it, or re-add a small panel that maps each
trigger in [`lib/timer/events.ts`](lib/timer/events.ts) to a button.

### The twelve triggers

| Trigger | Fires when |
|---|---|
| `focus:start` | a focus session begins |
| `focus:complete` | a focus session runs to zero |
| `focus:abandoned` | you skip out of a focus session early |
| `break:start` | a break session begins |
| `break:idle` | 45s into a break with no interaction |
| `break:ending` | 15s left on a break |
| `streak:milestone` | the streak hits 3, 7, 14, 30, 50 or 100 days |
| `user:returned` | you open the app a day or more after last time |
| `day:first-session` | the day's first focus starts — fires *instead of* `focus:start`, never both |
| `focus:returned` | you come back to the tab after ≥2 min away mid-focus |
| `cycle:complete` | a long break finishes, so a full set of four is done |
| `focus:long-haul` | Flow-mode work crosses 30, 60 or 90 minutes |

**During focus the companion says nothing** — that's deliberate. Instead the
chat card switches to a waiting state: the avatar's mood shifts to `sleepy`
past 15 minutes, it breathes, and a band shows how long it has been waiting.
Silence you can feel is what makes the break reunion land. The one exception is
`focus:returned`, which only fires once you've *already* been away two minutes.

### When you build your own chat engine

`LocalLambingProvider` in [`lib/lambing/engine.ts`](lib/lambing/engine.ts)
implements the `LambingProvider` interface from
[`lib/lambing/types.ts`](lib/lambing/types.ts):

```ts
respond(request): Promise<LambingReply | null>
respondToChip(chipId, request): Promise<LambingReply | null>
```

Write a second implementation, construct it instead in
[`lib/lambing/useLambingChat.ts`](lib/lambing/useLambingChat.ts), and nothing
in the UI changes.

---

## How it's put together

```
app/          layout, fonts, globals, / and /app
components/
  landing/    Intro, Hero, PhoneHero, Features, Marquee, Footer
  app/        BentoGrid, TimerCard, LambingChatCard, WeekCard, MiniTimer,
              FlowSettingsModal, SupportModal, SettingsDrawer, SideNav, …
  ui/         Card, Button, button styles
lib/
  timer/      machine (pure), useTimer (ticking), events (the bus)
  lambing/    types, lines, engine, mood, useLambingChat
  store/      repository interface, localStorage adapter, zustand store
  notify.ts   session-end chime + browser notification
  support.ts  GCash QR path + Buy Me a Coffee link — edit these
  date.ts     shared local-day bucketing
```

**Session-end alerts** live in [`lib/notify.ts`](lib/notify.ts). The chime is
generated with WebAudio — no asset files — and the `AudioContext` is opened on
the first Start press, because browsers hand back a suspended context unless
it's created inside a user gesture. Notifications only fire when the tab is
hidden; if you're looking at the page, the chime already said it. A manual
`Skip` stays silent. Both are toggles under **Alerts** in Settings.

**The week chart** uses a single hue, `--color-green-deep`, because it's one
series — and because that's the one green step clearing 3:1 against a white
card. Today is marked with an ink ring and a bold label, never a second colour:
the brand green against the orange accent measures ΔE 2.1 under protanopia,
i.e. identical to a red-green colourblind reader.

**The timer** is a pure state machine in
[`lib/timer/machine.ts`](lib/timer/machine.ts), driven by wall-clock
timestamps rather than an accumulating counter. Intervals are throttled or
stopped entirely in a backgrounded tab, so anything that counts up drifts;
subtracting timestamps doesn't. `npm test` covers this.

**The timer never talks to the chat.** It announces what happened on the event
bus in [`lib/timer/events.ts`](lib/timer/events.ts); the chat decides how to
feel about it.

**Every read and write goes through** the `Repository` interface in
[`lib/store/repository.ts`](lib/store/repository.ts). No component touches
`localStorage` directly, so adding cross-device sync later means writing one
new adapter and changing the single line in `getRepository()`.

**The phone on the landing page renders the real `TimerCard` and
`LambingChatCard`**, not screenshots, so the demo can't drift from the product.
Scrolling drives a real session through it. Nothing there is ever written to
storage.

### Flow mode

Classic counts a fixed session down. Flow counts work *up* to a **max work
time**, and the break you earn is decided by which **band** the session landed
in — so the reward steps up in chunks rather than creeping.

`maxWorkMinutes` is split into as many equal bands as there are entries in
`breakTiers`, except the first, which only opens at 5 minutes. At the defaults
(60-minute max, tiers `[5,10,15,20,25]`):

| Work | Break earned |
|---|---|
| under 5 min | nothing |
| 5–12 | 5 min |
| 13–24 | 10 min |
| 25–36 | 15 min |
| 37–48 | 20 min |
| 49–60 | 25 min |

Change the max and the bands follow it — a 120-minute cap gives 5–24, 25–48,
49–72, 73–96, 97–120. Both live in **Flow Timer Settings**, reachable from
the gear beside the Classic/Flow control on the timer card. Breaks then spend
the bank down. `breakTierBands` and `earnedBreakSeconds` in
[`lib/timer/machine.ts`](lib/timer/machine.ts) own this, and `npm test` covers
the ladder, the floor and the clamp.

Two things Flow needs that Classic doesn't, both covered by tests:

- **The configured break is a floor; the bank raises it.** With 15 minutes
  banked a short break runs 15 minutes, with nothing banked it still runs the
  configured 5. Making the bank the *only* source meant an empty bank left you
  unable to take any break at all — a bad trade in an app about looking after
  yourself, and it stranded anyone who reset a session before earning
  anything. `startable()` and `isExpired()` still guard against a zero-length
  countdown, which can never finish and would hang at `00:00`, but nothing in
  the UI can reach that now.
- **The ring tracks the next break band, not the hour.** Against a 60-minute
  cap it advanced 1/3600th per second and looked frozen, which reads as a
  broken timer. `flowGoal()` measures against the next band instead, so it
  fills in minutes.

Flow was called "Reverse" until it was renamed. Settings saved under the old
name are migrated on read by `normalizeSettings` in
[`lib/store/types.ts`](lib/store/types.ts) — there is no schema bump, and
`npm test` covers the migration.

### Cards

Cards can be reordered by dragging their **grip or label**, and hidden with the
× on the card or the toggles under **Settings → Cards**.

Hidden cards live in `hiddenCards`, *not* by removing them from `layout`.
`reconcileLayout` appends any default card a saved layout is missing — that's
what lets a newly built card reach existing users, and it would resurrect a
hidden card on the next load. `npm test` covers that specific regression.

### Toggles worth knowing

- **Mini timer** — a draggable pill that keeps the clock visible while you
  scroll. Deliberately *not* the Document Picture-in-Picture API, which only
  exists in Chrome and Edge. Drag it by the body; the controls stop it.
- **Sidebar collapse** — narrows the rail to icons; persists like the layout.
- **Control sounds** — separate from the end-of-session chime, because
  wanting the alarm without click feedback is a different preference.

Anything draggable carries `touch-action: none`. Without it the browser takes
the gesture for scrolling and the drag never starts on a touch device.

**Focus / Short / Long are locked while a session runs.** `switchKind` builds a
fresh timer state, so a stray tab click used to throw the elapsed time away and
drop the clock back to idle — which read as the timer simply not working. Skip
or Reset first. The Classic/Flow control is locked for the same reason.

### The companion

A mango, not a tomato — a tilted golden oval with the leaf on the narrow end.
The tilt matters: drawn as a circle it reads as an orange. `CompanionAvatar`
carries the detailed version (cheeks, moods) and `app/icon.svg` a heavier one
drawn specifically for 16px; the two intentionally diverge. Both use the
`--color-mango` tokens in `app/globals.css`.
- **Classic/Flow** — a segmented control on the timer card, disabled while a session is running
  because switching would change what the running clock means.

## Support links

**Currently hidden.** `SHOW_SUPPORT` in
[`components/app/SideNav.tsx`](components/app/SideNav.tsx) is `false`, so the
nav entries don't render. The modal, the GCash panel and the links below are
all still wired up — flip that one constant to bring it back.

[`lib/support.ts`](lib/support.ts) holds the two things to edit:

1. **Buy Me a Coffee** — replace the handle in `SUPPORT_LINKS`.
2. **GCash QR** — save a screenshot of your QR to `public/gcash-qr.png`. The
   dialog picks it up automatically; until the file is there it shows a
   placeholder saying exactly that, and the browser logs one benign 404 for the
   missing image. Nothing else needs changing and the image is served from your
   own deployment, never a third party.

---

## Design

The palette, type, and motion come from reference sites, with one deliberate
twist: **focus states run hot, break states run soft**, because the softness
during breaks is the whole point.

| Token | | Used for |
|---|---|---|
| `--color-ink` | `#1D1C1B` | all text |
| `--color-cream` | `#FFFDEB` | page ground |
| `--color-green` | `#5EA85E` | brand |
| `--color-orange` | `#FF8356` | focus, CTAs |
| `--color-blush` | `#FFBAB4` | short break |
| `--color-mint` | `#B6DEB9` | long break |
| `--color-yellow` | `#F7F780` | streaks, celebration |

Nothing in `/app` renders below 12px, and no text sits under 70% opacity —
ink at 50% over white computes to about 3.5:1, under the 4.5:1 WCAG AA
minimum for normal text. `.mono-label` is 13px in the app; the landing page
adds `.mono-label-xs` to keep its corner labels as hairline texture.

Type is set in [`app/fonts.ts`](app/fonts.ts): Archivo driven to a heavy
condensed width for display, Instrument Sans for body, JetBrains Mono for the
corner micro-labels. These are free stand-ins for licensed faces (Obviously,
Elza Text) — swapping in the real ones only touches that file.

GSAP + Lenis handle the intro sequence and the scroll-driven phone. Everything
honours `prefers-reduced-motion`: the intro collapses to a fade and the pinned
section doesn't pin.
