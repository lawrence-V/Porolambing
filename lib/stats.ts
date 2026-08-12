import { dayKey } from "./date.ts";
import type { SessionRecord } from "./store/types.ts";

/**
 * Day statistics shared by the Today card and the rail. They each used to
 * derive "today" for themselves, twice via `toDateString()` and once via
 * `dayKey`, which is two ways of answering the same question.
 */

/** Sessions that ended on a given local day, oldest first. */
export function sessionsOn(
  sessions: SessionRecord[],
  day: string = dayKey(Date.now()),
): SessionRecord[] {
  return sessions.filter((session) => dayKey(session.endedAt) === day);
}

export function focusSeconds(sessions: SessionRecord[]): number {
  return sessions
    .filter((session) => session.kind === "focus")
    .reduce((total, session) => total + session.seconds, 0);
}

/** Completed focus sessions — an abandoned one isn't an achievement. */
export function focusCount(sessions: SessionRecord[]): number {
  return sessions.filter(
    (session) => session.kind === "focus" && session.completed,
  ).length;
}

/** "3h 45m", or "45m" under an hour. */
export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}
