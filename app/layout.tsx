import type { Metadata, Viewport } from "next";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Porolambing — the pomodoro that misses you",
  description:
    "A pomodoro timer with lambing. Focus in peace, then get checked on during every break.",
};

export const viewport: Viewport = {
  themeColor: "#5ea85e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontVariables} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
