import { Building2, MessageSquare, Settings } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
}

export const navItems: NavItem[] = [
  {
    title: "עסקים",
    href: "/businesses",
  },
  {
    title: "ביקורות",
    href: "/reviews",
  },
  {
    title: "הגדרות חשבון",
    href: "/settings",
  },
];
