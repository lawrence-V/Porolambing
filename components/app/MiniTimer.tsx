"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import {
  elapsedSeconds,
  formatClock,
  KIND_LABEL,
  remainingSeconds,
} from "@/lib/timer/machine";
import type { SessionKind } from "@/lib/store/types";
import { cn } from "@/lib/cn";
import { CompanionAvatar } from "./CompanionAvatar";

const KIND_TINT: Record<SessionKind, string> = {
  focus: "var(--color-orange)",
  shortBreak: "var(--color-blush)",
  longBreak: "var(--color-mint)",
};

const MARGIN = 16;

/**
 * A draggable pill that keeps the clock visible while you scroll the app.
 * Deliberately not the Document Picture-in-Picture API — that only exists in
 * Chrome and Edge, and this has to work everywhere.
 */
export function MiniTimer({ now }: { now: number }) {
  const enabled = useAppStore((state) => state.settings.miniTimerEnabled);
  const timer = useAppStore((state) => state.timer);
  const startOrPause = useAppStore((state) => state.startOrPause);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [placed, setPlaced] = useState(false);
  const dragging = useRef<{ dx: number; dy: number } | null>(null);
  const node = useRef<HTMLDivElement>(null);

  // Park it bottom-right on first show, then leave it wherever it's dragged.
  useEffect(() => {
    if (!enabled || placed) return;
    const box = node.current?.getBoundingClientRect();
    setPosition({
      x: window.innerWidth - (box?.width ?? 210) - MARGIN,
      y: window.innerHeight - (box?.height ?? 60) - MARGIN,
    });
    setPlaced(true);
  }, [enabled, placed]);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (event: PointerEvent) => {
      const offset = dragging.current;
      if (!offset) return;
      const box = node.current?.getBoundingClientRect();
      const width = box?.width ?? 210;
      const height = box?.height ?? 60;
      // Clamp so it can never be dragged off-screen and stranded there.
      setPosition({
        x: Math.min(
          window.innerWidth - width - MARGIN,
          Math.max(MARGIN, event.clientX - offset.dx),
        ),
        y: Math.min(
          window.innerHeight - height - MARGIN,
          Math.max(MARGIN, event.clientY - offset.dy),
        ),
      });
    };
    const onUp = () => {
      dragging.current = null;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [enabled]);

  if (!enabled) return null;

  const seconds = timer.countsUp
    ? elapsedSeconds(timer, now)
    : remainingSeconds(timer, now);
  const running = timer.phase === "running";

  return (
    <div
      ref={node}
      style={{ left: position.x, top: position.y }}
      className={cn(
        "fixed z-50 flex select-none items-center gap-2.5 rounded-full",
        "border-2 border-ink bg-cream py-2 pl-2.5 pr-3",
        "shadow-[4px_4px_0_0_var(--color-ink)]",
        !placed && "invisible",
      )}
    >
      <button
        onPointerDown={(event) => {
          const box = event.currentTarget.parentElement!.getBoundingClientRect();
          dragging.current = {
            dx: event.clientX - box.left,
            dy: event.clientY - box.top,
          };
        }}
        aria-label="Drag the mini timer"
        className="cursor-grab active:cursor-grabbing"
      >
        <CompanionAvatar className="h-7 w-7" />
      </button>

      <span className="leading-none">
        <span className="tabular font-display-wide block text-xl">
          {formatClock(seconds)}
        </span>
        <span className="mono-label opacity-70">{KIND_LABEL[timer.kind]}</span>
      </span>

      <button
        onClick={startOrPause}
        aria-label={running ? "Pause timer" : "Start timer"}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-ink transition-transform hover:-translate-y-0.5"
        style={{ background: running ? "transparent" : KIND_TINT[timer.kind] }}
      >
        {running ? (
          <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
            <g fill="var(--color-ink)">
              <rect x="2" y="1.5" width="3" height="9" rx="1" />
              <rect x="7" y="1.5" width="3" height="9" rx="1" />
            </g>
          </svg>
        ) : (
          <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
            <path d="M3 1.8 10 6l-7 4.2Z" fill="var(--color-ink)" />
          </svg>
        )}
      </button>
    </div>
  );
}
