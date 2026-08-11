"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * A CSS-drawn phone: bezel, Dynamic Island, status bar, home indicator. The
 * screen is a real scroll container, so whatever gets rendered into it behaves
 * exactly as it would on a device.
 */
export function PhoneFrame({
  children,
  className,
  statusTime = "9:41",
}: {
  children: ReactNode;
  className?: string;
  statusTime?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[390/844] w-[300px] rounded-[3rem] border-2 border-ink bg-ink p-2.5",
        "shadow-[0_30px_60px_-12px_rgba(29,28,27,0.45)]",
        className,
      )}
    >
      {/* side buttons */}
      <span
        aria-hidden
        className="absolute -left-1 top-[18%] h-8 w-1 rounded-l-sm bg-ink"
      />
      <span
        aria-hidden
        className="absolute -left-1 top-[27%] h-14 w-1 rounded-l-sm bg-ink"
      />
      <span
        aria-hidden
        className="absolute -right-1 top-[24%] h-20 w-1 rounded-r-sm bg-ink"
      />

      <div className="relative h-full w-full overflow-hidden rounded-[2.4rem] bg-cream">
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 pt-3 text-[11px] font-semibold text-ink">
          <span className="tabular">{statusTime}</span>
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 18 12" className="h-2.5" aria-hidden>
              <g fill="currentColor">
                <rect x="0" y="8" width="3" height="4" rx="1" />
                <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
                <rect x="10" y="3" width="3" height="9" rx="1" />
                <rect x="15" y="0" width="3" height="12" rx="1" opacity="0.35" />
              </g>
            </svg>
            <svg viewBox="0 0 24 12" className="h-2.5" aria-hidden>
              <rect
                x="0.75"
                y="0.75"
                width="19"
                height="10.5"
                rx="3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <rect x="2.5" y="2.5" width="14" height="7" rx="1.6" fill="currentColor" />
              <path d="M21.5 4.5v3a2 2 0 0 0 0-3Z" fill="currentColor" />
            </svg>
          </span>
        </div>

        <span
          aria-hidden
          className="absolute left-1/2 top-2.5 z-30 h-6 w-24 -translate-x-1/2 rounded-full bg-ink"
        />

        <div className="h-full overflow-hidden pt-11">{children}</div>

        <span
          aria-hidden
          className="absolute bottom-1.5 left-1/2 z-30 h-1 w-28 -translate-x-1/2 rounded-full bg-ink/70"
        />
      </div>
    </div>
  );
}
