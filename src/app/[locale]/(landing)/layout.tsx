import { AppLayout } from "@/components/layout/AppLayout";
import { Footer } from "@/components/landing/Footer";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <AppLayout variant="landing" className="pt-0! pb-0! px-0!">
        {children}
        <Footer />
      </AppLayout>
    </div>
  );
}
