"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import { useDocumentTitle, useTimerTick } from "@/lib/timer/useTimer";
import { BentoGrid } from "./BentoGrid";
import { FlowSettingsModal } from "./FlowSettingsModal";
import { MiniTimer } from "./MiniTimer";
import { SettingsDrawer } from "./SettingsDrawer";
import { SideNav, TopBar } from "./SideNav";
import { SupportModal } from "./SupportModal";

export function AppShell() {
  const hydrate = useAppStore((state) => state.hydrate);
  const hydrated = useAppStore((state) => state.hydrated);
  const now = useTimerTick();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [flowOpen, setFlowOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  useDocumentTitle(now);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  // Both nav branches drive the same handlers, so the drawer and the modals
  // behave identically whichever one is on screen.
  const nav = {
    hydrated,
    onOpenSupport: () => setSupportOpen(true),
    onOpenSettings: () => setSettingsOpen(true),
  };

  return (
    <div className="min-h-full bg-cream">
      <SideNav {...nav} />
      <TopBar {...nav} />

      {/* The left offset matches the rail's width; below `lg` there is no rail. */}
      <main className="px-4 py-6 lg:pl-64">
        <div className="mx-auto max-w-7xl">
          <BentoGrid now={now} onOpenFlowSettings={() => setFlowOpen(true)} />
        </div>
      </main>

      <MiniTimer now={now} />

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
