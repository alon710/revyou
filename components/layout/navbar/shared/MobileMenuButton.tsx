import { Menu, X } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";

interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export function MobileMenuButton({ isOpen, onClick }: MobileMenuButtonProps) {
  return (
    <div className="md:hidden">
      <IconButton
        icon={isOpen ? X : Menu}
        onClick={onClick}
        aria-label="תפריט"
        size="default"
        variant="ghost"
      />
    </div>
  );
}
