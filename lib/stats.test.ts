import assert from "node:assert/strict";
import { test } from "node:test";
import { dayKey } from "./date.ts";
import {
  focusCount,
  focusSeconds,
  formatDuration,
  sessionsOn,
} from "./stats.ts";
import type { SessionKind, SessionRecord } from "./store/types.ts";

const HOUR = 3_600_000;
const MINUTE = 60_000;
const T0 = new Date("2026-08-12T09:00:00").getTime();

function session(
  id: string,
  kind: SessionKind,
  startedAt: number,
  minutes: number,
  completed = true,
): SessionRecord {
  return {
    id,
    kind,
    startedAt,
    endedAt: startedAt + minutes * MINUTE,
    seconds: minutes * 60,
    completed,
  };
}

test("sessionsOn buckets by local day", () => {
  const today = session("a", "focus", T0, 25);
  const yesterday = session("b", "focus", T0 - 24 * HOUR, 25);
  const kept = sessionsOn([today, yesterday], dayKey(T0));
  assert.deepEqual(
    kept.map((s) => s.id),
    ["a"],
  );
});

test("focus totals ignore breaks, and counts ignore abandoned work", () => {
  const day = [
    session("a", "focus", T0, 25),
    session("b", "shortBreak", T0 + 25 * MINUTE, 5),
    session("c", "focus", T0 + HOUR, 10, false),
  ];
  assert.equal(focusSeconds(day), 35 * 60, "both focus sessions count as time");
  assert.equal(focusCount(day), 1, "but only the completed one counts as done");
});

test("durations read the way people say them", () => {
  assert.equal(formatDuration(45 * 60), "45m");
  assert.equal(formatDuration(60 * 60), "1h");
  assert.equal(formatDuration(225 * 60), "3h 45m");
  assert.equal(formatDuration(0), "0m");
});
