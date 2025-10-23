import { Building2, MessageSquare, Settings } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresBusiness: boolean;
}

export const navItems: NavItem[] = [
  {
    title: "עסקים",
    href: "/businesses",
    icon: Building2,
    requiresBusiness: false,
  },
  {
    title: "ביקורות",
    href: "/reviews",
    icon: MessageSquare,
    requiresBusiness: true,
  },
  {
    title: "הגדרות חשבון",
    href: "/settings",
    icon: Settings,
    requiresBusiness: false,
  },
];
