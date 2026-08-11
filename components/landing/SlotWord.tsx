"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * The slot-machine word swap from juice.agency: the outgoing word rolls up and
 * out while the incoming one rolls up into place. All words are stacked in a
 * grid cell so the box is as wide as the longest one and the line never
 * reflows mid-animation.
 */
export function SlotWord({
  words,
  interval = 2400,
  className,
}: {
  words: string[];
  interval?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  // The index only ever advances by one, so the outgoing word is derivable
  // rather than something to track in a ref.
  const previousIndex = (index - 1 + words.length) % words.length;

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, interval);
    return () => window.clearInterval(id);
  }, [words.length, interval]);

  return (
    <span className="inline-grid overflow-hidden align-bottom leading-[1.1]">
      {words.map((word, i) => (
        <span
          key={word}
          aria-hidden={i !== index}
          className={cn(
            "col-start-1 row-start-1 whitespace-nowrap transition-all duration-600 ease-out-expo",
            i === index
              ? "translate-y-0 opacity-100"
              : i === previousIndex
                ? "-translate-y-full opacity-0"
                : "translate-y-full opacity-0",
            className,
          )}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
