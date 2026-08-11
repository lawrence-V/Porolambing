import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The badge renders at bottom-left, directly on top of the hero CTA. Compile
  // and runtime errors still surface without it.
  devIndicators: false,
};

export default nextConfig;
