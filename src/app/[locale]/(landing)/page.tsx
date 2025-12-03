import { Hero } from "@/components/landing/Hero";
import { Statistics } from "@/components/landing/Statistics";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";

export default function Home() {
  return (
    <main className="grow space-y-20">
      <Hero />
      <Statistics />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </main>
  );
}
