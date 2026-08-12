import type { PersonaId } from "@/lib/lambing/types";

export type SessionKind = "focus" | "shortBreak" | "longBreak";

export type TimerStyle = "classic" | "flow";

/** A completed (or abandoned) stretch of time, as recorded in the log. */
export interface SessionRecord {
  id: string;
  kind: SessionKind;
  /** epoch ms */
  startedAt: number;
  /** epoch ms */
  endedAt: number;
  /** Seconds actually spent, which is not `endedAt - startedAt` when paused. */
  seconds: number;
  completed: boolean;
  /** What you were working on, if a task was active. */
  taskId?: string;
  /**
   * A copy of the title, not a lookup. Deleting a task must not blank the
   * history of the work done on it.
   */
  taskTitle?: string;
}

export interface Settings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  /** Focus sessions between long breaks. */
  cyclesBeforeLongBreak: number;
  autoStartNext: boolean;
  timerStyle: TimerStyle;
  /** Flow mode: how long a single count-up session may run. */
  maxWorkMinutes: number;
  /**
   * Flow mode: break minutes earned per work band, shortest band first.
   * The bands themselves are derived from `maxWorkMinutes` and this array's
   * length — see `breakTierBands` in `lib/timer/machine.ts`.
   */
  breakTiers: number[];
  /** Keep a small draggable timer visible while scrolling the app. */
  miniTimerEnabled: boolean;
  /** Narrow the side rail to icons only. */
  sidebarCollapsed: boolean;
  /** Play a chime when a session ends. */
  soundEnabled: boolean;
  /** Short cues on start, pause, skip and reset. */
  uiSoundsEnabled: boolean;
  /** Also raise a browser notification, but only when the tab is hidden. */
  notificationsEnabled: boolean;
  /** Which companion voice to use. */
  persona: PersonaId;
  /** What the user calls their lambing companion. */
  companionName: string;
  /** What the companion calls the user. */
  userName: string;
}

export interface Task {
  id: string;
  title: string;
  done: boolean;
  createdAt: number;
}

/** Ordered list of card ids; unknown ids are ignored on read. */
export type Layout = string[];

export interface PersistedState {
  schemaVersion: number;
  settings: Settings;
  sessions: SessionRecord[];
  tasks: Task[];
  layout: Layout;
  /** Card ids removed from the grid. See `visibleCards`. */
  hiddenCards: string[];
  /** The task the timer is currently for, if any. */
  activeTaskId: string | null;
  /** Break minutes banked in flow mode. */
  bankedBreakSeconds: number;
  /** epoch ms of the last time the app was open, for the welcome-back line. */
  lastSeenAt: number | null;
}

export const MAX_WORK_BOUNDS = { min: 30, max: 120, step: 5 } as const;
export const BREAK_TIER_BOUNDS = { min: 1, max: 60, step: 1 } as const;

export const DEFAULT_SETTINGS: Settings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
  autoStartNext: false,
  timerStyle: "classic",
  maxWorkMinutes: 60,
  breakTiers: [5, 10, 15, 20, 25],
  miniTimerEnabled: false,
  sidebarCollapsed: false,
  soundEnabled: true,
  uiSoundsEnabled: true,
  notificationsEnabled: false,
  persona: "jowa",
  companionName: "Lambing",
  userName: "",
};

function clamp(value: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

/**
 * Stored settings are merged over the defaults, which means a corrupt or
 * out-of-date payload could hand the app a `breakTiers` of the wrong length
 * and break every tier lookup. Everything read from disk goes through here.
 */
export function normalizeSettings(settings: Settings): Settings {
  const expectedTiers = DEFAULT_SETTINGS.breakTiers.length;
  const tiers =
    Array.isArray(settings.breakTiers) &&
    settings.breakTiers.length === expectedTiers
      ? settings.breakTiers.map((value) =>
          clamp(value, BREAK_TIER_BOUNDS.min, BREAK_TIER_BOUNDS.max, 5),
        )
      : [...DEFAULT_SETTINGS.breakTiers];

  return {
    ...settings,
    // "reverse" was this mode's name before it became Flow. Saved payloads
    // from then still carry it, and this runs on every read, so no migration
    // step or schema bump is needed.
    timerStyle:
      (settings.timerStyle as string) === "reverse"
        ? "flow"
        : settings.timerStyle,
    maxWorkMinutes: clamp(
      settings.maxWorkMinutes,
      MAX_WORK_BOUNDS.min,
      MAX_WORK_BOUNDS.max,
      DEFAULT_SETTINGS.maxWorkMinutes,
    ),
    breakTiers: tiers,
  };
}

export const DEFAULT_LAYOUT: Layout = [
  "timer",
  "chat",
  "tasks",
  "week",
  "log",
];

/** Single source for card names — used by the grid and the settings list. */
export const CARD_LABELS: Record<string, string> = {
  timer: "Timer",
  chat: "Lambing",
  tasks: "Tasks",
  week: "Last 7 days",
  log: "Today",
};

/**
 * Hidden cards are tracked separately rather than by removing them from
 * `layout`, because `hydrate()` appends any default id the stored layout is
 * missing — that's what lets a newly built card reach existing users, and it
 * would resurrect a hidden one on the very next load.
 */
export function visibleCards(layout: Layout, hidden: string[]): Layout {
  return layout.filter((id) => !hidden.includes(id));
}

/**
 * Reconcile a stored layout against the cards that exist today: drop ids we no
 * longer render, keep the user's order, and append anything new at the end.
 */
export function reconcileLayout(
  stored: Layout,
  defaults: Layout = DEFAULT_LAYOUT,
): Layout {
  return [
    ...stored.filter((id) => defaults.includes(id)),
    ...defaults.filter((id) => !stored.includes(id)),
  ];
}

export const CURRENT_SCHEMA_VERSION = 2;

export function createDefaultState(): PersistedState {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    settings: { ...DEFAULT_SETTINGS },
    sessions: [],
    tasks: [],
    layout: [...DEFAULT_LAYOUT],
    hiddenCards: [],
    activeTaskId: null,
    bankedBreakSeconds: 0,
    lastSeenAt: null,
  };
}
