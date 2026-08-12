/**
 * Local keyword matching for typed messages. No model, no network — just a
 * scored lookup against the table in `intents.ts`.
 */

/** Keywords at or under this length must match whole words. */
const SHORT_KEYWORD = 4;

/**
 * Lowercase, strip diacritics and punctuation, collapse whitespace. People
 * type "Uy!! miss na kita 🥺" and the table shouldn't have to anticipate that.
 */
export function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Score one keyword against an already-normalised message.
 *
 * Short keywords match on word boundaries, because plain substring matching
 * fires "hi" inside *hindi*, *this* and *sipag* — which is the difference
 * between the companion seeming to understand and it seeming broken. Longer
 * keywords score higher so "miss na kita" beats a bare "miss".
 */
export function scoreKeyword(message: string, keyword: string): number {
  const needle = normalise(keyword);
  if (!needle) return 0;

  const isShort = needle.length <= SHORT_KEYWORD;
  const found = isShort
    ? new RegExp(`(^|\\s)${escapeRegExp(needle)}(\\s|$)`).test(message)
    : message.includes(needle);

  return found ? needle.length : 0;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface Scored<T> {
  item: T;
  score: number;
}

/** Highest total keyword score wins; zero means nothing recognised it. */
export function bestMatch<T extends { match: string[] }>(
  text: string,
  candidates: T[],
): Scored<T> | null {
  const message = normalise(text);
  if (!message) return null;

  let best: Scored<T> | null = null;
  for (const item of candidates) {
    const score = item.match.reduce(
      (total, keyword) => total + scoreKeyword(message, keyword),
      0,
    );
    if (score > 0 && (!best || score > best.score)) best = { item, score };
  }
  return best;
}
