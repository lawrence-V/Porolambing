/**
 * ============================================================
 *  EDIT THESE TWO THINGS
 * ============================================================
 *
 * 1. `buyMeACoffee` — replace the handle below with your own.
 *
 * 2. The GCash QR — save a screenshot of your personal GCash QR to
 *    `public/gcash-qr.png`. The support dialog picks it up automatically;
 *    until the file exists it shows a placeholder telling you so.
 *    Nothing else needs changing, and the image never leaves the device.
 */
export const SUPPORT_LINKS = {
  /** TODO: replace `porolambing` with your Buy Me a Coffee handle. */
  buyMeACoffee: "https://www.buymeacoffee.com/porolambing",
} as const;

/** Served from /public. Absent by default — see the note above. */
export const GCASH_QR_SRC = "/gcash-qr.png";

/**
 * The footer credit, shown in the landing footer and at the foot of the app's
 * side rail. The year is a literal rather than `new Date().getFullYear()`: the
 * rail is a client component and the landing footer is statically prerendered,
 * so computing it in both places could have them disagree across a new year.
 * One constant, one line to bump.
 */
export const CREDIT = {
  madeWithPrefix: "Created with ",
  madeWithSuffix: " for my love, by Lawrence Valdez",
  copyright: "Copyright © 2026. All rights reserved.",
} as const;
