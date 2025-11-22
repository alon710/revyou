"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth/auth";
import { dashboardNavItems, landingNavItems, getNavigationVariant, getIsActive } from "@/lib/navigation";
import { usePathname, useRouter } from "@/i18n/routing";

export function useNavigation(variant?: "landing" | "dashboard") {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [hash, setHash] = useState("");

  const navigationVariant = variant || getNavigationVariant(pathname);
  const navItems = navigationVariant === "dashboard" ? dashboardNavItems : landingNavItems;

  useEffect(() => {
    setHash(window.location.hash);

    const handleHashChange = () => {
      setHash(window.location.hash);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

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
    setHash(anchorHash);
    document.getElementById(anchorHash.replace("#", ""))?.scrollIntoView({ behavior: "smooth" });
    window.history.pushState(null, "", href);
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
