import type { TriggerContext } from "@/lib/timer/events";
import { FALLBACKS, INTENTS } from "./intents.ts";
import { CHIPS, LINES } from "./lines.ts";
import { bestMatch } from "./matching.ts";
import type {
  Intensity,
  LambingChip,
  LambingLine,
  LambingProvider,
  LambingReply,
  LambingRequest,
  PersonaId,
} from "./types.ts";

/** How many recently-used line ids to refuse to repeat. */
const MEMORY_SIZE = 12;

/** Offered when a reply would otherwise leave nothing to tap. */
const KEEP_TALKING = ["more", "im-okay"];

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
    banked: String(context.bankedBreakMinutes ?? 0),
    days: String(context.daysAway ?? 0),
    awayMinutes: String(context.awayMinutes ?? 0),
    cycles: String(context.cycles ?? 0),
    task: context.task ?? "",
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
 * How clingy the companion is allowed to be.
 *
 * Total focus sessions set the baseline — the companion earns familiarity
 * rather than being equally needy on session one and session fifty — and the
 * current session nudges it from there. This used to key off the streak, which
 * meant one missed day reset the relationship to strangers.
 */
export function preferredIntensity(context: TriggerContext): Intensity {
  const sessions = context.sessionsTotal ?? 0;
  const minutes = context.minutes ?? 0;
  const days = context.daysAway ?? 0;

  let level = sessions >= 50 ? 3 : sessions >= 10 ? 2 : 1;

  // A long stretch of work, or a long absence, earns one step more.
  if (minutes >= 40 || days >= 3) level += 1;
  else if (minutes >= 20 || days >= 1) level += 0.5;

  return Math.min(3, Math.max(1, Math.round(level))) as Intensity;
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

/** A persona-less entry belongs to everyone. */
function forPersona<T extends { persona?: PersonaId }>(
  items: T[],
  persona: PersonaId,
): T[] {
  return items.filter((item) => !item.persona || item.persona === persona);
}

function resolveChips(
  ids: string[] | undefined,
  persona: PersonaId,
): LambingChip[] {
  if (!ids) return [];
  return ids
    .map((id) => {
      const matches = CHIPS.filter((chip) => chip.id === id);
      return (
        matches.find((chip) => chip.persona === persona) ??
        matches.find((chip) => !chip.persona)
      );
    })
    .filter((chip): chip is LambingChip => Boolean(chip));
}

/**
 * A fully local lambing provider. No network, no API key, no cost — lines come
 * from `lines.ts` and typed messages are matched against `intents.ts`.
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

  /**
   * Never hand back a reply with nothing to tap. Guaranteed here rather than
   * in every chip definition, so a tap-only user can't hit a wall.
   */
  private withWayOut(
    bubbles: string[],
    chips: LambingChip[],
    persona: PersonaId,
  ): LambingReply {
    return {
      bubbles,
      chips: chips.length > 0 ? chips : resolveChips(KEEP_TALKING, persona),
    };
  }

  /** Pick from a pool, preferring entries not seen recently. */
  private pickFresh<T>(pool: T[], id: (item: T) => string): T | null {
    if (pool.length === 0) return null;
    const fresh = pool.filter((item) => !this.isStale(id(item)));
    const usable = fresh.length > 0 ? fresh : pool;
    const choice = usable[Math.floor(Math.random() * usable.length)];
    this.remember(id(choice));
    return choice;
  }

  async respond(request: LambingRequest): Promise<LambingReply | null> {
    const candidates = forPersona(LINES, request.persona).filter(
      (line) =>
        line.trigger === request.trigger &&
        // A line that names the task is worse than silence when there is none.
        (!line.requiresTask || Boolean(request.context.task)),
    );
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

    return this.withWayOut(
      toBubbles(fillSlots(line.text, request)),
      resolveChips(line.chips, request.persona),
      request.persona,
    );
  }

  async respondToChip(
    chipId: string,
    request: Omit<LambingRequest, "trigger">,
  ): Promise<LambingReply | null> {
    const chip = resolveChips([chipId], request.persona)[0];
    if (!chip) return null;

    const choice = this.pickFresh(
      chip.responses.map((text, index) => ({ id: `${chip.id}:${index}`, text })),
      (entry) => entry.id,
    );
    if (!choice) return null;

    return this.withWayOut(
      toBubbles(fillSlots(choice.text, request)),
      resolveChips(chip.followUp, request.persona),
      request.persona,
    );
  }

  async respondToText(
    text: string,
    request: Omit<LambingRequest, "trigger">,
  ): Promise<LambingReply | null> {
    const match = bestMatch(text, forPersona(INTENTS, request.persona));

    // Misses are common and must never read as a parser failing. The fallback
    // hands the turn back instead of admitting it didn't understand.
    const pool = match
      ? match.item.responses.map((response, index) => ({
          id: `${match.item.id}:${index}`,
          text: response,
        }))
      : FALLBACKS.map((response, index) => ({
          id: `fallback:${index}`,
          text: response,
        }));

    const choice = this.pickFresh(pool, (entry) => entry.id);
    if (!choice) return null;

    return this.withWayOut(
      toBubbles(fillSlots(choice.text, request)),
      resolveChips(match?.item.chips, request.persona),
      request.persona,
    );
  }
}

/** Milliseconds before the companion starts typing at all. */
const THINKING_MIN = 350;
const THINKING_MAX = 900;

/**
 * When each bubble should land, as cumulative delays.
 *
 * A single linear formula made every message arrive at exactly the same rate,
 * which reads as a machine on a timer. A thinking pause plus per-bubble jitter
 * is what makes it feel like someone actually typing.
 */
export function typingPlan(bubbles: string[]): number[] {
  let elapsed = THINKING_MIN + Math.random() * (THINKING_MAX - THINKING_MIN);

  return bubbles.map((text) => {
    const base = 260 + text.length * 18;
    const jitter = 0.8 + Math.random() * 0.4;
    elapsed += Math.min(1800, base * jitter);
    return Math.round(elapsed);
  });
}
