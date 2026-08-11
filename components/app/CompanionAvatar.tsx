import type { CSSProperties } from "react";
import type { CompanionMood } from "@/lib/lambing/mood";

/**
 * The companion: a tomato with a face, drawn as flat black line art in the
 * spirit of the wimpdecaf.com mascots. Deliberately a little needy-looking.
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
      <circle cx="32" cy="36" r="23" fill="var(--color-orange)" stroke="var(--color-ink)" strokeWidth="3" />
      {/* leaf + stem */}
      <path
        d="M32 14v-6M32 14c-5-4-11-4-14-1 3 4 10 5 14 1Zm0 0c5-4 11-4 14-1-3 4-10 5-14 1Z"
        fill="var(--color-green)"
        stroke="var(--color-ink)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* cheeks */}
      <ellipse cx="19" cy="41" rx="4.5" ry="3" fill="var(--color-blush)" opacity="0.9" />
      <ellipse cx="45" cy="41" rx="4.5" ry="3" fill="var(--color-blush)" opacity="0.9" />
      {/* eyes */}
      {mood === "sleepy" ? (
        <path
          d="M20 34c2 2 5 2 7 0M37 34c2 2 5 2 7 0"
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ) : (
        <>
          <circle cx="24" cy="34" r="3" fill="var(--color-ink)" />
          <circle cx="40" cy="34" r="3" fill="var(--color-ink)" />
        </>
      )}
      {/* mouth */}
      <path
        d={mood === "excited" ? "M26 43c3 5 9 5 12 0" : "M27 43c2.5 3 7.5 3 10 0"}
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
