import { ReactNode } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

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
      <SheetContent side="right" className="w-80 md:hidden">
        <div className="flex flex-col gap-2 mt-8">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
