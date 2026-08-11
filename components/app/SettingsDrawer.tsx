"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import {
  notificationPermission,
  playChime,
  requestNotificationPermission,
  serverNotificationPermission,
  subscribeToPermission,
} from "@/lib/notify";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  onOpenFlowSettings: () => void;
}

function NumberField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (Number.isFinite(next)) {
            onChange(Math.min(max, Math.max(min, next)));
          }
        }}
        className="tabular h-9 w-20 rounded-full border-2 border-ink bg-transparent px-3 text-right text-sm focus:outline-2 focus:outline-offset-2 focus:outline-orange"
      />
    </label>
  );
}

function Toggle({
  label,
  hint,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={cn(
        "flex w-full items-center justify-between gap-4 py-2.5 text-left",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      <span>
        <span className="block text-sm">{label}</span>
        {hint && <span className="block text-sm opacity-70">{hint}</span>}
      </span>
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border-2 border-ink transition-colors",
          checked ? "bg-green" : "bg-transparent",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-ink transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}

export function SettingsDrawer({
  open,
  onClose,
  onOpenFlowSettings,
}: SettingsDrawerProps) {
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const resetLayout = useAppStore((state) => state.resetLayout);
  const clearAll = useAppStore((state) => state.clearAll);
  const permission = useSyncExternalStore(
    subscribeToPermission,
    notificationPermission,
    serverNotificationPermission,
  );

  async function toggleNotifications(enabled: boolean) {
    if (!enabled) {
      updateSettings({ notificationsEnabled: false });
      return;
    }
    updateSettings({
      notificationsEnabled: await requestNotificationPermission(),
    });
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          "fixed inset-0 z-40 bg-ink/40 transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        aria-label="Settings"
        aria-hidden={!open}
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col overflow-y-auto",
          "border-l-2 border-ink bg-cream p-6 transition-transform duration-300 ease-out-expo",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-3xl">Settings</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close settings">
            ✕
          </Button>
        </header>

        <div className="divide-y-2 divide-dashed divide-ink/15">
          <div className="pb-3">
            <p className="mono-label mb-2 opacity-70">Durations</p>
            <NumberField
              label="Focus (min)"
              value={settings.focusMinutes}
              min={1}
              max={180}
              onChange={(focusMinutes) => updateSettings({ focusMinutes })}
            />
            <NumberField
              label="Short break (min)"
              value={settings.shortBreakMinutes}
              min={1}
              max={60}
              onChange={(shortBreakMinutes) =>
                updateSettings({ shortBreakMinutes })
              }
            />
            <NumberField
              label="Long break (min)"
              value={settings.longBreakMinutes}
              min={1}
              max={120}
              onChange={(longBreakMinutes) =>
                updateSettings({ longBreakMinutes })
              }
            />
            <NumberField
              label="Cycles before long break"
              value={settings.cyclesBeforeLongBreak}
              min={2}
              max={12}
              onChange={(cyclesBeforeLongBreak) =>
                updateSettings({ cyclesBeforeLongBreak })
              }
            />
          </div>

          <div className="py-3">
            <p className="mono-label mb-2 opacity-70">Style</p>
            <div className="mb-2 flex gap-1 rounded-full border-2 border-ink p-1">
              {(["classic", "flow"] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => updateSettings({ timerStyle: style })}
                  className={cn(
                    "flex-1 rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors",
                    settings.timerStyle === style
                      ? "bg-ink text-cream"
                      : "text-ink/60 hover:text-ink",
                  )}
                >
                  {style}
                </button>
              ))}
            </div>
            {settings.timerStyle === "classic" ? (
              <p className="mb-2 text-sm opacity-70">
                Count down a fixed session.
              </p>
            ) : (
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm opacity-70">
                  Work counts up to {settings.maxWorkMinutes} min and earns
                  break time by band.
                </p>
                <Button variant="outline" size="sm" onClick={onOpenFlowSettings}>
                  Configure
                </Button>
              </div>
            )}
            <Toggle
              label="Auto-start next session"
              checked={settings.autoStartNext}
              onChange={(autoStartNext) => updateSettings({ autoStartNext })}
            />
            <Toggle
              label="Mini timer"
              hint="A draggable clock that stays visible while you scroll."
              checked={settings.miniTimerEnabled}
              onChange={(miniTimerEnabled) =>
                updateSettings({ miniTimerEnabled })
              }
            />
          </div>

          <div className="py-3">
            <p className="mono-label mb-2 opacity-70">Alerts</p>
            <Toggle
              label="Chime when a session ends"
              hint="Skipping a session stays silent."
              checked={settings.soundEnabled}
              onChange={(soundEnabled) => {
                updateSettings({ soundEnabled });
                // Turning it on is a user gesture, so it can also serve as
                // the preview and unlock audio at the same time.
                if (soundEnabled) playChime("focus");
              }}
            />
            <Toggle
              label="Browser notification"
              hint={
                permission === "denied"
                  ? "Blocked in your browser settings."
                  : permission === "unsupported"
                    ? "Not supported in this browser."
                    : "Only when this tab is in the background."
              }
              checked={settings.notificationsEnabled}
              disabled={permission === "denied" || permission === "unsupported"}
              onChange={(enabled) => void toggleNotifications(enabled)}
            />
          </div>

          <div className="py-3">
            <p className="mono-label mb-2 opacity-70">Names</p>
            <label className="flex items-center justify-between gap-4 py-2.5">
              <span className="text-sm">Companion</span>
              <input
                value={settings.companionName}
                onChange={(event) =>
                  updateSettings({ companionName: event.target.value })
                }
                className="h-9 w-36 rounded-full border-2 border-ink bg-transparent px-3 text-sm focus:outline-2 focus:outline-offset-2 focus:outline-orange"
              />
            </label>
            <label className="flex items-center justify-between gap-4 py-2.5">
              <span className="text-sm">Calls you</span>
              <input
                value={settings.userName}
                placeholder="ikaw"
                onChange={(event) =>
                  updateSettings({ userName: event.target.value })
                }
                className="h-9 w-36 rounded-full border-2 border-ink bg-transparent px-3 text-sm placeholder:text-ink/35 focus:outline-2 focus:outline-offset-2 focus:outline-orange"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2 pt-4">
            <Button variant="outline" size="sm" onClick={resetLayout}>
              Reset layout
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (
                  window.confirm(
                    "Delete all sessions, streaks and tasks? This can't be undone.",
                  )
                ) {
                  void clearAll();
                }
              }}
            >
              Clear all data
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
