import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";

export default function Home() {
  return (
    <main className="py-10 flex-grow space-y-16 sm:space-y-24">
      <Hero />
      <HowItWorks />
      <Pricing />
      <FAQ />
    </main>
  );
}
