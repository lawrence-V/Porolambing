import type { Repository } from "./repository";
import {
  CURRENT_SCHEMA_VERSION,
  DEFAULT_SETTINGS,
  createDefaultState,
  normalizeSettings,
  type Layout,
  type PersistedState,
  type SessionRecord,
  type Settings,
  type StreakState,
  type Task,
} from "./types";

const STORAGE_KEY = "porolambing:v1";

/** Keep the log from growing without bound; nothing in the UI reads past this. */
const MAX_SESSIONS = 500;

type Migration = (state: PersistedState) => PersistedState;

/**
 * Keyed by the version being migrated *from*. When the shape changes, bump
 * CURRENT_SCHEMA_VERSION and add the step that moves 1 -> 2 here.
 */
const migrations: Record<number, Migration> = {};

function migrate(raw: PersistedState): PersistedState {
  let state = raw;
  while (state.schemaVersion < CURRENT_SCHEMA_VERSION) {
    const step = migrations[state.schemaVersion];
    if (!step) {
      // No path forward — safer to reset than to run on a shape we can't read.
      return createDefaultState();
    }
    state = step(state);
  }
  return state;
}

export class LocalStorageAdapter implements Repository {
  private cache: PersistedState | null = null;

  private read(): PersistedState {
    if (this.cache) return this.cache;

    if (typeof window === "undefined") {
      // Server render: hand back defaults rather than throwing. The client
      // hydrates over this once it mounts.
      return createDefaultState();
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.cache = createDefaultState();
        return this.cache;
      }
      const parsed = JSON.parse(raw) as PersistedState;
      const migrated = migrate(parsed);
      // Merge settings against defaults so a newly added setting is populated
      // rather than arriving as undefined in an old payload.
      this.cache = {
        ...createDefaultState(),
        ...migrated,
        settings: normalizeSettings({
          ...DEFAULT_SETTINGS,
          ...migrated.settings,
        }),
      };
      return this.cache;
    } catch {
      this.cache = createDefaultState();
      return this.cache;
    }
  }

  private write(patch: Partial<PersistedState>): void {
    const next = { ...this.read(), ...patch };
    this.cache = next;
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Quota or private-mode failure. The in-memory cache still holds the
      // value, so the session keeps working; it just won't survive a reload.
    }
  }

  async load(): Promise<PersistedState> {
    return this.read();
  }

  async getSettings(): Promise<Settings> {
    return this.read().settings;
  }

  async saveSettings(settings: Settings): Promise<void> {
    this.write({ settings });
  }

  async getSessions(): Promise<SessionRecord[]> {
    return this.read().sessions;
  }

  async appendSession(session: SessionRecord): Promise<void> {
    const sessions = [...this.read().sessions, session].slice(-MAX_SESSIONS);
    this.write({ sessions });
  }

  async getStreak(): Promise<StreakState> {
    return this.read().streak;
  }

  async saveStreak(streak: StreakState): Promise<void> {
    this.write({ streak });
  }

  async getTasks(): Promise<Task[]> {
    return this.read().tasks;
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    this.write({ tasks });
  }

  async getLayout(): Promise<Layout> {
    return this.read().layout;
  }

  async saveLayout(layout: Layout): Promise<void> {
    this.write({ layout });
  }

  async getHiddenCards(): Promise<string[]> {
    return this.read().hiddenCards;
  }

  async saveHiddenCards(hiddenCards: string[]): Promise<void> {
    this.write({ hiddenCards });
  }

  async getBankedBreakSeconds(): Promise<number> {
    return this.read().bankedBreakSeconds;
  }

  async saveBankedBreakSeconds(seconds: number): Promise<void> {
    this.write({ bankedBreakSeconds: Math.max(0, Math.round(seconds)) });
  }

  async touchLastSeen(now: number): Promise<number | null> {
    const previous = this.read().lastSeenAt;
    this.write({ lastSeenAt: now });
    return previous;
  }

  async clear(): Promise<void> {
    this.cache = createDefaultState();
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing useful to do; the cache reset above already took effect.
    }
  }
}

let instance: Repository | null = null;

/** The single place that decides which adapter backs the app. */
export function getRepository(): Repository {
  if (!instance) instance = new LocalStorageAdapter();
  return instance;
}
