"use client";

import { useSyncExternalStore } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth/auth";
import { dashboardNavItems, landingNavItems, getNavigationVariant, getIsActive } from "@/lib/navigation";
import { usePathname, useRouter } from "@/i18n/routing";

function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function getSnapshot() {
  return window.location.hash;
}

function getServerSnapshot() {
  return "";
}

export function useNavigation(variant?: "landing" | "dashboard") {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const hash = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const navigationVariant = variant || getNavigationVariant(pathname);
  const navItems = navigationVariant === "dashboard" ? dashboardNavItems : landingNavItems;

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error("Sign out failed", error);
    }
    router.push("/");
  };

  const scrollToSection = (href: string) => {
    const anchorHash = href.substring(1);
    const isOnLandingPage = pathname === "/";

    if (!isOnLandingPage) {
      router.push(`/${href}`);
      return;
    }

    window.history.pushState(null, "", href);
    window.dispatchEvent(new Event("hashchange"));

    const element = document.getElementById(anchorHash.replace("#", ""));
    element?.scrollIntoView({ behavior: "smooth" });
    element?.focus({ preventScroll: true });
  };

  const isActive = (href: string) => {
    return getIsActive(pathname, href, hash);
  };

  return {
    user,
    pathname,
    router,
    hash,
    variant: navigationVariant,
    navItems,
    handleSignOut,
    scrollToSection,
    isActive,
  };
}
