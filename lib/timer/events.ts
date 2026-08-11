import type { SessionKind } from "@/lib/store/types";

/**
 * The timer never talks to the chat directly. It announces what happened, the
 * chat decides how to feel about it. Keeping the coupling this thin is what
 * lets the lambing engine be swapped out later without touching the timer.
 */
export type LambingTrigger =
  | "focus:start"
  | "focus:complete"
  | "focus:abandoned"
  | "break:start"
  | "break:idle"
  | "break:ending"
  | "streak:milestone"
  | "user:returned"
  /** First focus session of the day. Fires instead of `focus:start`. */
  | "day:first-session"
  /** Came back to the tab after wandering off mid-focus. */
  | "focus:returned"
  /** Finished a long break, so a whole set of cycles is done. */
  | "cycle:complete"
  /** Flow-mode focus crossing a long-session milestone. */
  | "focus:long-haul";

export interface TriggerContext {
  /** Minutes involved in whatever just happened. */
  minutes?: number;
  streak?: number;
  kind?: SessionKind;
  /** Days away, for user:returned. */
  daysAway?: number;
  bankedBreakMinutes?: number;
  /** Minutes spent away from the tab, for focus:returned. */
  awayMinutes?: number;
  /** Completed focus sessions, for cycle:complete. */
  cycles?: number;
}

export interface LambingEvent {
  trigger: LambingTrigger;
  context: TriggerContext;
  at: number;
}

type Listener = (event: LambingEvent) => void;

const listeners = new Set<Listener>();

export function onLambingEvent(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitLambingEvent(
  trigger: LambingTrigger,
  context: TriggerContext = {},
): void {
  const event: LambingEvent = { trigger, context, at: Date.now() };
  for (const listener of [...listeners]) {
    try {
      listener(event);
    } catch (error) {
      // One misbehaving listener shouldn't stop the others from hearing it.
      console.error("lambing listener failed", error);
    }
  }
}

/** Test seam: lets the dev panel drive the chat without running a real timer. */
export function clearLambingListeners(): void {
  listeners.clear();
}
