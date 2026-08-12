# Porolambing

A pomodoro timer with *lambing*. Focus runs quiet; the moment your break starts,
a companion opens a chat and checks on you.

```bash
npm run dev        # http://localhost:3000
npm test           # timer machine + lambing engine unit tests
npm run typecheck
npm run lint
npm run build
```

Two routes: `/` is the marketing page, `/app` is the product. No backend, no
accounts, no API keys — your sessions and tasks live in the browser.

The deployed site does load **Vercel Analytics** (`<Analytics />` in
`app/layout.tsx`), which counts anonymous page views. That's the only thing
that leaves the device, and the on-site copy says so rather than claiming
otherwise. Remove that one line to make it literally nothing.

---

## The lambing copy — this is the product

Every word the companion says is data, in two files:

- [`lib/lambing/lines.ts`](lib/lambing/lines.ts) — what it says *unprompted*,
  keyed by trigger.
- [`lib/lambing/intents.ts`](lib/lambing/intents.ts) — how it answers what you
  **type**, matched by keyword.

Both ship as a **draft to rewrite in your own voice**. The engine, matching,
timing and branching are finished and don't change when the words do.

**Two personas**, deliberately different characters rather than one voice with
adjectives swapped:

| | Voice |
|---|---|
| `jowa` | Soft, possessive, a little dramatic. *"Sa akin ka na muna ngayon. Wag ka na bumalik sa work."* |
| `bestfriend` | Dry, teasing, never soppy. *"Kinain mo na ba lunch mo? Hulaan ko: hindi pa."* |

A line with no `persona` is shared by both, so keep those genuinely neutral.
Adding a third is a data exercise: append to `PERSONAS` in
[`lib/lambing/types.ts`](lib/lambing/types.ts) and write its lines.

**The relationship grows with the work you've done.** `intensity` is 1 gentle ·
2 warm · 3 clingy, and `preferredIntensity` uses total completed focus sessions
as the *baseline* — under 10 → 1, 10–49 → 2, 50+ → 3 — with session length
nudging from there. The companion earns familiarity instead of being equally
needy on session one and session fifty. This used to key off a streak, which
meant one missed day reset the relationship to strangers.

**Typed messages** are matched locally, no model and no network. Keywords of
four characters or fewer match whole words only, because plain substring
matching fires `hi` inside *hindi*, *this* and *sipag* — the difference between
seeming to understand and seeming broken. Misses are common by design, so the
`FALLBACKS` pool never says "I don't understand"; it hands the turn back. Most
of the perceived quality lives in those few lines.

A line looks like this:

```ts
{
  id: "jo-bs-3",
  persona: "jowa",        // omit to share across every persona
  trigger: "break:start",
  intensity: 3,           // 1 gentle · 2 warm · 3 clingy
  text: "Sa akin ka na muna ngayon. || Wag ka na bumalik sa work.",
  chips: ["missed-you", "more"],
}
```

- `||` splits a line into consecutive bubbles, which reads far more like a
  person typing than one long paragraph.
- Slots: `{companion}` `{user}` `{minutes}` `{banked}` `{days}`
  `{awayMinutes}` `{cycles}` `{task}`. Set `requiresTask: true` on any line
  using `{task}`, or it renders a gap when nothing is active.
- `chips` are the tappable replies. They live in `CHIPS` in the same file and
  can carry a `persona` too. A reply that would leave no chips gets a default
  pair attached by the engine, so tapping can never hit a dead end.

Selection is weighted by intensity and filtered through a recently-used ring
buffer, so the same line won't repeat inside a session. Typing has its own
rhythm — a thinking pause then jittered per-bubble delays, because one fixed
formula made every message arrive like clockwork.

**Previewing lines:** [`components/app/DevTriggerPanel.tsx`](components/app/DevTriggerPanel.tsx)
fires any trigger on demand and switches persona, session total and whether a task is
set. It is **not mounted** — render `<DevTriggerPanel />` in `AppShell` for a
copy-writing session, since tuning lines is impossible if hearing one means
sitting through a real 25-minute session.

### The twelve triggers

| Trigger | Fires when |
|---|---|
| `focus:start` | a focus session begins |
| `focus:complete` | a focus session runs to zero |
| `focus:abandoned` | you skip out of a focus session early |
| `break:start` | a break session begins |
| `break:idle` | 45s into a break with no interaction |
| `break:ending` | 15s left on a break |
| `user:returned` | you open the app a day or more after last time |
| `day:first-session` | the day's first focus starts — fires *instead of* `focus:start`, never both |
| `focus:returned` | you come back to the tab after ≥2 min away mid-focus |
| `cycle:complete` | a long break finishes, so a full set of four is done |
| `focus:long-haul` | Flow-mode work crosses 30, 60 or 90 minutes |

**During focus the companion says nothing** — that's deliberate, and it holds
through a pause too, since a paused focus session is still a focus session.
The chat card switches to a waiting state: the avatar's mood shifts to `sleepy`
past 15 minutes, it breathes, and a band shows how long it has been waiting.
Silence you can feel is what makes the break reunion land.

