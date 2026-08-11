"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void): () => void {
  const id = window.setInterval(onChange, 1000);
  return () => window.clearInterval(id);
}

/** Whole seconds, so the snapshot is stable between ticks. */
function getSnapshot(): number {
  return Math.floor(Date.now() / 1000);
}

/** The server has no idea what second it is; render a placeholder there. */
function getServerSnapshot(): null {
  return null;
}

/**
 * Manila wall clock, the way juice.agency pins its local time into a corner.
 * `useSyncExternalStore` is the fit here: the clock is an external source we
 * subscribe to, and it gives the server its own snapshot so hydration lines up.
 */
export function LiveClock() {
  const seconds = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const time =
    seconds === null
      ? "--:--:--"
      : new Date(seconds * 1000).toLocaleTimeString("en-PH", {
          timeZone: "Asia/Manila",
          hour12: false,
        });

  return (
    <span className="tabular">
      Manila
      <br />
      {time}
    </span>
  );
}
