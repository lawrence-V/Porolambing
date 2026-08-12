"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import { PERSONAS } from "@/lib/lambing/types";
import {
  emitLambingEvent,
  type LambingTrigger,
  type TriggerContext,
} from "@/lib/timer/events";
import { cn } from "@/lib/cn";

/**
 * NOT MOUNTED. Kept for the next copy-writing session — render `<DevTriggerPanel />`
 * in `AppShell` to bring it back.
 *
 * Development-only. Fires each trigger on demand and switches persona, session
 * count and task in one click, because tuning `lines.ts` is impossible if
 * hearing a line means sitting through a real 25-minute session.
 */
const SAMPLES: Array<{ trigger: LambingTrigger; context: TriggerContext }> = [
  { trigger: "day:first-session", context: { minutes: 25 } },
  { trigger: "focus:start", context: { minutes: 25 } },
  { trigger: "focus:complete", context: { minutes: 25 } },
  { trigger: "focus:abandoned", context: { minutes: 7 } },
  { trigger: "focus:returned", context: { awayMinutes: 6 } },
  { trigger: "focus:long-haul", context: { minutes: 60 } },
  { trigger: "break:start", context: { minutes: 5, bankedBreakMinutes: 12 } },
  { trigger: "break:idle", context: {} },
  { trigger: "break:ending", context: {} },
  { trigger: "cycle:complete", context: { cycles: 4 } },
  { trigger: "user:returned", context: { daysAway: 3 } },
];

/** Totals to preview, since the session count sets the clinginess baseline. */
const SESSION_TOTALS = [0, 10, 50];

export function DevTriggerPanel() {
  const persona = useAppStore((state) => state.settings.persona);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const [open, setOpen] = useState(false);
  const [sessionsTotal, setSessionsTotal] = useState(10);
  const [task, setTask] = useState(false);

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-2">
      {open && (
        <div className="flex max-h-[70vh] w-64 flex-col gap-2 overflow-y-auto rounded-2xl border-2 border-ink bg-white p-3 shadow-[4px_4px_0_0_var(--color-ink)]">
          <div className="flex gap-1">
            {PERSONAS.map((entry) => (
              <button
                key={entry.id}
                onClick={() => updateSettings({ persona: entry.id })}
                className={cn(
                  "mono-label flex-1 rounded-lg border-2 border-ink px-2 py-1",
                  persona === entry.id ? "bg-ink text-cream" : "bg-transparent",
                )}
              >
                {entry.name}
              </button>
            ))}
          </div>

          <div className="flex gap-1">
            {SESSION_TOTALS.map((value) => (
              <button
                key={value}
                onClick={() => setSessionsTotal(value)}
                title={`Preview after ${value} focus sessions`}
                className={cn(
                  "mono-label flex-1 rounded-lg border-2 border-ink px-1 py-1",
                  sessionsTotal === value ? "bg-orange" : "bg-transparent",
                )}
              >
                {value}
              </button>
            ))}
          </div>

          <button
            onClick={() => setTask((value) => !value)}
            className={cn(
              "mono-label rounded-lg border-2 border-ink px-2 py-1",
              task ? "bg-yellow" : "bg-transparent",
            )}
          >
            {task ? "with task" : "no task"}
          </button>

          <div className="flex flex-col gap-0.5 border-t-2 border-dashed border-ink/20 pt-2">
            {SAMPLES.map((sample) => (
              <button
                key={sample.trigger}
                onClick={() =>
                  emitLambingEvent(sample.trigger, {
                    ...sample.context,
                    sessionsTotal,
                    task: task ? "thesis" : undefined,
                  })
                }
                className="rounded-lg px-2 py-1.5 text-left font-mono text-[11px] hover:bg-yellow"
              >
                {sample.trigger}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "mono-label rounded-full border-2 border-ink px-3 py-1.5",
          open ? "bg-ink text-cream" : "bg-yellow",
        )}
      >
        Lines
      </button>
    </div>
  );
}
