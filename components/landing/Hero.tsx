"use client";

import Link from "next/link";
import { CompanionAvatar } from "@/components/app/CompanionAvatar";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { LiveClock } from "./LiveClock";
import { SlotWord } from "./SlotWord";

/**
 * The juice.agency hero, restated: a saturated field of one colour, the
 * wordmark set enormous in cream, and a single oversized illustrated object
 * crossing in front of the type.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-green px-5 py-5 text-ink">
      <div className="flex items-start justify-between">
        <span className="flex items-center gap-2">
          <CompanionAvatar className="h-9 w-9" />
        </span>
        <span className="mono-label mono-label-xs max-w-40 text-right leading-relaxed opacity-80">
          A pomodoro timer
          <br />
          with lambing
        </span>
      </div>

      <div className="relative flex flex-1 flex-col justify-center pt-2 sm:pt-6">
        {/* The clamp floor has to stay small: at 11 condensed characters, any
            floor above ~13vw overflows a 390px screen. */}
        <h1 className="font-display w-full text-center text-cream leading-[0.82] text-[clamp(2rem,13.5vw,16rem)]">
          POROLAMBING
        </h1>

        {/* One oversized object crossing in front of the type, the way Juice's
            basketball does. The pull-up is in `vw` like the type itself, so
            the overlap stays proportional at every width instead of drifting. */}
        <div
          aria-hidden
          className="pointer-events-none relative mx-auto mt-[-5vw] w-[24vw] min-w-32 max-w-72"
          style={{ animation: "float-soft 6s ease-in-out infinite" }}
        >
          <CompanionAvatar
            className="h-full w-full drop-shadow-[0_16px_0_rgba(29,28,27,0.14)]"
            mood="sweet"
          />
        </div>

        {/* Tagline and CTA sit on the centre line, directly under the
            wordmark, so the whole hero reads as one stacked column. */}
        <div className="mt-8 flex flex-col items-center gap-5 text-center sm:mt-10">
          <p className="font-display-wide text-2xl sm:text-3xl">
            The pomodoro timer that
            <br />
            actually{" "}
            <SlotWord
              words={["misses you.", "checks on you.", "waits for you."]}
              className="text-cream"
            />
          </p>

          {/* Cream on green is the highest-separation pairing in the palette;
              ink here would read as more body text. */}
          <div className="flex flex-col items-center gap-3">
            <Link href="/app" className={buttonClasses("cream", "xl", "group")}>
              Start focusing
              <span
                aria-hidden
                className="transition-transform duration-200 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
            <span className="mono-label mono-label-xs opacity-70">
              No signup · Saved on your device
            </span>
          </div>
        </div>
      </div>

      {/* The bottom band keeps only the corner labels — that framing is what
          makes the Juice layout read the way it does. */}
      <div className="relative flex items-end justify-between gap-8">
        <span className="mono-label mono-label-xs opacity-70">
          <LiveClock />
        </span>
        <span className="mono-label mono-label-xs max-w-40 text-right leading-relaxed opacity-70">
          Focus in peace.
          <br />
          Get lambing on break.
        </span>
      </div>
    </section>
  );
}
