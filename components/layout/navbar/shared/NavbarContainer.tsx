import { ReactNode } from "react";

interface NavbarContainerProps {
  children: ReactNode;
}

export function NavbarContainer({ children }: NavbarContainerProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur shadow-sm supports-[backdrop-filter]:bg-background/60 transition-shadow">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">{children}</div>
      </div>
    </header>
  );
}
