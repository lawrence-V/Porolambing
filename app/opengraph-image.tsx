import { ImageResponse } from "next/og";
import { SITE_TITLE } from "@/lib/site";

export const alt = SITE_TITLE;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * What a shared link looks like on Messenger, Facebook and X.
 *
 * Deliberately built from plain boxes and the bundled font rather than the
 * app's Archivo: `ImageResponse` needs real font data supplied to it, and a
 * share image that renders reliably beats one in the exact typeface.
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#5ea85e",
          color: "#fffdeb",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 132,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          POROLAMBING
        </div>

        {/* The mango, drawn with boxes — satori has no SVG path support. */}
        <div
          style={{
            display: "flex",
            width: 128,
            height: 148,
            marginTop: 34,
            borderRadius: "50%",
            background: "#f7b32b",
            border: "7px solid #1d1c1b",
            transform: "rotate(18deg)",
          }}
        />

        <div
          style={{
            marginTop: 40,
            fontSize: 40,
            color: "#1d1c1b",
            fontWeight: 600,
          }}
        >
          A pomodoro timer that actually misses you.
        </div>
      </div>
    ),
    size,
  );
}
