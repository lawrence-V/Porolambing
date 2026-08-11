import Link from "next/link";
import { CompanionAvatar } from "@/components/app/CompanionAvatar";
import { Credit } from "@/components/app/SideNav";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { LiveClock } from "./LiveClock";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink px-5 py-16 text-cream">
      <div className="mx-auto flex max-w-6xl flex-col gap-14">
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mono-label mono-label-xs opacity-60">Ready?</p>
            <p className="font-display mt-3 text-[clamp(2.5rem,8vw,6rem)] leading-[0.85]">
              TARA NA.
            </p>
          </div>
          <Link href="/app" className={buttonClasses("cream", "lg")}>
            Start focusing
          </Link>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-6 border-t border-cream/20 pt-8">
          <span className="flex items-center gap-2">
            <CompanionAvatar className="h-8 w-8" />
            <span className="font-display text-xl">POROLAMBING</span>
          </span>
          <span className="mono-label mono-label-xs opacity-60">
            <LiveClock />
          </span>
          <span className="mono-label mono-label-xs max-w-52 leading-relaxed opacity-60">
            Pomodoro + lambing.
            <br />
            Sessions saved on your device only.
          </span>
        </div>

        <Credit className="border-t border-cream/20 pt-6 opacity-60" />
      </div>
    </footer>
  );
}
