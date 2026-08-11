"use client";

import { create } from "zustand";
import { dayKey, daysBetween } from "@/lib/date";
import { notifySessionEnd, playChime, playCue, primeAudio } from "@/lib/notify";
import { emitLambingEvent } from "@/lib/timer/events";
import {
  advance,
  complete,
  createTimerState,
  earnedBreakSeconds,
  elapsedSeconds,
  pause as pauseTimer,
  reset as resetTimer,
  start as startTimer,
  switchTo,
  targetSecondsFor,
  type TimerState,
} from "@/lib/timer/machine";
import { getRepository } from "./localAdapter";
import {
  DEFAULT_LAYOUT,
  DEFAULT_SETTINGS,
  reconcileLayout,
  type Layout,
  type SessionKind,
  type SessionRecord,
  type Settings,
  type StreakState,
  type Task,
} from "./types";

/** Streak celebrations fire on these day counts. */
const STREAK_MILESTONES = [3, 7, 14, 30, 50, 100];

/** Days away before the companion notices you were gone. */
const ABSENCE_DAYS = 1;

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface AppState {
  hydrated: boolean;
  settings: Settings;
  sessions: SessionRecord[];
  streak: StreakState;
  tasks: Task[];
  layout: Layout;
  hiddenCards: string[];
  bankedBreakSeconds: number;
  timer: TimerState;

  hydrate: () => Promise<void>;

  startOrPause: () => void;
  reset: () => void;
  /** Finish the current session: log it, bank break time, move on. */
  finish: (opts?: { completed?: boolean }) => void;
  skip: () => void;
  switchKind: (kind: SessionKind) => void;

  updateSettings: (patch: Partial<Settings>) => void;
  addTask: (title: string) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  setLayout: (layout: Layout) => void;
  hideCard: (id: string) => void;
  showCard: (id: string) => void;
  resetLayout: () => void;
  clearAll: () => Promise<void>;
}

const repository = getRepository();

