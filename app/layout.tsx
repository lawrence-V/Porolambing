import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import {
  SITE_DESCRIPTION as DESCRIPTION,
  SITE_NAME,
  SITE_TITLE as TITLE,
  siteUrl,
} from "@/lib/site";
import { fontVariables } from "./fonts";
import "./globals.css";

/**
 * `metadataBase` resolves through `siteUrl()`, so the origin is decided in one
 * place. It's what turns the generated OG image into the absolute URL that
 * Messenger, Facebook and X require — without it a shared link renders as a
 * bare address.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  // The same page is served on the production URL *and* on every preview
  // deployment URL. Without this they compete as duplicates.
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // What allows the OG image to appear full-size in a result rather than
      // as a thumbnail, or not at all.
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_PH",
    url: "/",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  // Set `GOOGLE_SITE_VERIFICATION` to the token Search Console hands you under
  // the HTML-tag method; the field is dropped entirely when it's unset.
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export const viewport: Viewport = {
  themeColor: "#5ea85e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-PH" className={`${fontVariables} h-full`}>
      <body className="min-h-full">
        {children}
        {/* Anonymous page views only — no session or task data ever
            leaves the browser. A no-op when not deployed on Vercel. */}
        <Analytics />
      </body>
    </html>
  );
}
