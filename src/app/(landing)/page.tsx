import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";

export default function Home() {
  return (
    <main className="flex-grow">
      <section id="hero" className="scroll-mt-20 relative -mt-24 md:-mt-28">
        <Hero />
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-20 bg-white relative py-16 md:py-24"
      >
        <HowItWorks />
      </section>

      <section
        id="pricing"
        className="scroll-mt-20 bg-gray-50/50 relative py-16 md:py-24"
      >
        <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-white to-transparent" />
        <Pricing />
      </section>

      <section
        id="faq"
        className="scroll-mt-20 bg-white relative py-16 md:py-24"
      >
        <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-gray-50/50 to-transparent" />
        <FAQ />
      </section>
    </main>
  );
}
