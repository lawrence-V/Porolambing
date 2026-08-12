"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import type { Task } from "@/lib/store/types";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

/**
 * The open list scrolls past this. It's a `max-height` rather than a row cap
 * because the card sits in an `auto-rows-min` grid row: without a bound the
 * card grows to fit every child and the `overflow-y-auto` never fires — 15
 * tasks made a 640px card and a 1429px page on a 950px viewport.
 */
const OPEN_LIST_MAX = "max-h-56";

function CheckIcon() {
  return (
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
  );
}

function TaskRow({
  task,
  active,
  onToggle,
  onActivate,
  onRemove,
  rowRef,
}: {
  task: Task;
  active: boolean;
  onToggle: () => void;
  onActivate: () => void;
  onRemove: () => void;
  rowRef?: (node: HTMLLIElement | null) => void;
}) {
  return (
    <li ref={rowRef} className="group flex items-center gap-2.5">
      <button
        onClick={onToggle}
        aria-label={task.done ? "Mark as not done" : "Mark as done"}
        className={cn(
          "grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 border-ink transition-colors",
          task.done ? "bg-green" : "bg-transparent hover:bg-ink/5",
        )}
      >
        {task.done && <CheckIcon />}
      </button>

      {/* The row already has a checkbox and a remove ×, so the title itself is
          the control for "this is what I'm working on" — a fourth button would
          crowd it. */}
      <button
        onClick={onActivate}
        disabled={task.done}
        aria-pressed={active}
        title={
          task.done ? undefined : active ? "Stop working on this" : "Work on this"
        }
        className={cn(
          // Clamped rather than truncated: one cut-off line of a long title is
          // unreadable, and unbounded wrapping is what made the card grow.
          "min-w-0 flex-1 rounded-lg px-1.5 py-0.5 text-left text-base transition-colors",
          "line-clamp-2",
          task.done ? "cursor-default line-through opacity-40" : "hover:bg-ink/5",
          active && "bg-orange/25 font-semibold",
        )}
      >
        {task.title}
      </button>

      {/* Quiet but always drawn. Revealing it on hover meant it did not exist
          at all on a touch screen, which is where a long list is worst. */}
      <button
        onClick={onRemove}
        aria-label={`Remove ${task.title}`}
        className="shrink-0 px-1 text-sm opacity-40 transition-opacity group-hover:opacity-70 hover:opacity-100!"
      >
        ×
      </button>
    </li>
  );
}

export function TaskCard({ className }: { className?: string }) {
  const tasks = useAppStore((state) => state.tasks);
  const addTask = useAppStore((state) => state.addTask);
  const toggleTask = useAppStore((state) => state.toggleTask);
  const removeTask = useAppStore((state) => state.removeTask);
  const clearDoneTasks = useAppStore((state) => state.clearDoneTasks);
  const activeTaskId = useAppStore((state) => state.activeTaskId);
  const setActiveTask = useAppStore((state) => state.setActiveTask);
  const [draft, setDraft] = useState("");
  const [showDone, setShowDone] = useState(false);
  const activeRowRef = useRef<HTMLLIElement | null>(null);

  // Finished work is still a record of the day, so it stays — but it collects
  // at the bottom and would otherwise push the live list out of reach.
  const open = tasks.filter((task) => !task.done);
  const done = tasks.filter((task) => task.done);

  // The list scrolls now, so the task you're working on can sit outside it.
  useEffect(() => {
    activeRowRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeTaskId]);

  return (
    <Card
      weight="quiet"
      label="Tasks"
      className={className}
      action={<span className="mono-label opacity-70">{open.length} left</span>}
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

      {tasks.length === 0 ? (
        <p className="py-6 text-center text-sm opacity-70">
          Wala pang task. Isa lang muna, okay?
        </p>
      ) : (
        <>
          {open.length === 0 ? (
            <p className="py-4 text-center text-sm opacity-70">
              Tapos lahat. Ang galing mo.
            </p>
          ) : (
            <ul className={cn("space-y-1.5 overflow-y-auto pr-1", OPEN_LIST_MAX)}>
              {open.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  active={activeTaskId === task.id}
                  rowRef={
                    activeTaskId === task.id
                      ? (node) => {
                          activeRowRef.current = node;
                        }
                      : undefined
                  }
                  onToggle={() => toggleTask(task.id)}
                  onActivate={() =>
                    setActiveTask(activeTaskId === task.id ? null : task.id)
                  }
                  onRemove={() => removeTask(task.id)}
                />
              ))}
            </ul>
          )}

          {done.length > 0 && (
            <div className="mt-3 border-t-2 border-dashed border-ink/15 pt-2">
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => setShowDone((value) => !value)}
                  aria-expanded={showDone}
                  className="mono-label rounded-full px-2 py-1 opacity-70 transition-colors hover:bg-ink/5 hover:opacity-100"
                >
                  {done.length} done {showDone ? "▴" : "▾"}
                </button>
                {showDone && (
                  <button
                    onClick={clearDoneTasks}
                    className="mono-label rounded-full px-2 py-1 opacity-70 transition-colors hover:bg-blush/40 hover:opacity-100"
                  >
                    Clear
                  </button>
                )}
              </div>

              {showDone && (
                <ul className="mt-2 max-h-40 space-y-1.5 overflow-y-auto pr-1">
                  {done.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      active={false}
                      onToggle={() => toggleTask(task.id)}
                      onActivate={() => {}}
                      onRemove={() => removeTask(task.id)}
                    />
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </Card>
  );
}
