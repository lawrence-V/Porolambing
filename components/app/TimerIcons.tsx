/**
 * The three timer controls, shared by the card and full-screen focus mode so
 * they can't drift apart. Sized to sit on the text baseline of a button.
 */
const box = "h-4 w-4 shrink-0";

export function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" className={box} aria-hidden>
      <path d="M4.5 2.8 13 8l-8.5 5.2Z" fill="currentColor" />
    </svg>
  );
}

export function PauseIcon() {
  return (
    <svg viewBox="0 0 16 16" className={box} aria-hidden>
      <g fill="currentColor">
        <rect x="3.5" y="2.5" width="3.5" height="11" rx="1.2" />
        <rect x="9" y="2.5" width="3.5" height="11" rx="1.2" />
      </g>
    </svg>
  );
}

export function SkipIcon() {
  return (
    <svg viewBox="0 0 16 16" className={box} aria-hidden>
      <g fill="currentColor">
        <path d="M3 3.2 10 8l-7 4.8Z" />
        <rect x="11" y="3" width="2.4" height="10" rx="1" />
      </g>
    </svg>
  );
}

export function ResetIcon() {
  return (
    <svg viewBox="0 0 16 16" className={box} aria-hidden>
      <path
        d="M13 8a5 5 0 1 1-1.6-3.7M13 2v3.2H9.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
