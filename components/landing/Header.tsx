"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 space-x-reverse">
            <span className="text-xl font-bold text-primary">תשובות AI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection("features")}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              תכונות
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              איך זה עובד
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              מחירון
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              שאלות נפוצות
            </button>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline">התחברות</Button>
            </Link>
            <Link href="/register">
              <Button>התחל ניסיון חינם</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="תפריט"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-4">
              <button
                onClick={() => scrollToSection("features")}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors text-right"
              >
                תכונות
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors text-right"
              >
                איך זה עובד
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors text-right"
              >
                מחירון
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors text-right"
              >
                שאלות נפוצות
              </button>
              <div className="flex flex-col gap-2 mt-2">
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    התחברות
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="w-full">התחל ניסיון חינם</Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
