import {
  Home,
  MessageSquare,
  Settings,
  PiggyBank,
  ShieldQuestionMarkIcon,
  Rocket,
  LayoutDashboard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function getDashboardNavItems(businessId?: string): NavItem[] {
  const basePath = businessId
    ? `/dashboard/businesses/${businessId}`
    : "/dashboard/businesses";

  return [
    { href: "/dashboard", label: "לוח הבקרה", icon: LayoutDashboard },
    { href: basePath, label: "עסקים", icon: Home },
    { href: `${basePath}/reviews`, label: "ביקורות", icon: MessageSquare },
    { href: "/dashboard/settings", label: "הגדרות", icon: Settings },
  ];
}

export const landingNavItems: NavItem[] = [
  { href: "/#hero", label: "בית", icon: Home },
  { href: "/#how-it-works", label: "איך זה עובד", icon: Rocket },
  { href: "/#pricing", label: "מחירון", icon: PiggyBank },
  { href: "/#faq", label: "שאלות", icon: ShieldQuestionMarkIcon },
];

export function getNavigationVariant(
  pathname: string
): "dashboard" | "landing" {
  return pathname.startsWith("/dashboard") ? "dashboard" : "landing";
}

export function isAnchorLink(href: string): boolean {
  return href.startsWith("/#");
}

export function getIsActive(
  pathname: string,
  href: string,
  hash?: string
): boolean {
  if (isAnchorLink(href)) {
    const isOnLandingPage = pathname === "/";
    const anchorMatches = href === hash || (href === "/#hero" && !hash);
    return isOnLandingPage && anchorMatches;
  }

  if (href === "/") {
    return pathname === "/" && !hash;
  }

  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(href);
}

export function extractBusinessIdFromPathname(
  pathname?: string
): string | undefined {
  if (!pathname) return undefined;

  const parts = pathname.split("/");
  const businessesIndex = parts.indexOf("businesses");

  if (businessesIndex === -1 || businessesIndex >= parts.length - 1) {
    return undefined;
  }

  return parts[businessesIndex + 1];
}
