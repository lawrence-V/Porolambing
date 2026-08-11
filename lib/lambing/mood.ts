import type { SessionKind } from "@/lib/store/types";
import type { Phase } from "@/lib/timer/machine";

export type CompanionMood = "sweet" | "sleepy" | "excited";

/** Focus minutes after which the companion visibly gives up waiting. */
const DROWSY_AFTER_SECONDS = 15 * 60;

/**
 * The companion never speaks during focus, so its face has to carry the
 * presence instead: it dozes off while you work and perks up the moment a
 * break starts. This is what drives `CompanionAvatar`'s `mood`.
 */
export function moodFor(
  kind: SessionKind,
  phase: Phase,
  elapsedSeconds: number,
): CompanionMood {
  if (phase !== "running") return "sweet";
  if (kind !== "focus") return "excited";
  return elapsedSeconds >= DROWSY_AFTER_SECONDS ? "sleepy" : "sweet";
}

export interface CompanionStatus {
  label: string;
  /** Whether the status dot should pulse. */
  waiting: boolean;
}

export function statusFor(kind: SessionKind, phase: Phase): CompanionStatus {
  if (phase !== "running") return { label: "Always waiting", waiting: false };
  if (kind !== "focus") return { label: "Kasama mo", waiting: false };
  return { label: "Naghihintay", waiting: true };
}
