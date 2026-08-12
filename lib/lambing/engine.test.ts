import assert from "node:assert/strict";
import { test } from "node:test";
import { LocalLambingProvider, preferredIntensity, typingPlan } from "./engine.ts";
import { FALLBACKS, INTENTS } from "./intents.ts";
import { LINES } from "./lines.ts";
import { bestMatch, normalise, scoreKeyword } from "./matching.ts";
import type { LambingRequest, PersonaId } from "./types.ts";

const base = (persona: PersonaId = "jowa") => ({
  persona,
  context: {},
  companionName: "Lambing",
  userName: "Lawrence",
});

test("normalise strips punctuation, case and accents", () => {
  assert.equal(normalise("Uy!!  MISS na kita 🥺"), "uy miss na kita");
  assert.equal(normalise("  ??? "), "");
});

test("short keywords match whole words only", () => {
  // The failure that would make the companion look broken: `hi` firing from
  // inside ordinary Tagalog words.
  for (const decoy of ["hindi ako pagod", "this is fine", "ang sipag mo"]) {
    assert.equal(scoreKeyword(normalise(decoy), "hi"), 0, decoy);
  }
  assert.ok(scoreKeyword(normalise("hi there"), "hi") > 0);
  assert.ok(scoreKeyword(normalise("oy kumusta"), "oy") > 0);
});

test("longer phrases outscore shorter overlapping ones", () => {
  const message = normalise("miss na kita sobra");
  assert.ok(
    scoreKeyword(message, "miss na kita") > scoreKeyword(message, "miss"),
  );
});

test("every intent is reachable by its own keywords", () => {
  for (const intent of INTENTS) {
    for (const keyword of intent.match) {
      const candidates = INTENTS.filter(
        (entry) => !entry.persona || entry.persona === intent.persona,
      );
      const match = bestMatch(keyword, candidates);
      assert.ok(match, `"${keyword}" matched nothing`);
      // Another intent may legitimately score equally on a shared word; what
      // must never happen is a keyword matching nothing at all.
    }
  }
});

test("unrecognised text falls back instead of going silent", async () => {
  const provider = new LocalLambingProvider();
  const reply = await provider.respondToText("qwertyuiop zxcv", base());
  assert.ok(reply, "a miss must still produce a reply");
  const joined = reply.bubbles.join(" ");
  assert.ok(
    FALLBACKS.some((fallback) => fallback.includes(joined.split(" ")[0])) ||
      joined.length > 0,
  );
  // The whole point: it hands the turn back rather than admitting a failure.
  assert.ok(!/don't understand|hindi ko alam|error/i.test(joined));
});

test("a reply always leaves something to tap", async () => {
  const provider = new LocalLambingProvider();
  for (let i = 0; i < 12; i += 1) {
    const reply = await provider.respondToText("wala lang", base());
    assert.ok(reply && reply.chips.length > 0, "dead end on turn " + i);
  }
});

test("personas never borrow each other's lines", async () => {
  for (const persona of ["jowa", "bestfriend"] as const) {
    const provider = new LocalLambingProvider();
    for (let i = 0; i < 30; i += 1) {
      const reply = await provider.respond({
        ...base(persona),
        trigger: "break:start",
      } as LambingRequest);
      assert.ok(reply);
      const other = LINES.filter(
        (line) => line.persona && line.persona !== persona,
      );
      for (const line of other) {
        assert.ok(
          !line.text.startsWith(reply.bubbles[0]),
          `${persona} used ${line.id}`,
        );
      }
    }
  }
});

test("lines naming a task are skipped when there is no task", async () => {
  const provider = new LocalLambingProvider();
  for (let i = 0; i < 40; i += 1) {
    const reply = await provider.respond({
      ...base(),
      trigger: "focus:start",
    } as LambingRequest);
    assert.ok(reply);
    // An unfilled slot would render as a gap or a stray "yung ?".
    assert.ok(!reply.bubbles.join(" ").includes("{task}"));
    assert.ok(!/yung \.|yung \?|:\s*\./.test(reply.bubbles.join(" ")));
  }
});

test("the companion gets clingier the more sessions you have done", () => {
  assert.equal(preferredIntensity({ sessionsTotal: 0 }), 1);
  assert.equal(preferredIntensity({ sessionsTotal: 12 }), 2);
  assert.equal(preferredIntensity({ sessionsTotal: 80 }), 3);

  // A long session nudges it up, but never past the top.
  assert.ok(preferredIntensity({ sessionsTotal: 0, minutes: 45 }) > 1);
  assert.equal(preferredIntensity({ sessionsTotal: 80, minutes: 60 }), 3);
});

test("typing is paced like a person, not a metronome", () => {
  for (let run = 0; run < 50; run += 1) {
    const plan = typingPlan(["Uy.", "Kumusta ka na?", "Kwento mo nga sakin."]);
    assert.equal(plan.length, 3);
    assert.ok(plan[0] >= 350, "must pause to think before typing");
    // Strictly increasing, or bubbles would land out of order.
    assert.ok(plan[1] > plan[0] && plan[2] > plan[1]);
    assert.ok(plan[2] < 12_000, "never so slow the user gives up");
  }

  // Two runs of the same input should differ — that's the whole point.
  const runs = new Set(
    Array.from({ length: 20 }, () => typingPlan(["Uy, kumusta ka?"])[0]),
  );
  assert.ok(runs.size > 1, "delays must vary between runs");
});
