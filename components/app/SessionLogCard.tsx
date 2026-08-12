"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import type { SessionKind } from "@/lib/store/types";
import { focusSeconds, formatDuration, sessionsOn } from "@/lib/stats";
import { KIND_LABEL } from "@/lib/timer/machine";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

/** How many rows show before the expander. */
const PREVIEW_ROWS = 4;

const KIND_DOT: Record<SessionKind, string> = {
  focus: "bg-orange",
  shortBreak: "bg-blush",
  longBreak: "bg-mint",
};

function timeLabel(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function SessionLogCard({ className }: { className?: string }) {
  const sessions = useAppStore((state) => state.sessions);
  const [expanded, setExpanded] = useState(false);

  const todays = sessionsOn(sessions);
  const newestFirst = [...todays].reverse();
  const shown = expanded ? newestFirst : newestFirst.slice(0, PREVIEW_ROWS);
  const focused = focusSeconds(todays);

  return (
    <Card
      weight="quiet"
      label="Today"
      className={className}
      action={
        <span className="mono-label opacity-70">
          {formatDuration(focused)} focused
        </span>
      }
    >
      {todays.length === 0 ? (
        <p className="py-6 text-center text-sm opacity-70">
          Wala pa. Simulan na natin?
        </p>
      ) : (
        <>
          <ul
            className={cn(
              "space-y-2",
              // Even fully expanded the card can't run away.
              expanded && "max-h-64 overflow-y-auto pr-1",
            )}
          >
            {shown.map((session) => (
              <li
                key={session.id}
                className="flex items-center gap-2.5 text-base"
              >
                <span
                  className={cn(
                    "h-2.5 w-2.5 shrink-0 rounded-full border-2 border-ink",
                    KIND_DOT[session.kind],
                    !session.completed && "opacity-30",
                  )}
                />
                <span className="flex-1 truncate">
                  {KIND_LABEL[session.kind]}
                  {session.taskTitle && (
                    <span className="opacity-70"> · {session.taskTitle}</span>
                  )}
                </span>
                <span className="tabular text-sm opacity-70">
                  {Math.max(1, Math.round(session.seconds / 60))}m
                </span>
                <span className="mono-label w-20 shrink-0 whitespace-nowrap text-right opacity-70">
                  {timeLabel(session.endedAt)}
                </span>
              </li>
            ))}
          </ul>

          {newestFirst.length > PREVIEW_ROWS && (
            <button
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              className="mono-label mt-3 self-center rounded-full px-3 py-1.5 opacity-70 transition-colors hover:bg-ink/5 hover:opacity-100"
            >
              {expanded ? "Show less ▴" : `Show all ${newestFirst.length} ▾`}
            </button>
          )}
        </>
      )}
    </Card>
  );
}
