import type { SessionKind, Settings, TimerStyle } from "@/lib/store/types";

/**
 * Work shorter than this earns no break at all — a two-minute session
 * shouldn't buy one.
 */
export const MIN_WORK_MINUTES_TO_EARN = 5;

export type Phase = "idle" | "running" | "paused" | "completed";

export interface TimerState {
  kind: SessionKind;
  style: TimerStyle;
  phase: Phase;
  /**
   * Whether the readout counts up instead of down. Flow-mode focus still
   * has a `targetSeconds` — the max work time it stops at — so this can't be
   * inferred from the target being zero.
   */
  countsUp: boolean;
  /** Length in seconds. 0 means there is no limit at all. */
  targetSeconds: number;
  /** epoch ms the current running segment began, null when not running. */
  startedAt: number | null;
  /** ms banked from previous running segments of this session. */
  accumulatedMs: number;
  /** epoch ms the session first started, for the log record. */
  sessionStartedAt: number | null;
  /** Focus sessions finished since the last long break. */
  cycle: number;
}

/**
 * Elapsed time is always derived from the wall clock rather than counted up by
 * an interval. Intervals are throttled to ~1/sec (or stopped entirely) in a
 * backgrounded tab, so a counter would drift; subtracting timestamps does not.
 */
export function elapsedMs(state: TimerState, now: number): number {
  const live =
    state.phase === "running" && state.startedAt !== null
      ? now - state.startedAt
      : 0;
  return state.accumulatedMs + Math.max(0, live);
}

export function elapsedSeconds(state: TimerState, now: number): number {
  return Math.floor(elapsedMs(state, now) / 1000);
}

/** Seconds left on a countdown, clamped at 0. Always 0 for open-ended runs. */
export function remainingSeconds(state: TimerState, now: number): number {
  if (state.targetSeconds <= 0) return 0;
  return Math.max(0, state.targetSeconds - elapsedSeconds(state, now));
}

/** 0..1 for the progress ring. Truly open-ended runs loop every 60s. */
export function progress(state: TimerState, now: number): number {
  const elapsed = elapsedSeconds(state, now);
  if (state.targetSeconds <= 0) return (elapsed % 60) / 60;
  return Math.min(1, elapsed / state.targetSeconds);
}

export function isExpired(state: TimerState, now: number): boolean {
  if (state.phase !== "running") return false;

  // A countdown with nothing to count down — a Flow break with an empty bank —
  // is already over. Without this it sits at 00:00 and can never finish, so
  // the timer looks like it simply isn't running. `startable` keeps the UI
  // from getting here; this is the backstop.
  if (!state.countsUp && state.targetSeconds <= 0) return true;

  return state.targetSeconds > 0 && remainingSeconds(state, now) <= 0;
}

/**
 * Whether there is anything for Start to do. A Flow break you haven't earned
 * yet has no duration, so offering Start would only produce a stuck clock.
 */
export function startable(state: TimerState): boolean {
  return state.countsUp || state.targetSeconds > 0;
}

export function durationFor(kind: SessionKind, settings: Settings): number {
  switch (kind) {
    case "focus":
      return Math.round(settings.focusMinutes * 60);
    case "shortBreak":
      return Math.round(settings.shortBreakMinutes * 60);
    case "longBreak":
      return Math.round(settings.longBreakMinutes * 60);
  }
}

export interface BreakTierBand {
  /** Inclusive work-minute bounds. */
  from: number;
  to: number;
}

/**
 * The flow-mode break ladder: `maxWorkMinutes` split into `tierCount` equal
 * bands, except the first, which only opens at `MIN_WORK_MINUTES_TO_EARN`.
 * The count follows the configured tiers rather than a constant, so the ladder
 * can grow or shrink without touching this.
 *
 * At the default 60-minute max over 5 tiers: 5–12, 13–24, 25–36, 37–48, 49–60.
 */
export function breakTierBands(
  maxWorkMinutes: number,
  tierCount = 5,
): BreakTierBand[] {
  const width = maxWorkMinutes / tierCount;
  return Array.from({ length: tierCount }, (_, index) => ({
    from: index === 0 ? MIN_WORK_MINUTES_TO_EARN : Math.round(index * width) + 1,
    to: Math.round((index + 1) * width),
  }));
}

/**
 * Flow mode: focus counts up to the max work time, and breaks are drawn
 * from a bank filled by finishing work sessions.
 */
export function targetSecondsFor(
  kind: SessionKind,
  settings: Settings,
  bankedBreakSeconds: number,
): number {
  if (settings.timerStyle === "flow") {
    if (kind === "focus") return Math.round(settings.maxWorkMinutes * 60);
    // The configured break is the floor and the bank raises it. Making the
    // bank the *only* source meant an empty bank left you unable to take any
    // break at all — a bad trade in an app about looking after yourself, and
    // it stranded anyone who reset a session before earning anything.
    return Math.max(
      durationFor(kind, settings),
      Math.round(bankedBreakSeconds),
    );
  }
  return durationFor(kind, settings);
}

/**
 * Which band a work session lands in decides the reward, so the break steps up
 * in chunks rather than creeping. Anything past the top band earns the top
 * band — you can't exceed the max work time anyway.
 */
