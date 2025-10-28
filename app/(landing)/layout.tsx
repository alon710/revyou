import { LandingPageNavbar } from "@/components/layout/navbar/LandingPageNavbar";
import { Footer } from "@/components/landing/Footer";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingPageNavbar />
      {children}
      <Footer />
    </div>
  );
}
