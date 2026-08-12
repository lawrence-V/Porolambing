import type { SessionKind } from "@/lib/store/types";
import type { Phase } from "./machine";

/**
 * Which of the four surface treatments the app is wearing.
 *
 * A paused session keeps its tone rather than falling back to idle — you are
 * still in the middle of that session, and having the whole page change colour
 * on a pause would be a lie about where you are.
 */
export type SessionTone = "idle" | "focus" | "short" | "long";

export function toneFor(kind: SessionKind, phase: Phase): SessionTone {
  if (phase === "idle") return "idle";
  if (kind === "focus") return "focus";
  return kind === "longBreak" ? "long" : "short";
}

/** Page background per tone. */
export const GROUND: Record<SessionTone, string> = {
  idle: "var(--ground-idle)",
  focus: "var(--ground-focus)",
  short: "var(--ground-short)",
  long: "var(--ground-long)",
};

/** The hero timer's fill — a step stronger than the ground behind it. */
export const PANEL: Record<SessionTone, string> = {
  idle: "var(--panel-idle)",
  focus: "var(--panel-focus)",
  short: "var(--panel-short)",
  long: "var(--panel-long)",
};

/** What the session is called, for the focus-mode heading. */
export const TONE_LABEL: Record<SessionTone, string> = {
  idle: "Ready",
  focus: "Focus",
  short: "Short break",
  long: "Long break",
};
