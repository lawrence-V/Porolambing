"use client";

import Link from "next/link";
import { useAppStore } from "@/lib/store/useAppStore";
import { CREDIT } from "@/lib/support";
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

/**
 * Support is hidden for now. Flip this to bring the nav entries back — the
 * modal, the GCash panel and the link config are all still wired up.
 */
const SHOW_SUPPORT = false;

const navRow =
  "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-base font-semibold transition-colors hover:bg-ink/10";

/** The credit, shown at the foot of the rail and in the landing footer. */
export function Credit({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs leading-relaxed", className)}>
      {CREDIT.madeWithPrefix}
      <span className="text-orange" aria-label="love">
        ♥
      </span>
      {CREDIT.madeWithSuffix}
      <br />
      {CREDIT.copyright}
    </p>
  );
}

/** Fixed rail, `lg` and up. Below that `TopBar` renders instead. */
export function SideNav({ hydrated, onOpenSupport, onOpenSettings }: NavProps) {
  const collapsed = useAppStore((state) => state.settings.sidebarCollapsed);
  const updateSettings = useAppStore((state) => state.updateSettings);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden flex-col border-r-2 border-ink bg-white p-4 transition-[width] duration-200 lg:flex",
        collapsed ? "w-18 items-center" : "w-60",
      )}
    >
      <Link
        href="/"
        aria-label="Porolambing home"
        className={cn(
          "mb-6 flex items-center gap-2.5 rounded-2xl py-1 transition-opacity hover:opacity-80",
          collapsed ? "justify-center" : "px-1",
        )}
      >
        <CompanionAvatar className="h-9 w-9 shrink-0" />
        {!collapsed && <span className="font-display text-2xl">POROLAMBING</span>}
      </Link>

      <nav className="flex w-full flex-col gap-1">
        {SHOW_SUPPORT && (
          <button
            onClick={onOpenSupport}
            aria-label="Support Porolambing"
            title={collapsed ? "Support" : undefined}
            className={cn(navRow, collapsed && "justify-center px-0")}
          >
            <HeartIcon />
            {!collapsed && "Support"}
          </button>
        )}
        <button
          onClick={onOpenSettings}
          aria-label="Settings"
          title={collapsed ? "Settings" : undefined}
          className={cn(navRow, collapsed && "justify-center px-0")}
        >
          <GearIcon />
          {!collapsed && "Settings"}
        </button>
      </nav>

      <div className="mt-auto flex w-full flex-col gap-3">
        <button
          onClick={() =>
            updateSettings({ sidebarCollapsed: !collapsed })
          }
          aria-label={collapsed ? "Expand the sidebar" : "Collapse the sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
          className={cn(navRow, "text-ink/70", collapsed && "justify-center px-0")}
        >
          <svg
            viewBox="0 0 20 20"
            className={cn(
              "h-5 w-5 shrink-0 transition-transform",
              collapsed && "rotate-180",
            )}
            aria-hidden
          >
            <path
              d="M12 5 7 10l5 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {!collapsed && "Collapse"}
        </button>

        {!collapsed && (
          <div className="px-3">
            <span className="mono-label block opacity-70">
              {hydrated ? "Saved locally" : "Loading…"}
            </span>
            <Credit className="mt-3 opacity-70" />
          </div>
        )}
      </div>
    </aside>
  );
}

/** Compact bar below `lg`, where a fixed rail would eat the whole screen. */
export function TopBar({ hydrated, onOpenSupport, onOpenSettings }: NavProps) {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-ink bg-white/90 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <CompanionAvatar className="h-8 w-8" />
          <span className="font-display text-xl">POROLAMBING</span>
        </Link>
        <div className="flex items-center gap-1">
          <span className="mono-label hidden opacity-70 sm:inline">
            {hydrated ? "Saved locally" : "Loading…"}
          </span>
          {SHOW_SUPPORT && (
            <button
              onClick={onOpenSupport}
              aria-label="Support Porolambing"
              className={cn(navRow, "w-auto px-2.5")}
            >
              <HeartIcon />
            </button>
          )}
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
