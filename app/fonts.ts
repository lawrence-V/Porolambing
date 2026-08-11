import { Archivo, Instrument_Sans, JetBrains_Mono } from "next/font/google";

/**
 * Free stand-ins for the licensed faces in our references.
 *
 *   display -> Obviously Variable (wimpdecaf.com), set heavy + condensed.
 *              Archivo carries a `wdth` axis, so `.font-display` drives it
 *              down to ~78 to get the same tall, narrow, heavy silhouette.
 *   body    -> Elza Text (wimpdecaf.com)
 *   mono    -> Juice Mono (juice.agency), used only for corner micro-labels
 *
 * Swapping in the real faces later should only require editing this file.
 */

export const display = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

export const body = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const fontVariables = `${display.variable} ${body.variable} ${mono.variable}`;
