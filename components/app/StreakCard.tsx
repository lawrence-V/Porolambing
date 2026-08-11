"use client";

import { useAppStore } from "@/lib/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

const MILESTONES = [3, 7, 14, 30];

export function StreakCard({ className }: { className?: string }) {
  const streak = useAppStore((state) => state.streak);
  const sessions = useAppStore((state) => state.sessions);

  const focusToday = sessions.filter((session) => {
    const isToday =
      new Date(session.endedAt).toDateString() === new Date().toDateString();
    return isToday && session.kind === "focus" && session.completed;
  }).length;

  const nextMilestone = MILESTONES.find((value) => value > streak.current);
  const celebrating = MILESTONES.includes(streak.current);

  return (
    <Card
      label="Streak"
      className={cn(celebrating ? "bg-yellow" : "bg-white", className)}
    >
      <div className="flex items-end gap-3">
        <span className="font-display text-6xl leading-none">
          {streak.current}
        </span>
        <span className="mb-1.5 text-base font-semibold opacity-70">
          {streak.current === 1 ? "day" : "days"}
        </span>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 border-t-2 border-dashed border-ink/15 pt-4">
        <div>
          <dt className="mono-label opacity-70">Best</dt>
          <dd className="font-display-wide text-xl">{streak.best}</dd>
        </div>
        <div>
          <dt className="mono-label opacity-70">Today</dt>
          <dd className="font-display-wide text-xl">{focusToday}</dd>
        </div>
      </dl>

      <p className="mt-4 text-sm opacity-70">
        {nextMilestone
          ? `${nextMilestone - streak.current} more ${
              nextMilestone - streak.current === 1 ? "day" : "days"
            } to ${nextMilestone}.`
          : "Wala nang milestone. Ikaw na."}
      </p>
    </Card>
  );
}
