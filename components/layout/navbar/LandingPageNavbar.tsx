"use client";

import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { NavbarContainer } from "@/components/layout/navbar/shared/NavbarContainer";
import { MobileMenuButton } from "@/components/layout/navbar/shared/MobileMenuButton";
import { AuthButtons } from "@/components/layout/navbar/shared/AuthButtons";
import { MobileMenu } from "@/components/layout/navbar/shared/MobileMenu";

interface LandingSection {
  id: string;
  label: string;
}

interface LandingPageNavbarProps {
  sections?: LandingSection[];
}

const DEFAULT_SECTIONS: LandingSection[] = [
  { id: "how-it-works", label: "איך זה עובד" },
  { id: "pricing", label: "מחירון" },
  { id: "faq", label: "שאלות נפוצות" },
];

export function LandingPageNavbar({
  sections = DEFAULT_SECTIONS,
}: LandingPageNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <NavbarContainer>
        <div className="flex-shrink-0 pl-2">
          <Logo href="/" />
        </div>

        <nav className="hidden md:flex items-center flex-1 justify-center h-full gap-2">
          {sections.map((section) => (
            <button
              type="button"
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className="flex items-center gap-2 text-sm font-medium transition-all px-3 py-2 rounded-lg text-gray-600 opacity-60 hover:text-gray-900/90 hover:opacity-100 cursor-pointer"
            >
              {section.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3 flex-shrink-0 pr-2">
          <AuthButtons variant="desktop" />
        </div>

        <div className="flex md:hidden items-center gap-2">
          <AuthButtons variant="mobile" />
          <MobileMenuButton
            isOpen={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
        </div>
      </NavbarContainer>

      <MobileMenu
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        items={sections.map((section) => ({
          type: "scroll",
          targetId: section.id,
          label: section.label,
        }))}
      />
    </>
  );
}
