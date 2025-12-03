import {
  Home,
  PiggyBank,
  ShieldQuestionMarkIcon,
  Rocket,
  CreditCard,
  Settings,
  MessageSquareQuote,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const dashboardNavItems: NavItem[] = [
  { href: "/dashboard/home", label: "navigation.dashboard.home", icon: Home },
  { href: "/dashboard/subscription", label: "navigation.dashboard.subscription", icon: CreditCard },
  { href: "/dashboard/settings", label: "navigation.dashboard.settings", icon: Settings },
];

export const landingNavItems: NavItem[] = [
  { href: "/#hero", label: "navigation.landing.home", icon: Home },
  { href: "/#how-it-works", label: "navigation.landing.howItWorks", icon: Rocket },
  { href: "/#pricing", label: "navigation.landing.pricing", icon: PiggyBank },
  { href: "/#testimonials", label: "navigation.landing.testimonials", icon: MessageSquareQuote },
  { href: "/#faq", label: "navigation.landing.faq", icon: ShieldQuestionMarkIcon },
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
