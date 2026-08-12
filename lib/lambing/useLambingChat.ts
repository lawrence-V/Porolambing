"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import { onLambingEvent, type LambingEvent } from "@/lib/timer/events";
import { LocalLambingProvider, typingPlan } from "./engine";
import { CHIPS } from "./lines";
import type {
  ChatMessage,
  LambingChip,
  LambingReply,
  PersonaId,
} from "./types";

/** Cap the thread so a long day doesn't turn into an unbounded DOM. */
const MAX_MESSAGES = 60;

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export interface LambingChatState {
  messages: ChatMessage[];
  chips: LambingChip[];
  typing: boolean;
  sendChip: (chip: LambingChip) => void;
  sendText: (text: string) => void;
}

/**
 * Owns the conversation. Listens for timer events, walks replies out one
 * bubble at a time behind a typing indicator, and handles chip taps.
 *
 * The provider is held behind the `LambingProvider` interface, so replacing
 * the local line bank with a self-built generative engine later means
 * swapping this one construction — nothing in the UI changes.
 */
export function useLambingChat(): LambingChatState {
  const settings = useAppStore((state) => state.settings);
  const provider = useMemo(() => new LocalLambingProvider(), []);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chips, setChips] = useState<LambingChip[]>([]);
  const [typing, setTyping] = useState(false);

  // Latest names without making the event subscription depend on them.
  const voiceRef = useRef({
    persona: settings.persona,
    companionName: settings.companionName,
    userName: settings.userName,
  });
  useEffect(() => {
    voiceRef.current = {
      persona: settings.persona,
      companionName: settings.companionName,
      userName: settings.userName,
    };
  }, [settings.persona, settings.companionName, settings.userName]);

  // Replies play out over time, so a reply that starts while another is still
  // typing has to interrupt it — otherwise bubbles from two different moments
  // interleave. This token invalidates any in-flight playback.
  const playbackToken = useRef(0);
  const timeouts = useRef<number[]>([]);

  const clearPending = useCallback(() => {
    for (const id of timeouts.current) window.clearTimeout(id);
    timeouts.current = [];
  }, []);

  useEffect(() => () => clearPending(), [clearPending]);

  const play = useCallback(
    (reply: LambingReply) => {
      clearPending();
      const token = ++playbackToken.current;

      setChips([]);
      setTyping(true);

      const schedule = typingPlan(reply.bubbles);
      reply.bubbles.forEach((text, index) => {
        const id = window.setTimeout(() => {
          if (playbackToken.current !== token) return;
          setMessages((current) =>
            [
              ...current,
              {
                id: newId(),
                author: "companion" as const,
                text,
                at: Date.now(),
              },
            ].slice(-MAX_MESSAGES),
          );
          const isLast = index === reply.bubbles.length - 1;
          if (isLast) {
            setTyping(false);
            setChips(reply.chips);
          }
        }, schedule[index]);
        timeouts.current.push(id);
      });

      if (reply.bubbles.length === 0) setTyping(false);
    },
    [clearPending],
  );

  useEffect(() => {
    const handle = (event: LambingEvent) => {
      void provider
        .respond({
          trigger: event.trigger,
          context: event.context,
          ...voiceRef.current,
        })
        .then((reply) => {
          if (reply) play(reply);
        });
    };
    return onLambingEvent(handle);
  }, [provider, play]);

  const sendChip = useCallback(
    (chip: LambingChip) => {
      setChips([]);
      setMessages((current) =>
        [
          ...current,
          { id: newId(), author: "user" as const, text: chip.label, at: Date.now() },
        ].slice(-MAX_MESSAGES),
      );
      void provider
        .respondToChip(chip.id, { context: {}, ...voiceRef.current })
        .then((reply) => {
          if (reply) play(reply);
        });
    },
    [provider, play],
  );

  const sendText = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text) return;

      setChips([]);
      setMessages((current) =>
        [
          ...current,
          { id: newId(), author: "user" as const, text, at: Date.now() },
        ].slice(-MAX_MESSAGES),
      );
      void provider
        .respondToText(text, { context: {}, ...voiceRef.current })
        .then((reply) => {
          if (reply) play(reply);
        });
    },
    [provider, play],
  );

  // Opening line, so the card is never an empty box on first load.
  const greeted = useRef(false);
  useEffect(() => {
    if (greeted.current) return;
    greeted.current = true;
    const id = window.setTimeout(() => {
      play({
        bubbles: [
          "Uy, andito ka na.",
          "Kausapin mo ako kahit kailan — nandito lang naman ako.",
        ],
        chips: resolveGreetingChips(voiceRef.current.persona),
      });
    }, 500);
    return () => {
      window.clearTimeout(id);
      // Strict Mode runs effects twice on mount and cancels the first pass.
      // Without clearing the guard here, the greeting is scheduled once,
      // cancelled, and then skipped forever.
      greeted.current = false;
    };
  }, [play]);

  return { messages, chips, typing, sendChip, sendText };
}

/** The opening chips, matched to whichever persona is active. */
function resolveGreetingChips(persona: PersonaId): LambingChip[] {
  const matches = CHIPS.filter((chip) => chip.id === "ready");
  const chip =
    matches.find((entry) => entry.persona === persona) ??
    matches.find((entry) => !entry.persona);
  return chip ? [chip] : [];
}
