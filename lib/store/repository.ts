import type {
  Layout,
  PersistedState,
  SessionRecord,
  Settings,
  StreakState,
  Task,
} from "./types";

/**
 * Every read and write in the app goes through this interface — no component
 * touches localStorage directly. Adding cross-device sync later means writing
 * one new adapter and changing the single line in `getRepository()` that
 * constructs it.
 */
export interface Repository {
  load(): Promise<PersistedState>;

  getSettings(): Promise<Settings>;
  saveSettings(settings: Settings): Promise<void>;

  getSessions(): Promise<SessionRecord[]>;
  appendSession(session: SessionRecord): Promise<void>;

  getStreak(): Promise<StreakState>;
  saveStreak(streak: StreakState): Promise<void>;

  getTasks(): Promise<Task[]>;
  saveTasks(tasks: Task[]): Promise<void>;

  getLayout(): Promise<Layout>;
  saveLayout(layout: Layout): Promise<void>;

  getBankedBreakSeconds(): Promise<number>;
  saveBankedBreakSeconds(seconds: number): Promise<void>;

  /** Returns the previous value, then stamps `now`. Drives the "welcome back". */
  touchLastSeen(now: number): Promise<number | null>;

  clear(): Promise<void>;
}
