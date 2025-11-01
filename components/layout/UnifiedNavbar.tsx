"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { NavbarContainer } from "./NavbarContainer";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/firebase/auth";
import { useAuth } from "@/contexts/AuthContext";
import { LocationToggler } from "@/components/dashboard/utils/LocationToggler";
import {
  dashboardNavItems,
  landingNavItems,
  getIsActive,
} from "@/lib/navigation";
import { useEffect, useState } from "react";

export function UnifiedNavbar({
  variant,
}: {
  variant: "landing" | "dashboard";
}) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [hash, setHash] = useState("");

  useEffect(() => {
    setHash(window.location.hash);
    const handleHashChange = () => {
      setHash(window.location.hash);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const scrollToSection = (href: string) => {
    const anchorHash = href.substring(1);
    if (pathname !== "/") {
      router.push(href);
      return;
    }
    setHash(anchorHash);
    document
      .getElementById(anchorHash.replace("#", ""))
      ?.scrollIntoView({ behavior: "smooth" });
    window.history.pushState(null, "", href);
  };

  const navItems =
    variant === "dashboard" ? dashboardNavItems : landingNavItems;

  return (
    <NavbarContainer>
      <div className="shrink-0 pl-2">
        <Logo href={user ? "/locations" : "/"} />
      </div>

      <nav className="hidden md:flex items-center flex-1 justify-center h-full gap-1">
        {navItems.map((item) => {
          const isItemActive = getIsActive(pathname, item.href, hash);

          if (variant === "landing" && item.href.startsWith("/#")) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => scrollToSection(item.href)}
                className={`text-sm font-medium px-4 py-2 rounded-lg ${
                  isItemActive
                    ? "text-gray-900 font-semibold"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {item.label}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`text-sm font-medium px-4 py-2 rounded-lg ${
                isItemActive
                  ? "text-gray-900 font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 shrink-0 pr-2">
        {user ? (
          <>
            {variant === "dashboard" && <LocationToggler />}
            {variant === "landing" && (
              <Link href="/locations">
                <Button size="sm">החשבון שלי</Button>
              </Link>
            )}
            <IconButton
              icon={LogOut}
              aria-label="התנתק"
              size="sm"
              onClick={handleSignOut}
            />
          </>
        ) : (
          <Link href="/login">
            <Button size="sm">התחברות</Button>
          </Link>
        )}
      </div>
    </NavbarContainer>
  );
}
