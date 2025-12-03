import { ReactNode } from "react";

export function NavbarContainer({ children }: { children: ReactNode }) {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-background/80 border-b border-border/40">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-8">{children}</div>
    </header>
  );
}
