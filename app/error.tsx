"use client";

import { useEffect } from "react";
import { CompanionAvatar } from "@/components/app/CompanionAvatar";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "porolambing:v1";

/**
 * Everything the app knows lives in one localStorage blob it parses by hand,
 * so unreadable storage is the most likely way this screen is ever seen. A
 * reload alone would just loop — hence the second, destructive escape.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Porolambing crashed:", error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-cream px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border-2 border-ink bg-white p-8 text-center shadow-[4px_4px_0_0_var(--color-ink)]">
        <CompanionAvatar className="mx-auto h-20 w-20" mood="sleepy" />

        <h1 className="font-display mt-5 text-4xl">Naku, may sira.</h1>
        <p className="mt-3 text-base opacity-70">
          Something broke on my side. Your sessions are still saved — try again
          first.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Button size="lg" onClick={reset}>
            Try again
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              if (
                window.confirm(
                  "This deletes every session and task saved on this device. Only do it if the app won't load. Continue?",
                )
              ) {
                try {
                  window.localStorage.removeItem(STORAGE_KEY);
                } finally {
                  // A hard navigation on purpose: a client-side push would
                  // keep the already-hydrated store in memory, so the app
                  // would come straight back up on the same bad data.
                  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
                  window.location.href = "/app";
                }
              }
            }}
          >
            Reset my data
          </Button>
        </div>

        <p className="mt-4 text-sm opacity-70">
          Only reset if trying again keeps landing here — it can&apos;t be
          undone.
        </p>
      </div>
    </main>
  );
}
