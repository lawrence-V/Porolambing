"use client";

import { createContext, useContext, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Rendered in the card's top-left as a mono micro-label. */
  label?: string;
  /** Rendered opposite the label. */
  action?: ReactNode;
  /**
   * Drag affordance, rendered before the label. Cards are full of buttons and
   * inputs, so dragging is deliberately confined to this handle rather than
   * the whole card.
   */
  handle?: ReactNode;
}

/**
 * Lets the sortable wrapper inject a drag handle into whatever card it wraps,
 * so individual cards don't each have to thread a `handle` prop through.
 */
const DragHandleContext = createContext<ReactNode>(null);

export function DragHandleProvider({
  handle,
  children,
}: {
  handle: ReactNode;
  children: ReactNode;
}) {
  return (
    <DragHandleContext.Provider value={handle}>
      {children}
    </DragHandleContext.Provider>
  );
}

export function Card({ children, className, label, action, handle }: CardProps) {
  const injected = useContext(DragHandleContext);
  const resolvedHandle = handle ?? injected;

  return (
    <section
      className={cn(
        "relative flex h-full flex-col rounded-3xl border-2 border-ink bg-white p-5",
        "shadow-[4px_4px_0_0_var(--color-ink)]",
        className,
      )}
    >
      {(label || action || resolvedHandle) && (
        <header className="mb-4 flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2">
            {resolvedHandle}
            {label && <span className="mono-label opacity-70">{label}</span>}
          </span>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
