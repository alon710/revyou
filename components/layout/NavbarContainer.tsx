import { ReactNode } from "react";

export function NavbarContainer({ children }: { children: ReactNode }) {
  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-8">
        {children}
      </div>
    </header>
  );
}
