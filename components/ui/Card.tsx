"use client";

import {
  createContext,
  useContext,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

/**
 * How much of the page's attention a card is asking for. Six identical white
 * rectangles gave the timer the same weight as the log; this is what lets the
 * grid have a hierarchy.
 */
export type CardWeight = "hero" | "normal" | "quiet";

interface CardProps {
  children: ReactNode;
  weight?: CardWeight;
  /** Overrides the white fill — used by the hero timer's session colour. */
  fill?: string;
  className?: string;
  /** Rendered in the card's top-left as a mono micro-label. */
  label?: string;
  /** Rendered opposite the label. */
  action?: ReactNode;
}

/**
 * Chrome the bento grid injects into whatever card it wraps, so individual
 * cards don't each thread drag and hide props through.
 *
 * `dragProps` are spread onto the span holding the grip *and* the label,
 * rather than onto the grip alone: a 20x20 grip on a 532px header was far too
 * small a target to grab, and labels aren't interactive so nothing conflicts.
 */
export interface CardChrome {
  dragProps: HTMLAttributes<HTMLElement>;
  onHide?: () => void;
  hideLabel?: string;
}

const CardChromeContext = createContext<CardChrome | null>(null);

export function CardChromeProvider({
  chrome,
  children,
}: {
  chrome: CardChrome;
  children: ReactNode;
}) {
  return (
    <CardChromeContext.Provider value={chrome}>
      {children}
    </CardChromeContext.Provider>
  );
}

function GripIcon() {
  return (
    <svg viewBox="0 0 12 12" className="h-3.5 w-3.5 shrink-0" aria-hidden>
      <g fill="currentColor">
        <circle cx="3.5" cy="2.5" r="1.1" />
        <circle cx="8.5" cy="2.5" r="1.1" />
        <circle cx="3.5" cy="6" r="1.1" />
        <circle cx="8.5" cy="6" r="1.1" />
        <circle cx="3.5" cy="9.5" r="1.1" />
        <circle cx="8.5" cy="9.5" r="1.1" />
      </g>
    </svg>
  );
}

const WEIGHT: Record<CardWeight, string> = {
  hero: "p-6 shadow-[6px_6px_0_0_var(--color-ink)]",
  normal: "p-5 shadow-[3px_3px_0_0_var(--color-ink)]",
  quiet: "p-5 shadow-[2px_2px_0_0_var(--color-ink)]",
};

export function Card({
  children,
  weight = "normal",
  fill,
  className,
  label,
  action,
}: CardProps) {
  const chrome = useContext(CardChromeContext);

  return (
    <section
      style={fill ? { background: fill } : undefined}
      className={cn(
        "relative flex h-full flex-col rounded-3xl border-2 border-ink",
        // A 600ms fade so the session colour breathes in rather than flicks.
        "transition-[background-color,background] duration-[600ms]",
        !fill && "bg-white",
        WEIGHT[weight],
        className,
      )}
    >
      {(label || action || chrome) && (
        <header className="mb-4 flex items-center justify-between gap-3">
          {chrome ? (
            <span
              {...chrome.dragProps}
              className={cn(
                "group/grip -my-1 -ml-1 flex min-w-0 cursor-grab items-center gap-2",
                "rounded-lg py-1 pl-1 pr-2 text-ink/40 transition-colors",
                "hover:bg-ink/5 hover:text-ink/70 active:cursor-grabbing",
                // Without this the browser claims the gesture for scrolling
                // and the drag never starts on a touch device.
                "touch-none select-none",
              )}
            >
              <GripIcon />
              {label && (
                <span className="mono-label truncate text-ink opacity-70">
                  {label}
                </span>
              )}
            </span>
          ) : (
            label && <span className="mono-label opacity-70">{label}</span>
          )}

          <span className="flex shrink-0 items-center gap-2">
            {action}
            {chrome?.onHide && (
              <button
                onClick={chrome.onHide}
                aria-label={chrome.hideLabel ?? "Hide card"}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink/40 transition-colors hover:bg-ink/10 hover:text-ink"
              >
                <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
                  <path
                    d="M2.5 2.5 9.5 9.5M9.5 2.5 2.5 9.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </span>
        </header>
      )}
      {children}
    </section>
  );
}
