import { cn } from "@/lib/cn";

export type ButtonVariant = "solid" | "cream" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

/**
 * Each variant owns its own colours. Passing overriding colour utilities via
 * `className` would collide with these at equal specificity and resolve by
 * stylesheet order rather than intent, so new colourways belong here.
 */
const variants: Record<ButtonVariant, string> = {
  solid:
    "bg-ink text-cream border-ink shadow-[3px_3px_0_0_var(--color-ink)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--color-ink)] active:translate-y-0 active:shadow-[2px_2px_0_0_var(--color-ink)]",
  cream:
    "bg-cream text-ink border-cream shadow-[3px_3px_0_0_var(--color-orange)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--color-orange)] active:translate-y-0 active:shadow-[2px_2px_0_0_var(--color-orange)]",
  outline: "bg-transparent text-ink border-ink hover:bg-ink hover:text-cream",
  ghost:
    "bg-transparent text-ink border-transparent hover:border-ink/20 hover:bg-ink/5",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-12 px-6 text-base",
  // Page-level primary actions, which need to outweigh anything in a card.
  xl: "h-14 px-8 text-lg",
};

/**
 * Shared so links can be styled as buttons. Lives outside the client Button
 * module because server components need to call it directly.
 */
export function buttonClasses(
  variant: ButtonVariant = "solid",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-full border-2 font-semibold",
    "transition-all duration-150 ease-out",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange",
    "disabled:pointer-events-none disabled:opacity-40",
    variants[variant],
    sizes[size],
    className,
  );
}
