"use client";

import { useAppStore } from "@/lib/store/useAppStore";
import { dayKey } from "@/lib/date";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

/**
 * Focus minutes per day across the last seven — a single series, so it takes a
 * single hue. `--color-green-deep` is the one step in the palette that clears
 * 3:1 against a white card; the brand green sits at 2.9 and would have needed
 * a contrast exemption.
 *
 * Today is marked with an ink ring, a bold label and a permanent value — never
 * with a second colour. Green against the orange accent measures ΔE 2.1 under
 * protanopia, i.e. the same colour to a red-green colourblind reader.
 */

const DAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"];

const PLOT_HEIGHT = 92;

/** Nonzero days always show something, so "a little" never reads as "none". */
const MIN_BAR = 4;

interface DayBucket {
  key: string;
  label: string;
  weekday: string;
  minutes: number;
  isToday: boolean;
}

function buildWeek(
  sessions: Array<{ kind: string; endedAt: number; seconds: number }>,
): DayBucket[] {
  const totals = new Map<string, number>();
  for (const session of sessions) {
    if (session.kind !== "focus") continue;
    const key = dayKey(session.endedAt);
    totals.set(key, (totals.get(key) ?? 0) + session.seconds);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const key = dayKey(date.getTime());
    return {
      key,
      label: date.toLocaleDateString(undefined, {
        weekday: "short",
        day: "numeric",
      }),
      weekday: DAY_INITIALS[date.getDay()],
      minutes: Math.round((totals.get(key) ?? 0) / 60),
      isToday: index === 6,
    };
  });
}

export function WeekCard({ className }: { className?: string }) {
  const sessions = useAppStore((state) => state.sessions);
  const week = buildWeek(sessions);

  const peak = Math.max(...week.map((day) => day.minutes));
  const total = week.reduce((sum, day) => sum + day.minutes, 0);
  const hasData = total > 0;

  return (
    <Card
      weight="quiet"
      label="Last 7 days"
      className={className}
      action={
        <span className="mono-label opacity-70">
          {Math.floor(total / 60)}h {total % 60}m
        </span>
      }
    >
      <div
        className="flex flex-1 items-end gap-1.5"
        style={{ minHeight: PLOT_HEIGHT + 34 }}
        role="img"
        aria-label={
          hasData
            ? `Focus minutes per day: ${week
                .map((day) => `${day.label}, ${day.minutes} minutes`)
                .join("; ")}`
            : "No focus sessions in the last seven days"
        }
      >
        {week.map((day) => {
          const height = day.minutes
            ? Math.max(MIN_BAR, (day.minutes / peak) * PLOT_HEIGHT)
            : 0;
          // The peak of the week and today are the two values worth reading
          // exactly; labelling all seven would just be noise.
          const showValue = day.minutes > 0 && (day.isToday || day.minutes === peak);

          return (
            <div
              key={day.key}
              className="group relative flex flex-1 flex-col items-center gap-1.5"
            >
              <div
                className="flex w-full items-end justify-center"
                style={{ height: PLOT_HEIGHT }}
              >
                {day.minutes > 0 ? (
                  <div
                    className={cn(
                      "w-full rounded-t transition-[height] duration-500 ease-out-expo",
                      day.isToday && "ring-2 ring-ink",
                    )}
                    style={{ height, background: "var(--color-green-deep)" }}
                  />
                ) : (
                  // An empty rail keeps the day present instead of a gap.
                  <div className="h-1 w-full rounded-full bg-ink/10" />
                )}
              </div>

              <span
                className={cn(
                  "mono-label leading-none",
                  day.isToday ? "font-bold opacity-100" : "opacity-70",
                )}
              >
                {day.weekday}
              </span>

              <span
                className={cn(
                  "tabular text-xs leading-none",
                  showValue ? "opacity-70" : "opacity-0",
                )}
              >
                {day.minutes}m
              </span>

              {/* Exact value on hover, since only two are labelled outright. */}
              <span
                role="tooltip"
                className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border-2 border-ink bg-white px-2.5 py-1.5 text-sm opacity-0 shadow-[2px_2px_0_0_var(--color-ink)] transition-opacity group-hover:opacity-100"
              >
                {day.label} · {day.minutes}m
              </span>
            </div>
          );
        })}
      </div>

      {!hasData && (
        <p className="mt-1 text-center text-sm opacity-70">
          Wala pang focus this week. Simulan na natin?
        </p>
      )}
    </Card>
  );
}
