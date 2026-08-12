"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import { useDocumentTitle, useTimerTick } from "@/lib/timer/useTimer";
import { cn } from "@/lib/cn";
import { GROUND, toneFor } from "@/lib/timer/tone";
import { BentoGrid } from "./BentoGrid";
import { FocusMode } from "./FocusMode";
import { FlowSettingsModal } from "./FlowSettingsModal";
import { MiniTimer } from "./MiniTimer";
import { SettingsDrawer } from "./SettingsDrawer";
import { SideNav, TopBar } from "./SideNav";
import { SupportModal } from "./SupportModal";

export function AppShell() {
  const hydrate = useAppStore((state) => state.hydrate);
  const hydrated = useAppStore((state) => state.hydrated);
  const collapsed = useAppStore((state) => state.settings.sidebarCollapsed);
  const now = useTimerTick();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [flowOpen, setFlowOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const timer = useAppStore((state) => state.timer);

  useDocumentTitle(now);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  // Both nav branches drive the same handlers, so the drawer and the modals
  // behave identically whichever one is on screen.
  const nav = {
    now,
    hydrated,
    onOpenSupport: () => setSupportOpen(true),
    onOpenSettings: () => setSettingsOpen(true),
  };

  return (
    <div
      style={{ background: GROUND[toneFor(timer.kind, timer.phase)] }}
      // The whole surface warms while you work and cools on a break. Slow on
      // purpose: it should read as the room changing, not a state flip.
      className="min-h-full transition-[background] duration-[600ms]"
    >
      <SideNav {...nav} />
      <TopBar {...nav} />

      {/* The left offset tracks the rail's width; below `lg` there is no rail. */}
      <main
        className={cn(
          "px-4 py-6 transition-[padding] duration-200",
          collapsed ? "lg:pl-22" : "lg:pl-64",
        )}
      >
        <div className="mx-auto max-w-7xl">
          <BentoGrid
            now={now}
            onOpenFlowSettings={() => setFlowOpen(true)}
            onEnterFocusMode={() => setFocusMode(true)}
          />
        </div>
      </main>

      <MiniTimer now={now} />
      <FocusMode now={now} open={focusMode} onClose={() => setFocusMode(false)} />

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onOpenFlowSettings={() => {
          setSettingsOpen(false);
          setFlowOpen(true);
        }}
      />
      <FlowSettingsModal open={flowOpen} onClose={() => setFlowOpen(false)} />
      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
    </div>
  );
}
