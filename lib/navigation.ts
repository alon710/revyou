import { Home, PiggyBank, ShieldQuestionMarkIcon, Rocket, CreditCard, BarChart3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const dashboardNavItems: NavItem[] = [
  { href: "/dashboard/home", label: "בית", icon: Home },
  { href: "/dashboard/subscription", label: "תוכנית", icon: CreditCard },
  { href: "/dashboard/insights", label: "תובנות", icon: BarChart3 },
];

export const landingNavItems: NavItem[] = [
  { href: "/#hero", label: "בית", icon: Home },
  { href: "/#how-it-works", label: "איך זה עובד", icon: Rocket },
  { href: "/#pricing", label: "מחירון", icon: PiggyBank },
  { href: "/#faq", label: "שאלות", icon: ShieldQuestionMarkIcon },
];

export function getNavigationVariant(pathname: string): "dashboard" | "landing" {
  return pathname.startsWith("/dashboard") ? "dashboard" : "landing";
}

export function isAnchorLink(href: string): boolean {
  return href.startsWith("/#");
}

export function getIsActive(pathname: string, href: string, hash?: string): boolean {
  if (isAnchorLink(href)) {
    const anchorHash = href.substring(1);
    if (anchorHash === "#hero") {
      return pathname === "/" && (!hash || hash === "#hero");
    }
    return pathname === "/" && hash === anchorHash;
  }

  if (href === "/") {
    return pathname === "/" && !hash;
  }

  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(href);
}
