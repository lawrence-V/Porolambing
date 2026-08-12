import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { Intro } from "@/components/landing/Intro";
import { Marquee } from "@/components/landing/Marquee";
import { PhoneHero } from "@/components/landing/PhoneHero";
import { SmoothScroll } from "@/components/landing/SmoothScroll";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  siteUrl,
} from "@/lib/site";

/**
 * How a crawler learns this is a free web app rather than an article. Emitted
 * from a server component, so it's static output — nothing is fetched.
 */
function structuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    url: siteUrl(),
    description: SITE_DESCRIPTION,
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    inLanguage: ["en-PH", "tl"],
    // Schema.org wants a price even when it's nothing; omitting `offers`
    // entirely reads as "price unknown" rather than "free".
    offers: { "@type": "Offer", price: "0", priceCurrency: "PHP" },
  };
}

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Serialised, not user input — there is nothing here to inject.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()) }}
      />
      <SmoothScroll />
      <Intro />
      <main>
        <Hero />
        <Marquee />
        <PhoneHero />
        <Features />
      </main>
      <Footer />
    </>
  );
}
