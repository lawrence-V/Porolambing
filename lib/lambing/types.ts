import type { LambingTrigger, TriggerContext } from "@/lib/timer/events";

/**
 * Intensity is how clingy a line is. Short sessions get gentle lines, long
 * ones and milestones unlock the needier end of the range.
 */
export type Intensity = 1 | 2 | 3;

export interface LambingLine {
  id: string;
  trigger: LambingTrigger;
  intensity: Intensity;
  /**
   * Template slots: {companion} {user} {minutes} {streak} {banked} {days}
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
  /** Pool of responses; one is chosen with the same anti-repeat rules. */
  responses: string[];
  /** Chips offered after the response, for a second conversational beat. */
  followUp?: string[];
}

export interface LambingReply {
  bubbles: string[];
  chips: LambingChip[];
}

export interface LambingRequest {
  trigger: LambingTrigger;
  context: TriggerContext;
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
}

export type MessageAuthor = "companion" | "user";

export interface ChatMessage {
  id: string;
  author: MessageAuthor;
  text: string;
  at: number;
}
