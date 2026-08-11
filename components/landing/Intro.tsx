"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/cn";

const SESSION_KEY = "porolambing:intro-played";

/**
 * Node positions in percentage of the viewport, arranged in a loose ring so
 * they read as a constellation around the wordmark rather than a grid.
 */
const NODES = [
  { x: 12, y: 16, kind: "bubble", tint: "var(--color-blush)" },
  { x: 26, y: 9, kind: "heart", tint: "var(--color-orange)" },
  { x: 44, y: 13, kind: "tomato", tint: "var(--color-orange)" },
  { x: 63, y: 8, kind: "bubble", tint: "var(--color-mint)" },
  { x: 80, y: 15, kind: "heart", tint: "var(--color-blush)" },
  { x: 91, y: 27, kind: "tomato", tint: "var(--color-yellow)" },
  { x: 88, y: 47, kind: "bubble", tint: "var(--color-green)" },
  { x: 93, y: 68, kind: "heart", tint: "var(--color-orange)" },
  { x: 79, y: 84, kind: "tomato", tint: "var(--color-orange)" },
  { x: 60, y: 90, kind: "bubble", tint: "var(--color-blush)" },
  { x: 41, y: 86, kind: "heart", tint: "var(--color-yellow)" },
  { x: 24, y: 91, kind: "tomato", tint: "var(--color-mint)" },
  { x: 9, y: 76, kind: "bubble", tint: "var(--color-orange)" },
  { x: 6, y: 52, kind: "heart", tint: "var(--color-green)" },
  { x: 15, y: 36, kind: "tomato", tint: "var(--color-blush)" },
  { x: 70, y: 33, kind: "bubble", tint: "var(--color-yellow)" },
  { x: 31, y: 68, kind: "heart", tint: "var(--color-mint)" },
  { x: 72, y: 62, kind: "tomato", tint: "var(--color-blush)" },
] as const;

/** Which nodes are wired to which, as index pairs. */
const EDGES: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8],
  [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14], [14, 0],
  [2, 15], [15, 6], [10, 16], [16, 13], [8, 17], [17, 15],
];

