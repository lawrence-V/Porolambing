"use client";

import { useAppStore } from "@/lib/store/useAppStore";
import { KIND_LABEL } from "@/lib/timer/machine";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

const KIND_DOT: Record<string, string> = {
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

  const today = new Date().toDateString();
  const todays = sessions
    .filter((session) => new Date(session.endedAt).toDateString() === today)
    .slice()
    .reverse();

  const focusMinutes = Math.round(
    todays
      .filter((session) => session.kind === "focus")
      .reduce((total, session) => total + session.seconds, 0) / 60,
  );

  return (
    <Card
      label="Today"
      className={className}
      action={
        <span className="mono-label opacity-70">{focusMinutes}m focused</span>
      }
    >
      <ul className="flex-1 space-y-2 overflow-y-auto">
        {todays.length === 0 && (
          <li className="py-6 text-center text-sm opacity-70">
            Wala pa. Simulan na natin?
          </li>
        )}
        {todays.map((session) => (
          <li key={session.id} className="flex items-center gap-2.5 text-base">
            <span
              className={cn(
                "h-2.5 w-2.5 shrink-0 rounded-full border-2 border-ink",
                KIND_DOT[session.kind],
                !session.completed && "opacity-30",
              )}
            />
            <span className="flex-1">{KIND_LABEL[session.kind]}</span>
            <span className="tabular text-sm opacity-70">
              {Math.max(1, Math.round(session.seconds / 60))}m
            </span>
            <span className="mono-label w-20 shrink-0 whitespace-nowrap text-right opacity-70">
              {timeLabel(session.endedAt)}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
