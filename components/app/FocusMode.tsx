"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import { moodFor } from "@/lib/lambing/mood";
import {
  elapsedSeconds,
  flowGoal,
  formatClock,
  remainingSeconds,
} from "@/lib/timer/machine";
import { GROUND, TONE_LABEL, toneFor } from "@/lib/timer/tone";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { CompanionAvatar } from "./CompanionAvatar";
import { PauseIcon, PlayIcon, SkipIcon } from "./TimerIcons";

/**
 * The whole screen, one clock, nothing else.
 *
 * This is where the landing page's boldness actually lands: the display face
 * at the size it wants to be, a full field of the session's colour, and the
 * companion big enough to read as a character rather than a favicon.
 */
export function FocusMode({
  now,
  open,
  onClose,
}: {
  now: number;
  open: boolean;
  onClose: () => void;
}) {
  const timer = useAppStore((state) => state.timer);
  const settings = useAppStore((state) => state.settings);
  const startOrPause = useAppStore((state) => state.startOrPause);
  const skip = useAppStore((state) => state.skip);
  const activeTask = useAppStore((state) => state.activeTask());

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  const elapsed = elapsedSeconds(timer, now);
  const seconds = timer.countsUp ? elapsed : remainingSeconds(timer, now);
  const tone = toneFor(timer.kind, timer.phase);
  const running = timer.phase === "running";
  const focusing = timer.kind === "focus" && timer.phase !== "idle";
  const goal = timer.countsUp ? flowGoal(elapsed, settings) : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Focus mode"
      style={{ background: GROUND[tone] }}
      className="fixed inset-0 z-70 flex flex-col transition-[background] duration-[600ms]"
    >
      <header className="flex items-start justify-between p-6">
        <span className="mono-label opacity-70">{TONE_LABEL[tone]}</span>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Exit focus mode">
          Exit ✕
        </Button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-16 text-center">
        <CompanionAvatar
          className="mb-8 h-24 w-24 sm:h-32 sm:w-32"
          mood={moodFor(timer.kind, timer.phase, elapsed)}
          style={
            focusing
              ? { animation: "breathe 3.4s ease-in-out infinite" }
              : undefined
          }
        />

        <span className="font-display tabular leading-[0.85] text-[clamp(5rem,20vw,16rem)]">
          {formatClock(seconds)}
        </span>

        <span className="mono-label mt-4 opacity-70">
          {timer.countsUp ? "Elapsed" : "Remaining"}
        </span>

        {activeTask && timer.kind === "focus" && (
          <p className="mt-6 max-w-md truncate text-lg">
            Working on <strong className="font-semibold">{activeTask.title}</strong>
          </p>
        )}

        {goal && (
          <p className="mt-2 text-base opacity-70">
            {goal.earnedMinutes > 0
              ? `${goal.earnedMinutes}m break earned`
              : `Work ${goal.atMinutes}m to earn a ${goal.nextMinutes}m break`}
          </p>
        )}

        {focusing && (
          <p className="mt-8 text-base italic opacity-70">
            Naghihintay lang ako dito…
          </p>
        )}

        <div className={cn("mt-10 flex items-center gap-3")}>
          <Button size="xl" onClick={startOrPause} className="min-w-44">
            {running ? <PauseIcon /> : <PlayIcon />}
            {running ? "Pause" : timer.phase === "paused" ? "Resume" : "Start"}
          </Button>
          <Button variant="outline" size="lg" onClick={skip}>
            <SkipIcon />
            Skip
          </Button>
        </div>
      </main>
    </div>
  );
}