function NodeGlyph({ kind, tint }: { kind: string; tint: string }) {
  if (kind === "heart") {
    return (
      <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden>
        <path
          d="M12 21s-8-5.2-8-10.4A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 3.6C20 15.8 12 21 12 21Z"
          fill={tint}
          stroke="var(--color-cream)"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (kind === "tomato") {
    return (
      <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden>
        <circle cx="12" cy="14" r="7.5" fill={tint} stroke="var(--color-cream)" strokeWidth="1.6" />
        <path d="M12 6.5V4M8 5.5c1.6-1 3-1 4 .5 1-1.5 2.4-1.5 4-.5" fill="none" stroke="var(--color-cream)" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden>
      <path
        d="M4 5h16v11H10l-5 4v-4H4V5Z"
        fill={tint}
        stroke="var(--color-cream)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * The overlay is torn down imperatively rather than through React state. It is
 * a self-contained, animation-owned piece of DOM, and hiding it directly means
 * a repeat visit in the same session never flashes a frame of black while a
 * state update lands.
 */
export function Intro() {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = root.current;
    if (!node) return;

    const hide = () => {
      node.style.display = "none";
    };

    const alreadyPlayed =
      window.sessionStorage.getItem(SESSION_KEY) === "1";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;

    if (alreadyPlayed) {
      hide();
      return;
    }

    // The "played" flag is only written once the sequence actually finishes.
    // Writing it up front means Strict Mode's throwaway first pass marks it
    // played, and the real second pass skips straight to the hero.
    const markPlayed = () => window.sessionStorage.setItem(SESSION_KEY, "1");

    // Reduced motion gets the same information as a short fade, with no
    // flying elements and no scroll lock worth speaking of.
    if (reduced) {
      node.style.transition = "opacity 300ms linear";
      node.style.opacity = "0";
      const timeout = window.setTimeout(() => {
        markPlayed();
        hide();
      }, 400);
      return () => window.clearTimeout(timeout);
    }

    document.body.style.overflow = "hidden";

    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = "";
          markPlayed();
          hide();
        },
      });

      timeline.fromTo(
        ".intro-word-line",
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.028,
        },
        0,
      );

      // Nodes fly in from scattered offsets and settle onto the ring.
      timeline.fromTo(
        ".intro-node",
        {
          opacity: 0,
          scale: 0.4,
          x: () => gsap.utils.random(-260, 260),
          y: () => gsap.utils.random(-200, 200),
        },
        {
          opacity: 1,
          scale: 1,
          x: 0,
          y: 0,
          duration: 1.1,
          ease: "expo.out",
          stagger: { each: 0.035, from: "random" },
        },
        0.15,
      );

      // Connectors draw themselves once their endpoints are roughly in place.
      timeline.fromTo(
        ".intro-edge",
        { strokeDashoffset: 1, opacity: 0 },
        {
          strokeDashoffset: 0,
          opacity: 0.35,
          duration: 0.7,
          ease: "power2.out",
          stagger: 0.015,
        },
        0.5,
      );

      timeline.fromTo(
        ".intro-scribble",
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 0.6, ease: "power2.out", stagger: 0.1 },
        0.9,
      );

      timeline.to(
        { value: 0 },
        {
          value: 100,
          duration: 1.5,
          ease: "power1.inOut",
          onUpdate() {
            const target = this.targets()[0] as { value: number };
            if (counter.current) {
              counter.current.textContent = `${Math.round(target.value)}%`;
            }
          },
        },
        0,
      );

      timeline.to(node, {
        yPercent: -100,
        duration: 0.8,
        ease: "expo.inOut",
      });
    }, node);

    return () => {
      context.revert();
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      ref={root}
      aria-hidden
      className={cn(
        "fixed inset-0 z-100 overflow-hidden bg-night",
        "grid place-items-center",
      )}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {EDGES.map(([from, to]) => (
          <line
            key={`${from}-${to}`}
            className="intro-edge"
            x1={NODES[from].x}
            y1={NODES[from].y}
            x2={NODES[to].x}
            y2={NODES[to].y}
            stroke="var(--color-cream)"
            strokeWidth="0.08"
            pathLength={1}
            strokeDasharray={1}
          />
        ))}
      </svg>

      {NODES.map((node, index) => (
        <span
          key={index}
          className="intro-node absolute h-9 w-9 md:h-11 md:w-11"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            marginLeft: "-1.375rem",
            marginTop: "-1.375rem",
          }}
        >
          <NodeGlyph kind={node.kind} tint={node.tint} />
        </span>
      ))}

      {/* Hand-drawn yellow accents, the Teamwork Graph scribbles. Each gets its
          own square viewBox — sharing the stretched full-bleed one above would
          squash the loops into flat dashes. */}
      <svg
        className="pointer-events-none absolute left-[10%] top-[58%] w-32 md:w-44"
        viewBox="0 0 100 60"
        fill="none"
      >
        <path
          className="intro-scribble"
          d="M6 40c14-26 30-26 38-10s-14 24-22 10 12-26 34-14"
          stroke="var(--color-yellow)"
          strokeWidth="4"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
        />
      </svg>
      <svg
        className="pointer-events-none absolute right-[12%] top-[34%] w-24 md:w-32"
        viewBox="0 0 100 60"
        fill="none"
      >
        <path
          className="intro-scribble"
          d="M12 12c30 4 48 22 34 34S14 46 34 32s44 4 52 18"
          stroke="var(--color-yellow)"
          strokeWidth="4"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
        />
      </svg>

      <h2 className="relative px-6 text-center">
        <span className="font-display block overflow-hidden text-cream text-[clamp(2rem,12vw,11rem)] leading-[0.85]">
          <span className="intro-word-line block">POROLAMBING</span>
        </span>
      </h2>

      <span
        ref={counter}
        className="mono-label mono-label-xs absolute bottom-6 left-6 text-cream/70"
      >
        0%
      </span>
      <span className="mono-label mono-label-xs absolute bottom-6 right-6 text-cream/70">
        Loading lambing
      </span>
    </div>
  );
}
