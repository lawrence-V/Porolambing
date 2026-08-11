"use client";

import { useAppStore } from "@/lib/store/useAppStore";
import type { SessionKind } from "@/lib/store/types";
import {
  earnedBreakSeconds,
  elapsedSeconds,
  flowGoal,
  formatClock,
  progress,
  remainingSeconds,
  startable,
} from "@/lib/timer/machine";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

const KIND_TABS: Array<{ kind: SessionKind; label: string }> = [
  { kind: "focus", label: "Focus" },
  { kind: "shortBreak", label: "Short" },
  { kind: "longBreak", label: "Long" },
];

/** Focus runs hot, breaks run soft. */
const KIND_TINT: Record<SessionKind, string> = {
  focus: "var(--color-orange)",
  shortBreak: "var(--color-blush)",
  longBreak: "var(--color-mint)",
};

interface TimerCardProps {
  now: number;
  className?: string;
  onOpenFlowSettings?: () => void;
}

export function TimerCard({
  now,
  className,
  onOpenFlowSettings,
}: TimerCardProps) {
  const timer = useAppStore((state) => state.timer);
  const settings = useAppStore((state) => state.settings);
  const banked = useAppStore((state) => state.bankedBreakSeconds);
  const startOrPause = useAppStore((state) => state.startOrPause);
  const reset = useAppStore((state) => state.reset);
  const skip = useAppStore((state) => state.skip);
  const switchKind = useAppStore((state) => state.switchKind);
  const updateSettings = useAppStore((state) => state.updateSettings);

  const countsUp = timer.countsUp;
  const seconds = countsUp
    ? elapsedSeconds(timer, now)
    : remainingSeconds(timer, now);
  const ratio = progress(timer, now);
  const running = timer.phase === "running";
  const tint = KIND_TINT[timer.kind];

  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  const flow = settings.timerStyle === "flow";
  /** Session controls that would discard progress are locked once running. */
  const idle = timer.phase === "idle";

  const goal = countsUp ? flowGoal(elapsedSeconds(timer, now), settings) : null;
  // Guards against a zero-length countdown, which can never finish and so
  // hangs at 00:00. Unreachable now that Flow breaks fall back to their
  // configured length, but a corrupt stored payload could still produce one.
  const canStart = startable(timer);

  return (
    <Card
      label="Timer"
      className={cn("overflow-hidden", className)}
      action={
        <span className="flex items-center gap-2">
          {/* A segmented control rather than a two-label switch: the switch
              was ambiguous about which side was active, and its knob sat 2px
              from one edge and 18px from the other. This mirrors the
              Focus/Short/Long tabs directly below it.

              Switching styles mid-session would change what the running clock
              means, so it's only offered when the timer is idle. */}
          <span
            role="group"
            aria-label="Timer style"
            className={cn(
              "flex gap-1 rounded-full border-2 border-ink p-0.5",
              !idle && "pointer-events-none opacity-50",
            )}
          >
            {(["classic", "flow"] as const).map((style) => (
              <button
                key={style}
                onClick={() => updateSettings({ timerStyle: style })}
                aria-pressed={settings.timerStyle === style}
                disabled={!idle}
                className={cn(
                  "mono-label rounded-full px-2.5 py-1 transition-colors",
                  settings.timerStyle === style
                    ? "bg-ink text-cream"
                    : "text-ink/70 hover:text-ink",
                )}
              >
                {style === "classic" ? "Classic" : "Flow"}
              </button>
            ))}
          </span>

          {flow && (
            <button
              onClick={onOpenFlowSettings}
              aria-label="Flow timer settings"
              className="grid h-7 w-7 place-items-center rounded-full text-ink/70 transition-colors hover:bg-ink/10 hover:text-ink"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
                <path
                  d="M8 10.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M13 8c0-.4 0-.7-.1-1l1.3-1-1.4-2.4-1.6.6a5 5 0 0 0-1.7-1L9.2 1.4H6.4l-.3 1.7a5 5 0 0 0-1.7 1l-1.6-.6L1.4 6l1.3 1a5.6 5.6 0 0 0 0 2l-1.3 1 1.4 2.4 1.6-.6c.5.4 1 .8 1.7 1l.3 1.7h2.8l.3-1.7c.6-.2 1.2-.6 1.7-1l1.6.6 1.4-2.4-1.3-1c.1-.3.1-.6.1-1Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </span>
      }
    >
      {/* Wash of the current state's colour behind the clock. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-28 opacity-25 blur-2xl transition-colors duration-500"
        style={{ background: tint }}
      />

      <div className="relative flex flex-col items-center">
        {/* Locked once a session is under way. `switchKind` builds a fresh
            timer state, so a stray tab click on a running session silently
            threw the elapsed time away and reset the clock to idle — which
            read as the timer simply not working. Skip or Reset first. */}
        <div
          className={cn(
            "mb-4 flex gap-1 rounded-full border-2 border-ink p-1 transition-opacity",
            !idle && "opacity-50",
          )}
          title={idle ? undefined : "Skip or reset to change session"}
        >
          {KIND_TABS.map((tab) => (
            <button
              key={tab.kind}
              onClick={() => switchKind(tab.kind)}
              disabled={!idle}
              aria-current={timer.kind === tab.kind}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
                timer.kind === tab.kind
                  ? "bg-ink text-cream"
                  : "text-ink/70 hover:text-ink",
                !idle && "cursor-not-allowed",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative grid place-items-center">
          <svg
            width={180}
            height={180}
            viewBox="0 0 128 128"
            className="-rotate-90"
            aria-hidden
          >
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="var(--color-ink)"
              strokeOpacity="0.12"
              strokeWidth="8"
            />
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke={tint}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - (goal?.progress ?? ratio))}
              style={{ transition: "stroke-dashoffset 250ms linear" }}
            />
          </svg>

          <div className="absolute inset-0 grid place-content-center text-center">
            <span
              className={cn(
                "font-display tabular text-ink",
                "text-[3.25rem]",
              )}
            >
              {formatClock(seconds)}
            </span>
            <span className="mono-label mt-1 opacity-70">
              {countsUp ? "Elapsed" : "Remaining"}
            </span>
          </div>
        </div>

        {/* Flow starts at 00:00 and climbs, which on its own looks like
            nothing is happening. Name what the session is working toward. */}
        {goal && (
          <p className="mt-3 text-center text-sm opacity-70">
            {goal.earnedMinutes > 0
              ? `${goal.earnedMinutes}m break earned · ${goal.atMinutes}m makes it ${goal.nextMinutes}m`
              : `Work ${goal.atMinutes}m to earn a ${goal.nextMinutes}m break`}
          </p>
        )}

        {/* Unreachable in normal use now that a Flow break falls back to its
            configured length — kept as a guard so a corrupt stored payload
            can't produce a dead button with no explanation. */}
        {!canStart && (
          <p className="mt-3 max-w-xs text-center text-sm opacity-70">
            This break has no length set. Check the durations in Settings.
          </p>
        )}

        {/* One obvious primary. Skip and Reset are deliberately lighter so the
            eye lands on Start rather than scanning three equal buttons. */}
        <div className="mt-5 flex items-center gap-2">
          <Button
            size="xl"
            onClick={startOrPause}
            disabled={!canStart}
            title={canStart ? undefined : "Earn some break time first"}
            className="min-w-40"
          >
            {running ? "Pause" : timer.phase === "paused" ? "Resume" : "Start"}
          </Button>
          <Button variant="outline" size="md" onClick={skip}>
            Skip
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={reset}
            aria-label="Reset timer"
          >
            Reset
          </Button>
        </div>

        <div className="mt-4 flex w-full items-center justify-between border-t-2 border-dashed border-ink/15 pt-3">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: settings.cyclesBeforeLongBreak }).map(
              (_, index) => (
                <span
                  key={index}
                  className={cn(
                    "h-2.5 w-2.5 rounded-full border-2 border-ink",
                    index < timer.cycle ? "bg-ink" : "bg-transparent",
                  )}
                />
              ),
            )}
            <span className="mono-label ml-2 opacity-70">Cycle</span>
          </div>

          {flow && (
            <span className="mono-label opacity-70">
              {/* While working, show what this session has earned so far —
                  the whole point of the mode is watching the break grow. */}
              {countsUp && timer.phase !== "idle"
                ? `Earning ${Math.round(earnedBreakSeconds(elapsedSeconds(timer, now), settings) / 60)}m`
                : `Banked ${Math.floor(banked / 60)}m`}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
