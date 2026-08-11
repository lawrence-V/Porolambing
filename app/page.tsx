import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { Intro } from "@/components/landing/Intro";
import { Marquee } from "@/components/landing/Marquee";
import { PhoneHero } from "@/components/landing/PhoneHero";
import { SmoothScroll } from "@/components/landing/SmoothScroll";

export default function LandingPage() {
  return (
    <>
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
