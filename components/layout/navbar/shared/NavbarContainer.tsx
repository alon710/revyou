import { ReactNode, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface NavbarContainerProps {
  children: ReactNode;
  scrollSelector?: string; // CSS selector for scroll container, defaults to window
}

export function NavbarContainer({
  children,
  scrollSelector,
}: NavbarContainerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      let currentScrollY: number;

      if (scrollSelector) {
        // Dashboard: specific element scroll
        const target = e.target as HTMLElement;
        currentScrollY = target.scrollTop;
      } else {
        // Landing: window scroll
        currentScrollY = window.scrollY;
      }

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past threshold
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    if (scrollSelector) {
      const element = document.querySelector(scrollSelector);
      element?.addEventListener("scroll", handleScroll);
      return () => element?.removeEventListener("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [lastScrollY, scrollSelector]);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 z-50 px-4 md:px-8 transition-all duration-300",
        isVisible ? "top-4" : "-top-24"
      )}
    >
      <div className="max-w-full lg:max-w-7xl mx-auto border border-border/40 rounded-lg bg-card/95 backdrop-blur-md shadow-sm supports-[backdrop-filter]:bg-card/60 transition-shadow px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">{children}</div>
      </div>
    </header>
  );
}
