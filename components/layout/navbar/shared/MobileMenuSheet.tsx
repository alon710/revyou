"use client";

import { ReactNode } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

interface MobileMenuSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function MobileMenuSheet({
  open,
  onOpenChange,
  children,
}: MobileMenuSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="md:hidden max-h-[85vh] bg-gradient-to-b from-white/80 to-white/60 backdrop-blur-xl rounded-t-3xl shadow-[0_-8px_24px_-4px_rgba(0,0,0,0.08)] border-t border-indigo-100/40"
      >
        <SheetTitle className="sr-only">תפריט</SheetTitle>
        <div className="flex flex-col gap-2 mt-4 pb-6">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
