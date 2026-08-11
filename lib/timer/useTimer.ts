"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import { emitLambingEvent } from "./events";
import {
  elapsedSeconds,
  formatClock,
  isExpired,
  KIND_LABEL,
  remainingSeconds,
} from "./machine";

/** Seconds of silence during a break before the companion pokes you. */
const IDLE_AFTER = 45;

/** Seconds left in a break when the wind-down line fires. */
const ENDING_AT = 15;

/**
 * How long the tab must be hidden mid-focus before the companion says
 * anything on your return. Two minutes is long enough that you had already
 * stopped concentrating, so the line isn't the thing that broke your flow.
 */
const AWAY_BEFORE_NOTICING = 2 * 60 * 1000;

/** Flow-mode focus milestones, in seconds. */
const LONG_HAUL_MARKS = [30 * 60, 60 * 60, 90 * 60];

/**
 * Drives re-renders and side effects off the wall clock. The interval only
 * decides *when we look*; the displayed value always comes from subtracting
 * timestamps, so a throttled or suspended background tab can't cause drift.
 */
export function useTimerTick(): number {
  const [now, setNow] = useState(0);
  const timer = useAppStore((state) => state.timer);
  const finish = useAppStore((state) => state.finish);

  const firedEnding = useRef<string | null>(null);
  const firedIdle = useRef<string | null>(null);
  const firedLongHaul = useRef<string>("");
  const lastInteraction = useRef(0);
  const hiddenSince = useRef<number | null>(null);

  // Any sign of life resets the idle nudge.
  useEffect(() => {
    const touch = () => {
      lastInteraction.current = Date.now();
    };
    touch();
    const events = ["pointerdown", "keydown", "wheel"] as const;
    for (const event of events) {
      window.addEventListener(event, touch, { passive: true });
    }
    return () => {
      for (const event of events) window.removeEventListener(event, touch);
    };
  }, []);

  useEffect(() => {
    // While paused or idle the readout comes from the banked `accumulatedMs`
    // and never consults `now`, so there is nothing to refresh here.
    if (timer.phase !== "running") return;

    const tick = () => {
      const current = Date.now();
      setNow(current);

      if (isExpired(timer, current)) {
        finish({ completed: true });
        return;
      }

      const sessionKey = `${timer.kind}-${timer.sessionStartedAt ?? 0}`;
      const isBreak = timer.kind !== "focus";

      if (
        isBreak &&
        timer.targetSeconds > 0 &&
        remainingSeconds(timer, current) <= ENDING_AT &&
        firedEnding.current !== sessionKey
      ) {
        firedEnding.current = sessionKey;
        emitLambingEvent("break:ending", { kind: timer.kind });
      }

      if (
        isBreak &&
        firedIdle.current !== sessionKey &&
        elapsedSeconds(timer, current) >= IDLE_AFTER &&
        current - lastInteraction.current >= IDLE_AFTER * 1000
      ) {
        firedIdle.current = sessionKey;
        emitLambingEvent("break:idle", { kind: timer.kind });
      }

      // Flow-mode focus can run for an hour with nothing else to say.
      if (!isBreak && timer.countsUp) {
        const elapsed = elapsedSeconds(timer, current);
        const mark = LONG_HAUL_MARKS.filter((value) => elapsed >= value).pop();
        const key = `${sessionKey}-${mark}`;
        if (mark && firedLongHaul.current !== key) {
          firedLongHaul.current = key;
          emitLambingEvent("focus:long-haul", {
            minutes: Math.round(mark / 60),
            kind: "focus",
          });
        }
      }
    };

    tick();
    const id = window.setInterval(tick, 250);

    // A backgrounded tab may not run the interval at all; re-check the instant
    // it comes back so an expiry that happened while away resolves right away.
    const onVisible = () => {
      if (document.visibilityState === "hidden") {
        hiddenSince.current = Date.now();
        return;
      }

      const awayMs = hiddenSince.current
        ? Date.now() - hiddenSince.current
        : 0;
      hiddenSince.current = null;
      tick();

      if (
        timer.kind === "focus" &&
        timer.phase === "running" &&
        awayMs >= AWAY_BEFORE_NOTICING
      ) {
        emitLambingEvent("focus:returned", {
          awayMinutes: Math.round(awayMs / 60_000),
          kind: "focus",
        });
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [timer, finish]);

  return now;
}

/** Mirrors the countdown into the tab title. */
export function useDocumentTitle(now: number): void {
  const timer = useAppStore((state) => state.timer);

  useEffect(() => {
    const base = "Porolambing";
    if (timer.phase === "idle") {
      document.title = `${base} — the pomodoro that misses you`;
      return;
    }
    const seconds = timer.countsUp
      ? elapsedSeconds(timer, now)
      : remainingSeconds(timer, now);
    const paused = timer.phase === "paused" ? "⏸ " : "";
    document.title = `${paused}${formatClock(seconds)} · ${KIND_LABEL[timer.kind]} — ${base}`;
  }, [timer, now]);
}
