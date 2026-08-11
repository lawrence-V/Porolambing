import type { CSSProperties } from "react";
import type { CompanionMood } from "@/lib/lambing/mood";

/**
 * The companion: a mango with a face, drawn as flat line art in the spirit of
 * the wimpdecaf.com mascots. Deliberately a little needy-looking.
 *
 * The body is an asymmetric oval — fuller and rounder at the lower left,
 * tapering toward the stem at the upper right — which is what separates a
 * mango silhouette from a plain circle at a glance.
 */
export function CompanionAvatar({
  className,
  mood = "sweet",
  style,
}: {
  className?: string;
  mood?: CompanionMood;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      style={style}
      role="img"
      aria-label="Your lambing companion"
    >
      {/* A tilted oval, taller than it is wide. A circle reads as an orange;
          the tilt and the taper are what make it a mango. */}
      <ellipse
        cx="32"
        cy="37"
        rx="19"
        ry="24"
        transform="rotate(18 32 37)"
        fill="var(--color-mango)"
        stroke="var(--color-ink)"
        strokeWidth="3"
      />
      {/* The riper blush along the shoulder, kept well inside the outline so
          it can't spill past it without a clip path. */}
      <ellipse
        cx="39"
        cy="25"
        rx="7"
        ry="10"
        transform="rotate(18 39 25)"
        fill="var(--color-mango-deep)"
        opacity="0.5"
      />
      {/* stem + leaf, on the narrow end */}
      <path
        d="M40 13c1-3 1-5 0-7"
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M41 7c3-4 9-5 13-3-2 5-8 8-13 3Z"
        fill="var(--color-green)"
        stroke="var(--color-ink)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* cheeks */}
      <ellipse cx="18" cy="42" rx="4.5" ry="3" fill="var(--color-blush)" opacity="0.85" />
      <ellipse cx="42" cy="42" rx="4.5" ry="3" fill="var(--color-blush)" opacity="0.85" />
      {/* eyes */}
      {mood === "sleepy" ? (
        <path
          d="M20 35c2 2 5 2 7 0M34 35c2 2 5 2 7 0"
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ) : (
        <>
          <circle cx="23" cy="35" r="3" fill="var(--color-ink)" />
          <circle cx="38" cy="35" r="3" fill="var(--color-ink)" />
        </>
      )}
      {/* mouth */}
      <path
        d={mood === "excited" ? "M25 44c3 5 9 5 12 0" : "M26 44c2.5 3 7.5 3 10 0"}
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
