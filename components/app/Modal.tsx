"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Centred dialog shared by the flow-timer and support panels. The settings
 * drawer stays its own thing — it slides from the edge and behaves differently.
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // Stop the page behind the dialog from scrolling with it.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 grid place-items-center p-4">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-ink/50 animate-[bubble_180ms_ease-out_both]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden",
          "rounded-3xl border-2 border-ink bg-cream shadow-[6px_6px_0_0_var(--color-ink)]",
          "animate-[bubble_220ms_var(--ease-back)_both]",
          className,
        )}
      >
        <header className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <h2 className="font-display text-3xl">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm opacity-70">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-lg transition-colors hover:bg-ink/10"
          >
            ✕
          </button>
        </header>

        {/* No bottom padding: a dialog with a `sticky bottom-0` footer needs
            the scrollport to end exactly where the footer sits, or content
            shows through the gap underneath it. Dialogs add their own. */}
        <div className="flex-1 overflow-y-auto px-6 pt-5">{children}</div>

        {footer && (
          <footer className="flex gap-3 border-t-2 border-ink/10 px-6 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
