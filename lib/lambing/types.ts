import type { LambingTrigger, TriggerContext } from "@/lib/timer/events";

/**
 * Intensity is how clingy a line is. Short sessions get gentle lines, long
 * ones and milestones unlock the needier end of the range.
 */
export type Intensity = 1 | 2 | 3;

/** Who the companion is. Adding a third is a data exercise, not a code one. */
export type PersonaId = "jowa" | "bestfriend";

export interface Persona {
  id: PersonaId;
  /** Shown in the settings picker. */
  name: string;
  /** One line describing the voice, so the picker isn't guesswork. */
  blurb: string;
  /** Default name for the companion when this persona is chosen. */
  defaultCompanionName: string;
}

export const PERSONAS: Persona[] = [
  {
    id: "jowa",
    name: "Jowa",
    blurb: "Clingy, soft, misses you the moment you start working.",
    defaultCompanionName: "Lambing",
  },
  {
    id: "bestfriend",
    name: "Bestfriend",
    blurb: "Dry, teasing, will absolutely call you out.",
    defaultCompanionName: "Bes",
  },
];

export interface LambingLine {
  id: string;
  trigger: LambingTrigger;
  intensity: Intensity;
  /** Omit to share the line across every persona. */
  persona?: PersonaId;
  /** Uses the {task} slot, so it's skipped when no task is active. */
  requiresTask?: boolean;
  /**
   * Template slots: {companion} {user} {minutes} {banked} {days}
   * {awayMinutes} {cycles}.
   * Split a line with `||` to send it as several bubbles in a row, which
   * reads far more like a real person typing than one long paragraph.
   */
  text: string;
  /** Chip ids offered alongside this line. */
  chips?: string[];
}

export interface LambingChip {
  id: string;
  label: string;
  /** Omit to share the chip across every persona. */
  persona?: PersonaId;
  /** Pool of responses; one is chosen with the same anti-repeat rules. */
  responses: string[];
  /** Chips offered after the response, for a second conversational beat. */
  followUp?: string[];
}

/**
 * A typed message the companion recognises. Matching is keyword-based and
 * local — no model, no network. Extending this table is how the companion
 * learns to talk about more things.
 */
export interface Intent {
  id: string;
  /** Omit to share across every persona. */
  persona?: PersonaId;
  /** Lowercased keywords. Short ones are matched on word boundaries. */
  match: string[];
  /** Same `||` bubbles and {slot} support as lines. */
  responses: string[];
  chips?: string[];
}

export interface LambingReply {
  bubbles: string[];
  chips: LambingChip[];
}

export interface LambingRequest {
  trigger: LambingTrigger;
  context: TriggerContext;
  persona: PersonaId;
  /** Names and totals the templates interpolate. */
  companionName: string;
  userName: string;
}

/**
 * The seam. The local engine implements this today; a self-built generative
 * chat can implement it later without the chat card changing at all.
 */
export interface LambingProvider {
  respond(request: LambingRequest): Promise<LambingReply | null>;
  respondToChip(
    chipId: string,
    request: Omit<LambingRequest, "trigger">,
  ): Promise<LambingReply | null>;
  /** A message the user typed. Matched locally against `intents.ts`. */
  respondToText(
    text: string,
    request: Omit<LambingRequest, "trigger">,
  ): Promise<LambingReply | null>;
}

export type MessageAuthor = "companion" | "user";

export interface ChatMessage {
  id: string;
  author: MessageAuthor;
  text: string;
  at: number;
}
