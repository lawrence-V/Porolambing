import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The app itself is a private, local-only workspace — there is nothing
      // there for a crawler and every visit renders the same empty shell.
      disallow: "/app",
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
