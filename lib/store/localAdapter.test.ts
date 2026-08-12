import assert from "node:assert/strict";
import { test } from "node:test";
import { migrate } from "./localAdapter.ts";
import {
  CURRENT_SCHEMA_VERSION,
  createDefaultState,
  type PersistedState,
} from "./types.ts";

/**
 * Migrations are the one place a bug costs a real user their history: an
 * unhandled version resets to defaults rather than running on a shape we
 * can't read.
 */

function v1State(): PersistedState & { streak: unknown } {
  return {
    ...createDefaultState(),
    schemaVersion: 1,
    tasks: [{ id: "t1", title: "thesis", done: false, createdAt: 1 }],
    streak: { current: 7, best: 12, lastActiveDay: "2026-08-11" },
  };
}

test("the v1 payload survives the streak removal with its data intact", () => {
  const migrated = migrate(v1State());

  assert.equal(migrated.schemaVersion, CURRENT_SCHEMA_VERSION);
  assert.deepEqual(
    migrated.tasks.map((task) => task.title),
    ["thesis"],
    "a reset to defaults would have emptied this",
  );
  assert.ok(
    !("streak" in migrated),
    "the dead key must be dropped, not carried into every future write",
  );
});

test("an already-current payload passes through untouched", () => {
  const current = createDefaultState();
  assert.deepEqual(migrate(current), current);
});

test("a version with no path forward resets rather than guessing", () => {
  const unknown = { ...createDefaultState(), schemaVersion: 0 };
  assert.deepEqual(migrate(unknown), createDefaultState());
});
