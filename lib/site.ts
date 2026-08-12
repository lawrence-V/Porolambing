export const SITE_NAME = "Porolambing";

/**
 * Leads with the brand but carries the words people actually type — "pomodoro
 * timer" appeared nowhere in the head before. Kept under ~60 characters so
 * Google doesn't truncate it in the result.
 */
export const SITE_TITLE =
  "Porolambing — a Filipino pomodoro timer that checks on you";

export const SITE_DESCRIPTION =
  "A free pomodoro timer with lambing. Focus in silence, then a companion opens a chat on every break to check on you. No signup, saved on your device.";

/**
 * The deployed origin, used for `metadataBase`, the canonical URL, the sitemap
 * and the robots sitemap line.
 *
 * Server-only — `VERCEL_PROJECT_PRODUCTION_URL` carries no `NEXT_PUBLIC_`
 * prefix and is not inlined into the client bundle. Every caller
 * (`app/robots.ts`, `app/sitemap.ts`, root layout metadata) runs on the server.
 */
export function siteUrl(): string {
  // An explicit setting always wins — this is the switch to flip for a custom
  // domain later.
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  // Vercel sets this to the project's *production* domain on every deployment,
  // previews included. That's what we want: a preview's canonical and sitemap
  // should point at production, not at a URL that's gone next week. Without
  // it the fallback below publishes a sitemap full of localhost, which Google
  // rejects outright — the URLs aren't on the site's host.
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}
