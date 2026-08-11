"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { CompanionAvatar } from "./CompanionAvatar";

interface NavProps {
  hydrated: boolean;
  onOpenSupport: () => void;
  onOpenSettings: () => void;
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0" aria-hidden>
      <path
        d="M10 17s-6.5-4.2-6.5-8.4A3.7 3.7 0 0 1 10 6a3.7 3.7 0 0 1 6.5 2.6C16.5 12.8 10 17 10 17Z"
        fill="var(--color-blush)"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0" aria-hidden>
      <circle cx="10" cy="10" r="2.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M16.2 10c0-.5-.1-.9-.2-1.3l1.6-1.2-1.7-3-1.9.7a6.2 6.2 0 0 0-2.2-1.3L11.5 2h-3l-.3 1.9a6.2 6.2 0 0 0-2.2 1.3l-1.9-.7-1.7 3L4 8.7a6.4 6.4 0 0 0 0 2.6l-1.6 1.2 1.7 3 1.9-.7c.6.6 1.4 1 2.2 1.3l.3 1.9h3l.3-1.9c.8-.3 1.6-.7 2.2-1.3l1.9.7 1.7-3-1.6-1.2c.1-.4.2-.8.2-1.3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const navRow =
  "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-base font-semibold transition-colors hover:bg-ink/10";

/** Fixed rail, `lg` and up. Below that `TopBar` renders instead. */
export function SideNav({ hydrated, onOpenSupport, onOpenSettings }: NavProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r-2 border-ink bg-cream p-4 lg:flex">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2.5 rounded-2xl px-1 py-1 transition-opacity hover:opacity-80"
      >
        <CompanionAvatar className="h-9 w-9" />
        <span className="font-display text-2xl">POROLAMBING</span>
      </Link>

      <nav className="flex flex-col gap-1">
        <button onClick={onOpenSupport} className={navRow}>
          <HeartIcon />
          Support
        </button>
        <button onClick={onOpenSettings} className={navRow}>
          <GearIcon />
          Settings
        </button>
      </nav>

      <span className="mono-label mt-auto px-3 opacity-70">
        {hydrated ? "Saved locally" : "Loading…"}
      </span>
    </aside>
  );
}

/** Compact bar below `lg`, where a fixed rail would eat the whole screen. */
export function TopBar({ hydrated, onOpenSupport, onOpenSettings }: NavProps) {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-ink bg-cream/90 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <CompanionAvatar className="h-8 w-8" />
          <span className="font-display text-xl">POROLAMBING</span>
        </Link>
        <div className="flex items-center gap-1">
          <span className="mono-label hidden opacity-70 sm:inline">
            {hydrated ? "Saved locally" : "Loading…"}
          </span>
          <button
            onClick={onOpenSupport}
            aria-label="Support Porolambing"
            className={cn(navRow, "w-auto px-2.5")}
          >
            <HeartIcon />
          </button>
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className={cn(navRow, "w-auto px-2.5")}
          >
            <GearIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
