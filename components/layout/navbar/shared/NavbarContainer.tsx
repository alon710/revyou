import { ReactNode, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface NavbarContainerProps {
  children: ReactNode;
  scrollSelector?: string;
}

export function NavbarContainer({
  children,
  scrollSelector,
}: NavbarContainerProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      let currentScrollY: number;

      if (scrollSelector) {
        const target = e.target as HTMLElement;
        currentScrollY = target.scrollTop;
      } else {
        currentScrollY = window.scrollY;
      }

      setScrolled(currentScrollY > 20);
    };

    if (scrollSelector) {
      const element = document.querySelector(scrollSelector);
      element?.addEventListener("scroll", handleScroll);
      return () => element?.removeEventListener("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [scrollSelector]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 z-50 transition-all duration-300",
        "top-0 md:top-5"
      )}
      style={{
        transform: `scale(${scrolled ? 0.99 : 1})`,
      }}
    >
      <div
        className={cn(
          "mx-auto backdrop-blur-lg border transition-all duration-300",
          "w-full px-4 md:px-8 rounded-none md:rounded-full",
          "md:w-[90vw] md:max-w-[1300px]",
          "shadow-[0_1px_0_0_rgba(255,255,255,0.25),0_-1px_0_0_rgba(255,255,255,0.1)]",
          scrolled ? "bg-white/85 border-white/30" : "bg-white/60 border-white/30"
        )}
      >
        <div className="flex h-16 md:h-20 items-center justify-between gap-4 md:gap-10">
          {children}
        </div>
      </div>
    </header>
  );
}
