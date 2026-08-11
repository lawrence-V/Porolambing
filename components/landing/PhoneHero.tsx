"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LambingChatCard } from "@/components/app/LambingChatCard";
import { TimerCard } from "@/components/app/TimerCard";
import { useAppStore } from "@/lib/store/useAppStore";
import type { SessionKind } from "@/lib/store/types";
import { emitLambingEvent } from "@/lib/timer/events";
import { useTimerTick } from "@/lib/timer/useTimer";
import { PhoneFrame } from "./PhoneFrame";

interface DemoControls {
  startOrPause: () => void;
  switchKind: (kind: SessionKind) => void;
}

/**
 * Scroll progress at which each beat fires. The break beat switches the timer
 * for real rather than just announcing one, so the clock on screen and what
 * the companion is saying never contradict each other. Nothing here writes to
 * storage — no session is ever logged from the landing page.
 */
const BEATS: Array<{ at: number; run: (controls: DemoControls) => void }> = [
  { at: 0.08, run: ({ startOrPause }) => startOrPause() },
  {
    at: 0.45,
    run: ({ switchKind, startOrPause }) => {
      switchKind("shortBreak");
      // Starting a break session is what emits `break:start`.
      startOrPause();
    },
  },
  { at: 0.78, run: () => emitLambingEvent("break:idle", {}) },
];

/**
 * The tinker.com/ph move: a phone on a desk with the product actually running
 * inside it. These are the same `TimerCard` and `LambingChatCard` the app
 * renders — not screenshots — so the demo can't drift from the real thing.
 */
export function PhoneHero() {
  const section = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const now = useTimerTick();
  const startOrPause = useAppStore((state) => state.startOrPause);
  const switchKind = useAppStore((state) => state.switchKind);
  const reset = useAppStore((state) => state.reset);

  // The demo drives the real store, so leaving the page must not strand the
  // visitor with a half-run session when they open the app.
  useEffect(() => reset, [reset]);

  useEffect(() => {
    const root = section.current;
    const inner = screen.current;
    if (!root || !inner) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const fired = new Set<number>();

    const context = gsap.context(() => {
      const overflow = Math.max(0, inner.scrollHeight - inner.clientHeight);

      const trigger = ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "+=220%",
        pin: true,
        scrub: 0.6,
        onUpdate: (self) => {
          // Scroll the app UI inside the screen.
          gsap.set(inner.firstElementChild, {
            y: -overflow * self.progress,
          });

          BEATS.forEach((beat, index) => {
            if (self.progress >= beat.at && !fired.has(index)) {
              fired.add(index);
              beat.run({ startOrPause, switchKind });
            }
          });
        },
      });

      return () => trigger.kill();
    }, root);

    return () => context.revert();
  }, [startOrPause, switchKind]);

  return (
    <section
      ref={section}
      className="relative flex min-h-screen items-center overflow-hidden bg-mint-cool"
    >
      {/* cutting-mat desk surface */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div
        aria-hidden
        className="absolute -right-24 top-1/4 h-64 w-64 rotate-12 rounded-3xl bg-yellow/70"
      />
      <div
        aria-hidden
        className="absolute -left-16 bottom-10 h-52 w-52 -rotate-6 rounded-3xl bg-blush/70"
      />

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-5 py-16 lg:grid-cols-2">
        <div>
          <span className="mono-label mono-label-xs opacity-60">The app</span>
          <h2 className="font-display mt-3 text-[clamp(2.5rem,7vw,5rem)]">
            IT TALKS
            <br />
            TO YOU.
          </h2>
          <p className="mt-5 max-w-md text-lg">
            Focus runs quiet. The second your break starts, someone opens a
            chat and checks on you — asks how it went, tells you to drink
            water, complains that you were gone too long.
          </p>
          <p className="mono-label mono-label-xs mt-6 opacity-60">
            Scroll to watch a session →
          </p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <PhoneFrame>
            <div ref={screen} className="h-full overflow-hidden">
              <div className="space-y-3 p-3">
                <TimerCard now={now} compact />
                <LambingChatCard now={now} compact />
              </div>
            </div>
          </PhoneFrame>
        </div>
      </div>
    </section>
  );
}
