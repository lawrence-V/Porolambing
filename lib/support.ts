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
