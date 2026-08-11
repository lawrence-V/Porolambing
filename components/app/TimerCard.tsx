"use client";

import { useAppStore } from "@/lib/store/useAppStore";
import type { SessionKind } from "@/lib/store/types";
import {
  earnedBreakSeconds,
  elapsedSeconds,
  formatClock,
  progress,
  remainingSeconds,
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
  /** Tighter type and controls, for the phone mockup and small screens. */
  compact?: boolean;
  className?: string;
  onOpenFlowSettings?: () => void;
}

export function TimerCard({
  now,
  compact = false,
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
              timer.phase !== "idle" && "pointer-events-none opacity-50",
            )}
          >
            {(["classic", "flow"] as const).map((style) => (
              <button
                key={style}
                onClick={() => updateSettings({ timerStyle: style })}
                aria-pressed={settings.timerStyle === style}
                disabled={timer.phase !== "idle"}
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
        <div className="mb-4 flex gap-1 rounded-full border-2 border-ink p-1">
          {KIND_TABS.map((tab) => (
            <button
              key={tab.kind}
              onClick={() => switchKind(tab.kind)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
                timer.kind === tab.kind
                  ? "bg-ink text-cream"
                  : "text-ink/70 hover:text-ink",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative grid place-items-center">
          <svg
            width={compact ? 160 : 180}
            height={compact ? 160 : 180}
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
              strokeDashoffset={circumference * (1 - ratio)}
              style={{ transition: "stroke-dashoffset 250ms linear" }}
            />
          </svg>

          <div className="absolute inset-0 grid place-content-center text-center">
            <span
              className={cn(
                "font-display tabular text-ink",
                compact ? "text-[2.75rem]" : "text-[3.25rem]",
              )}
            >
              {formatClock(seconds)}
            </span>
            <span className="mono-label mt-1 opacity-70">
              {countsUp ? "Elapsed" : "Remaining"}
            </span>
          </div>
        </div>

        {/* One obvious primary. Skip and Reset are deliberately lighter so the
            eye lands on Start rather than scanning three equal buttons. */}
        <div className="mt-5 flex items-center gap-2">
          <Button
            size={compact ? "lg" : "xl"}
            onClick={startOrPause}
            className={compact ? "min-w-32" : "min-w-40"}
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
