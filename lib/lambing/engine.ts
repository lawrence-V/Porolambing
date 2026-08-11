import type { TriggerContext } from "@/lib/timer/events";
import { CHIPS, LINES } from "./lines";
import type {
  Intensity,
  LambingChip,
  LambingLine,
  LambingProvider,
  LambingReply,
  LambingRequest,
} from "./types";

/** How many recently-used line ids to refuse to repeat. */
const MEMORY_SIZE = 12;

function fillSlots(
  text: string,
  request: Pick<LambingRequest, "companionName" | "userName"> & {
    context: TriggerContext;
  },
): string {
  const { context } = request;
  const replacements: Record<string, string> = {
    companion: request.companionName || "Lambing",
    // Without a name set, second person reads better than an empty slot.
    user: request.userName || "ikaw",
    minutes: String(context.minutes ?? 0),
    streak: String(context.streak ?? 0),
    banked: String(context.bankedBreakMinutes ?? 0),
    days: String(context.daysAway ?? 0),
    awayMinutes: String(context.awayMinutes ?? 0),
    cycles: String(context.cycles ?? 0),
  };
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in replacements ? replacements[key] : match,
  );
}

function toBubbles(text: string): string[] {
  return text
    .split("||")
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * Longer sessions and bigger milestones earn needier lines. A 5-minute break
 * gets a gentle nudge; forty minutes of focus earns the dramatic reunion.
 */
function preferredIntensity(context: TriggerContext): Intensity {
  const minutes = context.minutes ?? 0;
  const days = context.daysAway ?? 0;
  if (days >= 3 || minutes >= 40) return 3;
  if (days >= 1 || minutes >= 20) return 2;
  return 1;
}

function weightFor(line: LambingLine, target: Intensity): number {
  // Exact match is strongly preferred, one step away is plausible, two is rare.
  const distance = Math.abs(line.intensity - target);
  return distance === 0 ? 6 : distance === 1 ? 3 : 1;
}

function weightedPick<T>(items: T[], weight: (item: T) => number): T | null {
  if (items.length === 0) return null;
  const total = items.reduce((sum, item) => sum + weight(item), 0);
  if (total <= 0) return items[Math.floor(Math.random() * items.length)];
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= weight(item);
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

function resolveChips(ids: string[] | undefined): LambingChip[] {
  if (!ids) return [];
  return ids
    .map((id) => CHIPS[id])
    .filter((chip): chip is LambingChip => Boolean(chip));
}

/**
 * A fully local lambing provider. No network, no API key, no cost — every line
 * is picked from the bank in `lines.ts` and rendered client-side.
 */
export class LocalLambingProvider implements LambingProvider {
  /** Ring buffer of recently used line/response ids. */
  private recent: string[] = [];

  private remember(id: string): void {
    this.recent.push(id);
    if (this.recent.length > MEMORY_SIZE) this.recent.shift();
  }

  private isStale(id: string): boolean {
    return this.recent.includes(id);
  }

  async respond(request: LambingRequest): Promise<LambingReply | null> {
    const candidates = LINES.filter((line) => line.trigger === request.trigger);
    if (candidates.length === 0) return null;

    // Prefer lines we haven't shown recently, but never go silent: if the whole
    // pool for this trigger is stale, fall back to the full set.
    const fresh = candidates.filter((line) => !this.isStale(line.id));
    const pool = fresh.length > 0 ? fresh : candidates;

    const target = preferredIntensity(request.context);
    const line = weightedPick(pool, (candidate) =>
      weightFor(candidate, target),
    );
    if (!line) return null;

    this.remember(line.id);

    return {
      bubbles: toBubbles(fillSlots(line.text, request)),
      chips: resolveChips(line.chips),
    };
  }

  async respondToChip(
    chipId: string,
    request: Omit<LambingRequest, "trigger">,
  ): Promise<LambingReply | null> {
    const chip = CHIPS[chipId];
    if (!chip) return null;

    const indexed = chip.responses.map((text, index) => ({
      id: `${chip.id}:${index}`,
      text,
    }));
    const fresh = indexed.filter((entry) => !this.isStale(entry.id));
    const pool = fresh.length > 0 ? fresh : indexed;
    const choice = pool[Math.floor(Math.random() * pool.length)];

    this.remember(choice.id);

    return {
      bubbles: toBubbles(fillSlots(choice.text, request)),
      chips: resolveChips(chip.followUp),
    };
  }
}

/** Roughly how long the companion "types" a bubble before it lands. */
export function typingDelayFor(text: string): number {
  const base = 420;
  const perCharacter = 22;
  return Math.min(1600, base + text.length * perCharacter);
}
