import assert from "node:assert/strict";
import { test } from "node:test";
import { moodFor, statusFor } from "../lambing/mood.ts";
import { DEFAULT_SETTINGS, normalizeSettings } from "../store/types.ts";
import {
  advance,
  breakTierBands,
  createTimerState,
  earnedBreakSeconds,
  elapsedSeconds,
  formatClock,
  isExpired,
  nextKind,
  pause,
  remainingSeconds,
  start,
} from "./machine.ts";

const settings = { ...DEFAULT_SETTINGS };
const T0 = 1_700_000_000_000;

test("elapsed time is derived from the wall clock, so a frozen tab can't drift", () => {
  let timer = createTimerState("focus", settings, 0);
  assert.equal(timer.targetSeconds, 1500);
  timer = start(timer, T0);

  // A backgrounded tab may tick zero times for minutes at a stretch.
  assert.equal(elapsedSeconds(timer, T0 + 600_000), 600);
  assert.equal(remainingSeconds(timer, T0 + 600_000), 900);
  assert.equal(isExpired(timer, T0 + 600_000), false);

  // Returning after the session should have ended reads as expired.
  assert.equal(remainingSeconds(timer, T0 + 3_000_000), 0);
  assert.equal(isExpired(timer, T0 + 3_000_000), true);
});

test("pausing banks elapsed time and stops the clock", () => {
  let timer = createTimerState("focus", settings, 0);
  timer = start(timer, T0);
  timer = pause(timer, T0 + 120_000);

  assert.equal(elapsedSeconds(timer, T0 + 120_000), 120);
  // An hour spent paused adds nothing.
  assert.equal(elapsedSeconds(timer, T0 + 3_720_000), 120);

  timer = start(timer, T0 + 3_720_000);
  assert.equal(elapsedSeconds(timer, T0 + 3_780_000), 180);
});

test("the long break lands on the fourth cycle", () => {
  let timer = createTimerState("focus", settings, 0);
  const kinds: string[] = [];
  for (let i = 0; i < 8; i += 1) {
    kinds.push(timer.kind);
    timer = advance(timer, settings, 0);
  }
  assert.deepEqual(kinds, [
    "focus",
    "shortBreak",
    "focus",
    "shortBreak",
    "focus",
    "shortBreak",
    "focus",
    "longBreak",
  ]);
});

test("a break is always followed by focus", () => {
  const onBreak = createTimerState("shortBreak", settings, 0);
  assert.equal(nextKind(onBreak, settings), "focus");
});

test("flow focus counts up and stops at the max work time", () => {
  const flow = { ...settings, timerStyle: "flow" as const };

  const timer = start(createTimerState("focus", flow, 0), T0);
  assert.equal(timer.countsUp, true);
  assert.equal(timer.targetSeconds, 60 * 60, "capped at maxWorkMinutes");

  assert.equal(isExpired(timer, T0 + 59 * 60_000), false);
  assert.equal(isExpired(timer, T0 + 61 * 60_000), true);

  // Breaks count down as normal and spend the bank.
  const onBreak = createTimerState("shortBreak", flow, 300);
  assert.equal(onBreak.countsUp, false);
  assert.equal(onBreak.targetSeconds, 300);
});

test("the break ladder splits the max work time into five bands", () => {
  assert.deepEqual(
    breakTierBands(60).map((band) => [band.from, band.to]),
    [
      [5, 12],
      [13, 24],
      [25, 36],
      [37, 48],
      [49, 60],
    ],
  );
  // The bands follow the max, so a 120-minute cap doubles their width.
  assert.deepEqual(
    breakTierBands(120).map((band) => [band.from, band.to]),
    [
      [5, 24],
      [25, 48],
      [49, 72],
      [73, 96],
      [97, 120],
    ],
  );
});

test("earned break steps up by band, and short work earns nothing", () => {
  const flow = { ...settings, timerStyle: "flow" as const };
  const earned = (minutes: number) => earnedBreakSeconds(minutes * 60, flow) / 60;

  assert.equal(earned(4), 0, "under the 5-minute floor");
  assert.equal(earned(5), 5, "first band opens at 5");
  assert.equal(earned(12), 5, "still the first band");
  assert.equal(earned(13), 10, "second band");
  assert.equal(earned(36), 15);
  assert.equal(earned(48), 20);
  assert.equal(earned(60), 25, "top band");
  assert.equal(earned(999), 25, "never exceeds the top band");

  // Classic mode never earns anything, whatever the tiers say.
  assert.equal(earnedBreakSeconds(3600, settings), 0);
});

test("settings saved under the old 'reverse' name come back as Flow", () => {
  // Payloads written before the rename still say "reverse". They are merged
  // over the defaults on read, so this is the only thing standing between an
  // existing user and a timer that silently reverts to Classic.
  const stored = {
    ...DEFAULT_SETTINGS,
    timerStyle: "reverse",
  } as unknown as typeof DEFAULT_SETTINGS;

  const migrated = normalizeSettings(stored);
  assert.equal(migrated.timerStyle, "flow");
  assert.deepEqual(migrated.breakTiers, DEFAULT_SETTINGS.breakTiers);

  // A current payload passes through untouched.
  assert.equal(
    normalizeSettings({ ...DEFAULT_SETTINGS, timerStyle: "classic" }).timerStyle,
    "classic",
  );
});

test("the companion dozes off during long focus and perks up on breaks", () => {
  // Idle or paused, whatever the kind.
  assert.equal(moodFor("focus", "idle", 0), "sweet");
  assert.equal(moodFor("shortBreak", "paused", 9999), "sweet");

  // Early focus is still bright-eyed; past 15 minutes it gives up waiting.
  assert.equal(moodFor("focus", "running", 60), "sweet");
  assert.equal(moodFor("focus", "running", 14 * 60), "sweet");
  assert.equal(moodFor("focus", "running", 15 * 60), "sleepy");

  // Any running break is the reunion.
  assert.equal(moodFor("shortBreak", "running", 5), "excited");
  assert.equal(moodFor("longBreak", "running", 5), "excited");
});

test("the status line matches what the timer is doing", () => {
  assert.deepEqual(statusFor("focus", "running"), {
    label: "Naghihintay",
    waiting: true,
  });
  assert.equal(statusFor("shortBreak", "running").waiting, false);
  assert.equal(statusFor("focus", "idle").label, "Always waiting");
});

test("the clock never renders negative time", () => {
  assert.equal(formatClock(0), "00:00");
  assert.equal(formatClock(59), "00:59");
  assert.equal(formatClock(1500), "25:00");
  assert.equal(formatClock(3661), "1:01:01");
  assert.equal(formatClock(-5), "00:00");
});
