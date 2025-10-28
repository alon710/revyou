"use client";

import Link from "next/link";
import { MobileMenuSheet } from "./MobileMenuSheet";

type MobileMenuItem =
  | { type: "link"; href: string; label: string }
  | { type: "scroll"; targetId: string; label: string };

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: MobileMenuItem[];
}

const menuItemClassName =
  "flex items-center gap-3 mx-4 my-1 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-xl bg-white/40 border border-transparent text-gray-900 hover:bg-purple-50/60 hover:border-purple-100 hover:text-purple-700 text-right cursor-pointer";

export function MobileMenu({ open, onOpenChange, items }: MobileMenuProps) {
  const handleClose = () => onOpenChange(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      handleClose();
    }
  };

  return (
    <MobileMenuSheet open={open} onOpenChange={onOpenChange}>
      {items.map((item) => {
        if (item.type === "link") {
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleClose}
              className={menuItemClassName}
            >
              <span>{item.label}</span>
            </Link>
          );
        }

        if (item.type === "scroll") {
          return (
            <button
              key={item.targetId}
              onClick={() => scrollToSection(item.targetId)}
              className={menuItemClassName}
            >
              {item.label}
            </button>
          );
        }

        return null;
      })}
    </MobileMenuSheet>
  );
}
