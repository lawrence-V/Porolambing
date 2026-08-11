"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

export function TaskCard({ className }: { className?: string }) {
  const tasks = useAppStore((state) => state.tasks);
  const addTask = useAppStore((state) => state.addTask);
  const toggleTask = useAppStore((state) => state.toggleTask);
  const removeTask = useAppStore((state) => state.removeTask);
  const [draft, setDraft] = useState("");

  const remaining = tasks.filter((task) => !task.done).length;

  return (
    <Card
      label="Tasks"
      className={className}
      action={<span className="mono-label opacity-70">{remaining} left</span>}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          addTask(draft);
          setDraft("");
        }}
        className="mb-3 flex gap-2"
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ano gagawin mo?"
          className="h-9 w-full rounded-full border-2 border-ink bg-transparent px-3.5 text-base placeholder:text-ink/50 focus:outline-2 focus:outline-offset-2 focus:outline-orange"
        />
      </form>

      <ul className="flex-1 space-y-1.5 overflow-y-auto">
        {tasks.length === 0 && (
          <li className="py-6 text-center text-sm opacity-70">
            Wala pang task. Isa lang muna, okay?
          </li>
        )}
        {tasks.map((task) => (
          <li key={task.id} className="group flex items-center gap-2.5">
            <button
              onClick={() => toggleTask(task.id)}
              aria-label={task.done ? "Mark as not done" : "Mark as done"}
              className={cn(
                "grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 border-ink transition-colors",
                task.done ? "bg-green" : "bg-transparent hover:bg-ink/5",
              )}
            >
              {task.done && (
                <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
                  <path
                    d="M2 6.5 4.8 9 10 3.5"
                    fill="none"
                    stroke="var(--color-ink)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
            <span
              className={cn(
                "flex-1 text-base",
                task.done && "line-through opacity-40",
              )}
            >
              {task.title}
            </span>
            <button
              onClick={() => removeTask(task.id)}
              aria-label={`Remove ${task.title}`}
              className="shrink-0 px-1 text-sm opacity-0 transition-opacity group-hover:opacity-50 hover:!opacity-100"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