export const useAppStore = create<AppState>((set, get) => ({
  hydrated: false,
  settings: DEFAULT_SETTINGS,
  sessions: [],
  streak: { current: 0, best: 0, lastActiveDay: null },
  tasks: [],
  layout: DEFAULT_LAYOUT,
  hiddenCards: [],
  bankedBreakSeconds: 0,
  timer: createTimerState("focus", DEFAULT_SETTINGS, 0),

  async hydrate() {
    if (get().hydrated) return;
    const state = await repository.load();
    const now = Date.now();
    const lastSeen = await repository.touchLastSeen(now);

    set({
      hydrated: true,
      settings: state.settings,
      sessions: state.sessions,
      streak: state.streak,
      tasks: state.tasks,
      layout: reconcileLayout(state.layout),
      // Kept out of `layout` on purpose — see `visibleCards`.
      hiddenCards: state.hiddenCards.filter((id) => DEFAULT_LAYOUT.includes(id)),
      bankedBreakSeconds: state.bankedBreakSeconds,
      timer: createTimerState(
        "focus",
        state.settings,
        state.bankedBreakSeconds,
      ),
    });

    if (lastSeen !== null) {
      const daysAway = daysBetween(dayKey(lastSeen), dayKey(now));
      if (daysAway >= ABSENCE_DAYS) {
        emitLambingEvent("user:returned", {
          daysAway,
          streak: state.streak.current,
        });
      }
    }
  },

  startOrPause() {
    const { timer, settings, sessions } = get();
    const now = Date.now();

    if (timer.phase === "running") {
      if (settings.uiSoundsEnabled) playCue("pause");
      set({ timer: pauseTimer(timer, now) });
      return;
    }

    // Pressing Start is the user gesture that unlocks audio playback, so this
    // is the only reliable place to open the AudioContext. It has to consider
    // both toggles, or cues stay silent when only they are switched on.
    if (settings.soundEnabled || settings.uiSoundsEnabled) primeAudio();
    if (settings.uiSoundsEnabled) {
      playCue(timer.phase === "paused" ? "resume" : "start");
    }

    const started = startTimer(timer, now);
    set({ timer: started });

    if (timer.phase === "idle") {
      if (started.kind === "focus") {
        const today = dayKey(now);
        const isFirstToday = !sessions.some(
          (session) =>
            session.kind === "focus" && dayKey(session.endedAt) === today,
        );
        // The day's opening line replaces the ordinary one — never both.
        emitLambingEvent(isFirstToday ? "day:first-session" : "focus:start", {
          minutes:
            settings.timerStyle === "flow"
              ? 0
              : Math.round(started.targetSeconds / 60),
          kind: "focus",
          streak: get().streak.current,
        });
      } else {
        emitLambingEvent("break:start", {
          minutes: Math.round(started.targetSeconds / 60),
          kind: started.kind,
          bankedBreakMinutes: Math.round(get().bankedBreakSeconds / 60),
        });
      }
    }
  },

  reset() {
    const { timer, settings, bankedBreakSeconds } = get();
    if (settings.uiSoundsEnabled) playCue("reset");
    set({ timer: resetTimer(timer, settings, bankedBreakSeconds) });
  },

  finish({ completed = true } = {}) {
    const { timer, settings, sessions, streak, bankedBreakSeconds } = get();
    if (timer.phase === "idle") return;

    const now = Date.now();
    const finished = complete(timer, now);
    const seconds = elapsedSeconds(finished, now);
    const minutes = Math.round(seconds / 60);

    const record: SessionRecord = {
      id: newId(),
      kind: timer.kind,
      startedAt: timer.sessionStartedAt ?? now,
      endedAt: now,
      seconds,
      completed,
    };
    const nextSessions = [...sessions, record];
    void repository.appendSession(record);

    // Flow mode banks break time as you focus, and spends it on breaks.
    let nextBanked = bankedBreakSeconds;
    if (settings.timerStyle === "flow") {
      nextBanked =
        timer.kind === "focus"
          ? bankedBreakSeconds + earnedBreakSeconds(seconds, settings)
          : Math.max(0, bankedBreakSeconds - seconds);
      void repository.saveBankedBreakSeconds(nextBanked);
    }

    // Streaks only count focus work, and only once per day.
    let nextStreak = streak;
    if (timer.kind === "focus" && completed) {
      const today = dayKey(now);
      if (streak.lastActiveDay !== today) {
        const gap =
          streak.lastActiveDay === null
            ? Infinity
            : daysBetween(streak.lastActiveDay, today);
        const current = gap === 1 ? streak.current + 1 : 1;
        nextStreak = {
          current,
          best: Math.max(streak.best, current),
          lastActiveDay: today,
        };
        void repository.saveStreak(nextStreak);
      }
    }

    const nextTimer = advance(finished, settings, nextBanked);

    set({
      timer: nextTimer,
      sessions: nextSessions,
      streak: nextStreak,
      bankedBreakSeconds: nextBanked,
    });

    // A session running out is exactly the moment the user is likely to be
    // looking somewhere else, so it has to make a noise. Skipping is a
    // deliberate act and stays silent.
    if (completed) {
      if (settings.soundEnabled) playChime(timer.kind);
      if (settings.notificationsEnabled) notifySessionEnd(timer.kind);
    }

    if (timer.kind === "focus") {
      emitLambingEvent(completed ? "focus:complete" : "focus:abandoned", {
        minutes,
        kind: "focus",
        streak: nextStreak.current,
      });
      if (
        completed &&
        nextStreak.current !== streak.current &&
        STREAK_MILESTONES.includes(nextStreak.current)
      ) {
        emitLambingEvent("streak:milestone", { streak: nextStreak.current });
      }
    } else if (completed && timer.kind === "longBreak") {
      // Finishing the long break means a whole set of cycles is behind you.
      emitLambingEvent("cycle:complete", {
        cycles: settings.cyclesBeforeLongBreak,
        streak: nextStreak.current,
      });
    }

    if (settings.autoStartNext && nextTimer.targetSeconds > 0) {
      // Let the completion line land before the next session announces itself.
      setTimeout(() => {
        const state = get();
        if (state.timer.phase === "idle") state.startOrPause();
      }, 900);
    }
  },

  skip() {
    const { timer, settings, bankedBreakSeconds } = get();
    if (settings.uiSoundsEnabled) playCue("skip");
    if (timer.phase === "idle") {
      set({ timer: advance(timer, settings, bankedBreakSeconds) });
      return;
    }
    get().finish({ completed: false });
  },

  switchKind(kind) {
    const { timer, settings, bankedBreakSeconds } = get();
    set({ timer: switchTo(timer, kind, settings, bankedBreakSeconds) });
  },

  updateSettings(patch) {
    const settings = { ...get().settings, ...patch };
    void repository.saveSettings(settings);

    // An idle timer should immediately reflect a changed duration; a running
    // one keeps its original target so the session in progress stays honest.
    const { timer, bankedBreakSeconds } = get();
    const nextTimer =
      timer.phase === "idle"
        ? {
            ...timer,
            style: settings.timerStyle,
            countsUp: settings.timerStyle === "flow" && timer.kind === "focus",
            targetSeconds: targetSecondsFor(
              timer.kind,
              settings,
              bankedBreakSeconds,
            ),
          }
        : timer;

    set({ settings, timer: nextTimer });
  },

  addTask(title) {
    const trimmed = title.trim();
    if (!trimmed) return;
    const tasks = [
      ...get().tasks,
      { id: newId(), title: trimmed, done: false, createdAt: Date.now() },
    ];
    void repository.saveTasks(tasks);
    set({ tasks });
  },

  toggleTask(id) {
    const tasks = get().tasks.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task,
    );
    void repository.saveTasks(tasks);
    set({ tasks });
  },

  removeTask(id) {
    const tasks = get().tasks.filter((task) => task.id !== id);
    void repository.saveTasks(tasks);
    set({ tasks });
  },

  setLayout(layout) {
    void repository.saveLayout(layout);
    set({ layout });
  },

  hideCard(id) {
    const { hiddenCards } = get();
    if (hiddenCards.includes(id)) return;
    const next = [...hiddenCards, id];
    void repository.saveHiddenCards(next);
    set({ hiddenCards: next });
  },

  showCard(id) {
    const next = get().hiddenCards.filter((card) => card !== id);
    void repository.saveHiddenCards(next);
    set({ hiddenCards: next });
  },

  resetLayout() {
    // Also the escape hatch for having hidden everything.
    void repository.saveLayout(DEFAULT_LAYOUT);
    void repository.saveHiddenCards([]);
    set({ layout: [...DEFAULT_LAYOUT], hiddenCards: [] });
  },

  async clearAll() {
    await repository.clear();
    set({
      settings: DEFAULT_SETTINGS,
      sessions: [],
      streak: { current: 0, best: 0, lastActiveDay: null },
      tasks: [],
      layout: [...DEFAULT_LAYOUT],
      hiddenCards: [],
      bankedBreakSeconds: 0,
      timer: createTimerState("focus", DEFAULT_SETTINGS, 0),
    });
  },
}));
