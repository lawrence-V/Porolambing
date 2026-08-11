"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import { useLambingChat } from "@/lib/lambing/useLambingChat";
import { moodFor, statusFor } from "@/lib/lambing/mood";
import { elapsedSeconds, formatClock } from "@/lib/timer/machine";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { CompanionAvatar } from "./CompanionAvatar";

interface LambingChatCardProps {
  /** Wall clock from `useTimerTick`, for the waiting counter. */
  now?: number;
  compact?: boolean;
  className?: string;
}

export function LambingChatCard({
  now = 0,
  compact,
  className,
}: LambingChatCardProps) {
  const companionName = useAppStore((state) => state.settings.companionName);
  const timer = useAppStore((state) => state.timer);
  const { messages, chips, typing, sendChip } = useLambingChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  const elapsed = elapsedSeconds(timer, now);
  const focusing = timer.kind === "focus" && timer.phase === "running";
  const mood = moodFor(timer.kind, timer.phase, elapsed);
  const status = statusFor(timer.kind, timer.phase);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages, typing, chips]);

  return (
    <Card
      label="Lambing"
      className={cn("bg-blush/25", className)}
      action={
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              status.waiting ? "bg-orange" : "bg-green",
            )}
            style={
              status.waiting
                ? { animation: "pulse-dot 2s ease-in-out infinite" }
                : undefined
            }
          />
          <span className="mono-label opacity-70">{status.label}</span>
        </span>
      }
    >
      <div className="mb-3 flex items-center gap-2.5">
        <CompanionAvatar
          className="h-9 w-9 shrink-0"
          mood={mood}
          // Breathing while it waits. The global reduced-motion rule
          // neutralises this without a separate branch here.
          style={
            focusing
              ? { animation: "breathe 3.4s ease-in-out infinite" }
              : undefined
          }
        />
        <div className="leading-tight">
          <p className="font-display-wide text-lg">{companionName}</p>
          <p className="mono-label opacity-70">
            {focusing ? "Hindi ka iistorbohin" : "Nandito lang"}
          </p>
        </div>
      </div>

      {/* Bottom-anchored like a real chat client, so a short conversation
          sits at the base of the card instead of stranding empty space. */}
      <div
        ref={scrollRef}
        className={cn(
          "flex flex-1 flex-col justify-end gap-2 overflow-y-auto pr-1",
          compact ? "max-h-52 min-h-28" : "max-h-72 min-h-36",
        )}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex shrink-0",
              message.author === "user" ? "justify-end" : "justify-start",
            )}
          >
            <p
              className={cn(
                "max-w-[85%] rounded-2xl border-2 border-ink px-3.5 py-2 text-base",
                "animate-[bubble_240ms_var(--ease-back)_both]",
                message.author === "user"
                  ? "rounded-br-sm bg-ink text-cream"
                  : "rounded-bl-sm bg-white",
              )}
            >
              {message.text}
            </p>
          </div>
        ))}

        {typing && (
          <div className="flex shrink-0 justify-start">
            <span className="flex items-center gap-1 rounded-2xl rounded-bl-sm border-2 border-ink bg-white px-3 py-2.5">
              {[0, 1, 2].map((index) => (
                <span
                  key={index}
                  className="h-1.5 w-1.5 rounded-full bg-ink/60"
                  style={{
                    animation: "typing 1s ease-in-out infinite",
                    animationDelay: `${index * 0.16}s`,
                  }}
                />
              ))}
            </span>
          </div>
        )}
      </div>

      {/* During focus the companion stays quiet — but not absent. The band
          replaces the chip row and shows how long it has been waiting. */}
      {focusing ? (
        <div className="mt-3 flex items-center justify-between gap-3 border-t-2 border-dashed border-ink/15 pt-3">
          <span className="text-sm italic opacity-70">
            Naghihintay lang ako dito…
          </span>
          <span className="mono-label tabular opacity-70">
            {formatClock(elapsed)}
          </span>
        </div>
      ) : (
        chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 border-t-2 border-dashed border-ink/15 pt-3">
            {chips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => sendChip(chip)}
                className={cn(
                  "rounded-full border-2 border-ink bg-white px-3.5 py-2 text-sm font-semibold",
                  "transition-transform duration-150 hover:-translate-y-0.5 hover:bg-yellow",
                  "animate-[bubble_240ms_var(--ease-back)_both]",
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )
      )}
    </Card>
  );
}
