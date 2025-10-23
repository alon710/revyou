import {
  Building2,
  MessageSquare,
  Settings,
  Sliders,
  CreditCard,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: (userId: string, businessId?: string) => string;
  icon: React.ComponentType<{ className?: string }>;
  requiresBusiness: boolean;
}

export const navItems: NavItem[] = [
  {
    title: "עסקים",
    href: () => "/businesses",
    icon: Building2,
    requiresBusiness: false,
  },
  {
    title: "ביקורות",
    href: (userId, businessId) =>
      businessId ? `/dashboard/${userId}/${businessId}/reviews` : "/businesses",
    icon: MessageSquare,
    requiresBusiness: true,
  },
  {
    title: "קונפיגורציה",
    href: (userId, businessId) =>
      businessId
        ? `/dashboard/${userId}/${businessId}/configuration`
        : "/businesses",
    icon: Sliders,
    requiresBusiness: true,
  },
  {
    title: "הגדרות חשבון",
    href: (userId) => `/dashboard/${userId}/settings`,
    icon: Settings,
    requiresBusiness: false,
  },
];