Two exceptions, both user-initiated: `focus:returned` fires only once you've
*already* been away two minutes, and **typing always gets an answer** — the
rule is that the companion never *initiates* while you work.

### When you build your own chat engine

`LocalLambingProvider` in [`lib/lambing/engine.ts`](lib/lambing/engine.ts)
implements the `LambingProvider` interface from
[`lib/lambing/types.ts`](lib/lambing/types.ts):

```ts
respond(request): Promise<LambingReply | null>
respondToChip(chipId, request): Promise<LambingReply | null>
respondToText(text, request): Promise<LambingReply | null>
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
  lambing/    types, lines, intents, matching, engine, mood, useLambingChat
  store/      repository interface, localStorage adapter, zustand store
  notify.ts   session-end chime + browser notification
  site.ts     deployed origin (NEXT_PUBLIC_SITE_URL)
  support.ts  GCash QR path + Buy Me a Coffee link — edit these
  date.ts     shared local-day bucketing
```

**Session-end alerts** live in [`lib/notify.ts`](lib/notify.ts). The chime is
generated with WebAudio — no asset files — and the `AudioContext` is opened on
the first Start press, because browsers hand back a suspended context unless
it's created inside a user gesture. Notifications only fire when the tab is
hidden; if you're looking at the page, the chime already said it. A manual
`Skip` stays silent. Both are toggles under **Alerts** in Settings.

**The Today card is a fixed height at any number of sessions.** It used to
render a row per session inside a card that grows to fit — the `overflow-y-auto`
never fired because the grid row is `auto-rows-min`, so 17 sessions made a
624px card and a 1561px page on a 950px viewport. Now only the four most recent
are listed, with a `Show all N ▾` expander, and the expanded list is capped at
`max-h-64` so even that state can't run away.

The `sessionsOn` / `focusSeconds` / `focusCount` helpers in
[`lib/stats.ts`](lib/stats.ts) are shared by the Today card and the rail — they
previously derived "today" separately, via `toDateString()` in one place and
`dayKey` in another, which is two ways of answering the same question.

**The rail carries the companion.** Its live mood and status sit under the nav,
because the chat card can be scrolled past or hidden and the premise of the app
is that someone is waiting for you. Today's numbers sit below it, from the same
helpers the cards use. Both disappear when the rail collapses to icons.

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

`PhoneFrame` renders those cards at a real phone's **390px logical width** and
then scales the whole layer down to whatever the frame is (a ResizeObserver
keeps the factor right). The earlier approach — a `compact` prop that shrank
the ring, the buttons and the type — was squeezing a 390px layout into 276px,
so the controls overflowed and it drifted out of step every time the app's
type scale changed. Scaling can't overflow and shows the app exactly as it
looks on a phone. The scroll animation moves `[data-phone-scroll]`, which sits
*inside* the transform, so its travel distance is converted back into logical
pixels.

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

### Schema migrations

Everything persists as one blob under `porolambing:v1`, versioned by
`schemaVersion`. `migrations` in
[`lib/store/localAdapter.ts`](lib/store/localAdapter.ts) is keyed by the
version being migrated *from*; a version with no path forward resets to
defaults rather than running on a shape we can't read, so **a bump without a
matching step silently wipes real history.** `localAdapter.test.ts` guards
exactly that.

**v1 → v2** drops the dead `streak` object. `read` spreads whatever it parsed,
so without the step the removed key would ride along in every future write.

### Tasks

Marking a task active makes the timer name it, the companion mention it, and
the session log record it. The **title is the button** — the row already has a
checkbox and a remove ×. Sessions store a *copy* of the title, not a
reference: deleting a task must not blank the history of work done on it.

**The card is a fixed height at any number of tasks**, for the same reason the
Today card is: the `overflow-y-auto` never fired inside an `auto-rows-min` grid
row, so 15 tasks made a 640px card and a 1429px page on a 950px viewport. Three
things hold it now, measured at 410px with 15 tasks and 410px with 60:

- **Open tasks scroll past `max-h-56`.** Finished ones are pulled out of that
  list into a `N done ▾` section with a Clear, so the pile of things you have
  already done can't push the live list out of reach. Clear is one write via
  `clearDoneTasks`, not N calls to `removeTask`.
- **Titles clamp to two lines.** One truncated line of a long title is
  unreadable, and unbounded wrapping is what made the card grow.
- **The active task scrolls itself into view**, since a list that scrolls can
  otherwise hide the very thing you're working on.

The remove × is drawn at low opacity rather than revealed on hover: hover
doesn't exist on a touch screen, which is where a long list is worst.

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

## Sharing, installing, failing

**Search and share metadata** live in `app/layout.tsx` with
`app/opengraph-image.tsx`, `app/robots.ts` and `app/sitemap.ts`.

