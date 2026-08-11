/** Join conditional class names. Kept free of "use client" so server
 *  components can call it too. */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}
