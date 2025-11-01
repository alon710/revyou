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

const landingNavItems = [
  { title: "בית", href: "/" },
  { title: "מחירון", href: "/#pricing" },
  { title: "שאלות נפוצות", href: "/#faq" },
];

const dashboardNavItems = [
  { title: "בית", href: "/locations" },
  { title: "ביקורות", href: "/reviews" },
  { title: "הגדרות", href: "/settings" },
];

export function UnifiedNavbar({
  variant,
}: {
  variant: "landing" | "dashboard";
}) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const scrollToSection = (sectionId: string) => {
    if (pathname !== "/") {
      router.push(`/${sectionId}`);
      return;
    }
    document
      .getElementById(sectionId.replace("/#", ""))
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const navItems =
    variant === "dashboard" ? dashboardNavItems : landingNavItems;
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href);

  return (
    <NavbarContainer>
      <div className="shrink-0 pl-2">
        <Logo href={user ? "/locations" : "/"} />
      </div>

      <nav className="hidden md:flex items-center flex-1 justify-center h-full gap-1">
        {navItems.map((item) => {
          if (variant === "landing" && item.href.startsWith("/#")) {
            return (
              <button
                key={item.title}
                type="button"
                onClick={() => scrollToSection(item.href)}
                className="text-sm font-medium px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900"
              >
                {item.title}
              </button>
            );
          }

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`text-sm font-medium px-4 py-2 rounded-lg ${
                isActive(item.href)
                  ? "text-gray-900 font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 shrink-0 pr-2">
        {user ? (
          <>
            {variant === "dashboard" && <LocationToggler />}
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