export function earnedBreakSeconds(
  focusSeconds: number,
  settings: Settings,
): number {
  if (settings.timerStyle !== "flow") return 0;

  const minutes = Math.floor(focusSeconds / 60);
  if (minutes < MIN_WORK_MINUTES_TO_EARN) return 0;

  const tiers = settings.breakTiers;
  const bands = breakTierBands(settings.maxWorkMinutes, tiers.length);
  const index = bands.findIndex((band) => minutes <= band.to);
  const tier = tiers[index === -1 ? tiers.length - 1 : index] ?? 0;
  return Math.round(tier * 60);
}

export interface FlowGoal {
  /** Minutes of work that unlock the next step up in break time. */
  atMinutes: number;
  /** Break minutes the session has earned so far. */
  earnedMinutes: number;
  /** Break minutes once `atMinutes` is reached. */
  nextMinutes: number;
  /** 0..1 toward `atMinutes`, restarting at each band. */
  progress: number;
}

/**
 * What a Flow session is working toward right now. The ring uses this rather
 * than elapsed-over-max: at a 60-minute cap that advances 1/3600th per second,
 * which looks frozen and makes a running timer read as broken. Measured
 * against the next band it visibly fills.
 */
export function flowGoal(elapsed: number, settings: Settings): FlowGoal {
  const tiers = settings.breakTiers;
  const bands = breakTierBands(settings.maxWorkMinutes, tiers.length);
  const minutes = Math.floor(elapsed / 60);

  const nextIndex = bands.findIndex((band) => band.from > minutes);
  const atMinutes =
    nextIndex === -1 ? settings.maxWorkMinutes : bands[nextIndex].from;
  const fromMinutes =
    nextIndex === -1
      ? bands[bands.length - 1].from
      : nextIndex === 0
        ? 0
        : bands[nextIndex - 1].from;

  const span = Math.max(1, (atMinutes - fromMinutes) * 60);
  return {
    atMinutes,
    earnedMinutes: Math.round(earnedBreakSeconds(elapsed, settings) / 60),
    nextMinutes:
      nextIndex === -1
        ? (tiers[tiers.length - 1] ?? 0)
        : (tiers[nextIndex] ?? 0),
    progress: Math.min(1, Math.max(0, (elapsed - fromMinutes * 60) / span)),
  };
}

export function createTimerState(
  kind: SessionKind,
  settings: Settings,
  bankedBreakSeconds: number,
): TimerState {
  return {
    kind,
    style: settings.timerStyle,
    phase: "idle",
    countsUp: settings.timerStyle === "flow" && kind === "focus",
    targetSeconds: targetSecondsFor(kind, settings, bankedBreakSeconds),
    startedAt: null,
    accumulatedMs: 0,
    sessionStartedAt: null,
    cycle: 0,
  };
}

export function start(state: TimerState, now: number): TimerState {
  if (state.phase === "running") return state;
  return {
    ...state,
    phase: "running",
    startedAt: now,
    sessionStartedAt: state.sessionStartedAt ?? now,
  };
}

export function pause(state: TimerState, now: number): TimerState {
  if (state.phase !== "running") return state;
  return {
    ...state,
    phase: "paused",
    accumulatedMs: elapsedMs(state, now),
    startedAt: null,
  };
}

export function toggle(state: TimerState, now: number): TimerState {
  return state.phase === "running" ? pause(state, now) : start(state, now);
}

export function complete(state: TimerState, now: number): TimerState {
  return {
    ...state,
    phase: "completed",
    accumulatedMs: elapsedMs(state, now),
    startedAt: null,
  };
}

/** Back to the top of the same session kind. */
export function reset(
  state: TimerState,
  settings: Settings,
  bankedBreakSeconds: number,
): TimerState {
  return {
    ...createTimerState(state.kind, settings, bankedBreakSeconds),
    cycle: state.cycle,
  };
}

/** Which session naturally follows the one that just finished. */
export function nextKind(state: TimerState, settings: Settings): SessionKind {
  if (state.kind !== "focus") return "focus";
  const completedCycles = state.cycle + 1;
  return completedCycles % settings.cyclesBeforeLongBreak === 0
    ? "longBreak"
    : "shortBreak";
}

export function advance(
  state: TimerState,
  settings: Settings,
  bankedBreakSeconds: number,
): TimerState {
  const kind = nextKind(state, settings);
  // Only finishing a focus session moves the cycle counter along.
  const cycle = state.kind === "focus" ? state.cycle + 1 : state.cycle;
  return {
    ...createTimerState(kind, settings, bankedBreakSeconds),
    cycle: kind === "focus" && cycle >= settings.cyclesBeforeLongBreak ? 0 : cycle,
  };
}

/** Switch session kind directly, discarding the current run. */
export function switchTo(
  state: TimerState,
  kind: SessionKind,
  settings: Settings,
  bankedBreakSeconds: number,
): TimerState {
  return {
    ...createTimerState(kind, settings, bankedBreakSeconds),
    cycle: state.cycle,
  };
}

export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}

export const KIND_LABEL: Record<SessionKind, string> = {
  focus: "Focus",
  shortBreak: "Short break",
  longBreak: "Long break",
};
