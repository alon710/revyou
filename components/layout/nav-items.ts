import { Building2, MessageSquare, Settings } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const navItems: NavItem[] = [
  {
    title: "עסקים",
    href: "/businesses",
    icon: Building2,
  },
  {
    title: "ביקורות",
    href: "/reviews",
    icon: MessageSquare,
  },
  {
    title: "הגדרות חשבון",
    href: "/settings",
    icon: Settings,
  },
];
