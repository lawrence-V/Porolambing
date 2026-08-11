"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import {
  BREAK_TIER_BOUNDS,
  MAX_WORK_BOUNDS,
  type Settings,
} from "@/lib/store/types";
import { breakTierBands } from "@/lib/timer/machine";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { Modal } from "./Modal";

function Stepper({
  value,
  min,
  max,
  step,
  unit,
  label,
  onChange,
  size = "lg",
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  label: string;
  onChange: (value: number) => void;
  size?: "lg" | "sm";
}) {
  const set = (next: number) => onChange(Math.min(max, Math.max(min, next)));

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => set(value - step)}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-ink text-lg transition-colors hover:bg-ink hover:text-cream disabled:pointer-events-none disabled:opacity-25"
      >
        −
      </button>
      <div
        className={cn(
          "flex flex-1 items-center justify-between rounded-2xl border-2 border-ink bg-white px-4",
          size === "lg" ? "h-12" : "h-10",
        )}
      >
        <span
          className={cn(
            "tabular font-display-wide",
            size === "lg" ? "text-2xl" : "text-xl",
          )}
        >
          {value}
        </span>
        <span className="text-sm opacity-70">{unit}</span>
      </div>
      <button
        onClick={() => set(value + step)}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-ink text-lg transition-colors hover:bg-ink hover:text-cream disabled:pointer-events-none disabled:opacity-25"
      >
        +
      </button>
    </div>
  );
}

type Draft = Pick<Settings, "maxWorkMinutes" | "breakTiers">;

/**
 * Split out so the draft can be seeded from a `useState` initialiser. `Modal`
 * unmounts its children while closed, so opening the dialog remounts this and
 * picks up the current settings — no effect needed to reset it.
 */
function FlowSettingsForm({ onClose }: { onClose: () => void }) {
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);

  // A local copy, so Cancel genuinely discards.
  const [draft, setDraft] = useState<Draft>(() => ({
    maxWorkMinutes: settings.maxWorkMinutes,
    breakTiers: [...settings.breakTiers],
  }));

  const bands = breakTierBands(draft.maxWorkMinutes, draft.breakTiers.length);

  function setTier(index: number, value: number) {
    setDraft((current) => ({
      ...current,
      breakTiers: current.breakTiers.map((tier, i) =>
        i === index ? value : tier,
      ),
    }));
  }

  return (
    <>
      <section>
        <h3 className="font-display-wide text-xl">Max work time</h3>
        <p className="mb-3 text-sm opacity-70">
          The longest a single work session can run.
        </p>
        <Stepper
          value={draft.maxWorkMinutes}
          min={MAX_WORK_BOUNDS.min}
          max={MAX_WORK_BOUNDS.max}
          step={MAX_WORK_BOUNDS.step}
          unit="minutes"
          label="max work time"
          onChange={(maxWorkMinutes) =>
            setDraft((current) => ({ ...current, maxWorkMinutes }))
          }
        />
        <div className="mono-label mt-2 flex justify-between opacity-70">
          <span>Min: {MAX_WORK_BOUNDS.min}</span>
          <span>Max: {MAX_WORK_BOUNDS.max}</span>
        </div>
      </section>

      <hr className="my-6 border-ink/10" />

      <section>
        <h3 className="font-display-wide text-xl">Break time by work duration</h3>
        <p className="mb-4 text-sm opacity-70">
          How much break each stretch of work earns. The bands follow your max
          work time.
        </p>

        <div className="space-y-2.5">
          {bands.map((band, index) => (
            <div
              key={band.from}
              className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
            >
              <span className="w-32 shrink-0 text-sm">
                {band.from}–{band.to} min work
              </span>
              <div className="flex-1">
                <Stepper
                  size="sm"
                  value={draft.breakTiers[index]}
                  min={BREAK_TIER_BOUNDS.min}
                  max={BREAK_TIER_BOUNDS.max}
                  step={BREAK_TIER_BOUNDS.step}
                  unit="min break"
                  label={`break for ${band.from} to ${band.to} minutes of work`}
                  onChange={(value) => setTier(index, value)}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-sm opacity-70">
          Anything under {bands[0].from} minutes earns no break.
        </p>
      </section>

      {/* Sticky inside the scroll area, so the actions stay reachable on a
          short screen without Modal needing to own the draft state. */}
      <div className="sticky bottom-0 -mx-6 mt-6 flex gap-3 border-t-2 border-ink/10 bg-cream px-6 py-4">
        <Button variant="outline" size="lg" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="lg"
          className="flex-1"
          onClick={() => {
            updateSettings(draft);
            onClose();
          }}
        >
          Save changes
        </Button>
      </div>
    </>
  );
}

export function FlowSettingsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Flow Timer Settings"
      subtitle="Work as long as you like, then collect the break you earned."
    >
      <FlowSettingsForm onClose={onClose} />
    </Modal>
  );
}