**The origin resolves itself.** [`lib/site.ts`](lib/site.ts) reads
`NEXT_PUBLIC_SITE_URL` first, then falls back to Vercel's own
`VERCEL_PROJECT_PRODUCTION_URL`, then to localhost. Nothing needs configuring in
the dashboard, and a preview deployment's canonical and sitemap still point at
production rather than at a URL that's gone next week. Set
`NEXT_PUBLIC_SITE_URL` when a custom domain arrives. Both are read on the
server only — `VERCEL_PROJECT_PRODUCTION_URL` has no `NEXT_PUBLIC_` prefix and
is not inlined into the client bundle, so nothing client-side may import
`siteUrl()`.

Getting this wrong is not cosmetic: `metadataBase` decides whether the OG image
is an absolute URL Messenger and Facebook can fetch, and a `sitemap.xml` full of
`http://localhost:3000` is rejected outright, because the URLs aren't on the
site's host.

### Being indexed

The head carries `alternates.canonical` — the same page is served on the
production URL *and* on every preview deployment URL, and without a canonical
they compete as duplicates — plus explicit `robots: index, follow` with
`max-image-preview: large`, which is what lets the OG image appear full size in
a result. `app/page.tsx` emits `SoftwareApplication` JSON-LD so a crawler reads
the page as a free web app rather than an article.

The `<h1>` is the wordmark `POROLAMBING`, which describes the page to nobody.
It carries an `sr-only` line restating the tagline directly below it, so the
heading says *what the page is* to a crawler and a screen reader both. `/app` is
disallowed in `robots.txt`: it's a private local workspace and every visit
renders the same empty shell.

**None of this makes Google aware the site exists.** A new `.vercel.app`
subdomain with no inbound links can go uncrawled for weeks. That part is manual:

1. Add the site to Google Search Console as a **URL-prefix** property — a
   domain property needs DNS, which a `.vercel.app` subdomain can't provide.
2. Verify by the HTML-tag method: set `GOOGLE_SITE_VERIFICATION` in Vercel to
   the token, redeploy, then press Verify. The `verification` field is dropped
   entirely when the variable is unset.
3. Submit `sitemap.xml`, then URL Inspection → **Request Indexing**.
4. Repeat at Bing Webmaster Tools, which also feeds DuckDuckGo.

Expect days to weeks, and check Search Console rather than searching Google — a
`site:` query is unreliable while a new site is still being crawled.

The OG image uses `ImageResponse`'s bundled font rather than Archivo: satori
needs font data handed to it, and an image that always renders beats one in the
right typeface. Satori also refuses any `<div>` with more than one child and no
explicit `display` — text next to an interpolation counts as two, so keep those
as single template strings.

There is no share-your-stats card. `GET /share` rendered one and was removed
along with streaks — the numbers it drew were the streak's.

**Installable.** `app/manifest.ts` opens at `/app`, not the marketing page.
`public/icon-192.png`, `public/icon-512.png` and `app/apple-icon.png` are
rendered **from** `app/icon.svg` — regenerate them if the mango changes.
`apple-icon` accepts only PNG, which is why the SVG can't serve it.

**When it breaks.** `app/error.tsx` and `app/global-error.tsx` show the
companion apologising. The error screen offers a **reset my data** escape as
well as a retry, because the likely cause is unreadable `localStorage` and a
plain reload would loop. It navigates hard rather than routing, so the corrupt
store isn't kept alive in memory.

**Accessibility note.** The settings drawer never unmounts, so it carries
`inert` when closed. Without it, its ~24 controls stay in the tab order while
the panel is off-screen — focus vanishes into something invisible, and
focusable content inside `aria-hidden` is an outright ARIA violation.

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
| `--color-yellow` | `#F7F780` | celebration, highlights |

### The app changes colour with the session

The page ground and the timer panel shift together as you move between states,
over 600ms so it reads as the room changing rather than a state flip:

| | Ground | Timer panel |
|---|---|---|
| idle | cream | **white** — colour means a session is running |
| focus | warm `#fff0e6` | `#ffe2d2` |
| short break | blush `#ffeceb` | `#ffdcd9` |
| long break | mint `#eaf5ec` | `#d8ecdb` |

Tinted, not saturated: this is a surface someone stares at for 25 minutes, and
every combination keeps ink text above **13:1** — far past the 4.5:1 minimum.
`toneFor` in [`lib/timer/tone.ts`](lib/timer/tone.ts) picks the tone, and a
paused session keeps its colour rather than falling back to idle, because you
are still in the middle of it.

**Cards have weight.** `hero` (timer, chat) get more padding and a deeper
shadow; `quiet` (tasks, week, log) step back. Six identical white
rectangles gave the timer the same presence as the log.

**Focus mode** — the expand button on the timer, or Escape to leave — drops
the grid for a full field of the session colour, the display face at
`clamp(5rem, 20vw, 16rem)`, and the mango large enough to read as a character.
It's where the landing page's boldness actually lands inside the app.

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
