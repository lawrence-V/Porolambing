"use client";

/**
 * The last line of defence: this catches errors thrown by the root layout
 * itself, where `app/error.tsx` never gets a chance to render. It has to
 * supply its own <html> and <body>, and can't rely on the app's fonts or
 * global stylesheet having loaded — so everything here is inline.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Nothing renders reliably at this level, so the detail goes to the console.
  if (typeof console !== "undefined") console.error("Porolambing crashed:", error);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#fffdeb",
          color: "#1d1c1b",
          fontFamily: "system-ui, sans-serif",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ fontSize: 32, margin: "0 0 12px" }}>Naku, may sira.</h1>
          <p style={{ opacity: 0.7, margin: "0 0 20px" }}>
            Porolambing failed to load. Your saved sessions are untouched.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#1d1c1b",
              color: "#fffdeb",
              border: "2px solid #1d1c1b",
              borderRadius: 999,
              padding: "12px 24px",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
