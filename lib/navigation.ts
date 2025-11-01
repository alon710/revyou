import {
  Home,
  MessageSquare,
  Settings,
  PiggyBank,
  ShieldQuestionMarkIcon,
  Rocket,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const dashboardNavItems: NavItem[] = [
  { href: "/locations", label: "בית", icon: Home },
  { href: "/reviews", label: "ביקורות", icon: MessageSquare },
  { href: "/settings", label: "הגדרות", icon: Settings },
];

export const landingNavItems: NavItem[] = [
  { href: "/#hero", label: "בית", icon: Home },
  { href: "/#how-it-works", label: "איך זה עובד", icon: Rocket },
  { href: "/#pricing", label: "מחירון", icon: PiggyBank },
  { href: "/#faq", label: "שאלות", icon: ShieldQuestionMarkIcon },
];

export function getNavigationVariant(
  pathname: string
): "dashboard" | "landing" {
  return pathname.startsWith("/locations") ||
    pathname.startsWith("/reviews") ||
    pathname.startsWith("/settings")
    ? "dashboard"
    : "landing";
}

export function isAnchorLink(href: string): boolean {
  return href.startsWith("/#");
}

export function getIsActive(
  pathname: string,
  href: string,
  hash?: string
): boolean {
  // Handle anchor links (e.g., /#pricing, /#hero)
  if (isAnchorLink(href)) {
    const anchorHash = href.substring(1); // Remove the leading '/'

    // Special case for #hero - also active when no hash (default landing state)
    if (anchorHash === "#hero") {
      return pathname === "/" && (!hash || hash === "#hero");
    }

    return pathname === "/" && hash === anchorHash;
  }

  // Handle root path specially - only match exact path
  if (href === "/") {
    return pathname === "/" && !hash;
  }

  // Handle regular paths - exact match or starts with
  return pathname === href || pathname.startsWith(href);
}
