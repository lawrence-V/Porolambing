import type { ReactNode } from "react";

/** Flat black line art, in the spirit of the wimpdecaf.com doodles. */
function ChatDoodle() {
  return (
    <svg viewBox="0 0 80 64" className="h-20 w-20" aria-hidden>
      <path
        d="M8 10h50a6 6 0 0 1 6 6v22a6 6 0 0 1-6 6H30l-14 11V44H8a6 6 0 0 1-6-6V16a6 6 0 0 1 6-6Z"
        fill="var(--color-blush)"
        stroke="var(--color-ink)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="22" cy="27" r="3" fill="var(--color-ink)" />
      <circle cx="34" cy="27" r="3" fill="var(--color-ink)" />
      <circle cx="46" cy="27" r="3" fill="var(--color-ink)" />
    </svg>
  );
}

function BankDoodle() {
  return (
    <svg viewBox="0 0 80 64" className="h-20 w-20" aria-hidden>
      <rect
        x="10"
        y="20"
        width="56"
        height="34"
        rx="6"
        fill="var(--color-yellow)"
        stroke="var(--color-ink)"
        strokeWidth="3"
      />
      <path
        d="M24 20v-6a14 14 0 0 1 28 0v6"
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="38" cy="36" r="5" fill="none" stroke="var(--color-ink)" strokeWidth="3" />
      <path d="M38 41v6" stroke="var(--color-ink)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function GridDoodle() {
  return (
    <svg viewBox="0 0 80 64" className="h-20 w-20" aria-hidden>
      <rect x="6" y="8" width="30" height="30" rx="5" fill="var(--color-mint)" stroke="var(--color-ink)" strokeWidth="3" />
      <rect x="42" y="8" width="30" height="16" rx="5" fill="var(--color-orange)" stroke="var(--color-ink)" strokeWidth="3" />
      <rect x="42" y="28" width="30" height="28" rx="5" fill="var(--color-cream)" stroke="var(--color-ink)" strokeWidth="3" />
      <rect x="6" y="42" width="30" height="14" rx="5" fill="var(--color-cream)" stroke="var(--color-ink)" strokeWidth="3" />
    </svg>
  );
}

function LocalDoodle() {
  return (
    <svg viewBox="0 0 80 64" className="h-20 w-20" aria-hidden>
      <path
        d="M40 8 12 20v14c0 13 12 22 28 26 16-4 28-13 28-26V20L40 8Z"
        fill="var(--color-mint-cool)"
        stroke="var(--color-ink)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M29 33l8 8 15-16"
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const FEATURES: Array<{
  label: string;
  title: string;
  body: string;
  art: ReactNode;
}> = [
  {
    label: "01 — The catch",
    title: "Lambing on every break",
    body: "The timer finishes and a chat opens. It reacts to what you actually did: how long you focused, whether you bailed early, how long you've been away. Tap a reply and it answers back.",
    art: <ChatDoodle />,
  },
  {
    label: "02 — Flow mode",
    title: "Earn your break",
    body: "Flip the timer around. Work counts up instead of down, and the longer you go the bigger the break you unlock. Nothing is handed to you.",
    art: <BankDoodle />,
  },
  {
    label: "03 — Your layout",
    title: "Drag the whole thing around",
    body: "Timer, chat, tasks, your week and today's log are cards on a grid. Drag them into whatever order suits you and it stays that way.",
    art: <GridDoodle />,
  },
  {
    label: "04 — No account",
    title: "Everything stays on your device",
    body: "No signup, no email, no ads. Your sessions and tasks live in your browser and nowhere else — the site only counts anonymous page visits.",
    art: <LocalDoodle />,
  },
];

export function Features() {
  return (
    <section className="bg-cream px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-[clamp(2.5rem,8vw,6rem)]">
            WHAT IT
            <br />
            ACTUALLY DOES
          </h2>
          <span className="mono-label mono-label-xs max-w-48 leading-relaxed opacity-60">
            Four things.
            <br />
            That’s the whole app.
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {FEATURES.map((feature) => (
            <article
              key={feature.label}
              className="flex flex-col rounded-3xl border-2 border-ink bg-white p-7 shadow-[4px_4px_0_0_var(--color-ink)]"
            >
              <span className="mono-label mono-label-xs opacity-50">{feature.label}</span>
              <div className="my-5">{feature.art}</div>
              <h3 className="font-display-wide text-3xl">{feature.title}</h3>
              <p className="mt-3 text-base opacity-80">{feature.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
