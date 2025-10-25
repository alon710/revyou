"use client";

import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { NavbarContainer } from "./shared/NavbarContainer";
import { MobileMenuButton } from "./shared/MobileMenuButton";
import { AuthButtons } from "./shared/AuthButtons";
import { MobileMenuSheet } from "./shared/MobileMenuSheet";

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
        <Logo href="/" />

        <nav className="hidden md:flex items-center gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className="text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent/10 transition-all px-3 py-2 rounded-lg"
            >
              {section.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <AuthButtons variant="desktop" />
        </div>

        <MobileMenuButton
          isOpen={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
      </NavbarContainer>

      <MobileMenuSheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all text-foreground/80 hover:bg-accent/50 hover:text-foreground text-right"
          >
            {section.label}
          </button>
        ))}

        <div className="flex flex-col gap-2 pt-3 border-t border-border/40 mt-3">
          <AuthButtons
            variant="mobile"
            onAction={() => setMobileMenuOpen(false)}
          />
        </div>
      </MobileMenuSheet>
    </>
  );
}
