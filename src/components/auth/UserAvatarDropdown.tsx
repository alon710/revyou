"use client";

import { LogOut, Plus, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";

export function UserAvatarDropdown() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("auth");

  const isDashboardPage = pathname?.startsWith("/dashboard");

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error("Sign out failed", error);
    }
    router.push("/");
  };

  const handleAddBusiness = () => {
    router.push("/onboarding/connect-account");
  };

  const handleDashboard = () => {
    router.push("/dashboard/home");
  };

  if (loading) {
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }

  if (!user) {
    return null;
  }

  const displayName = user.user_metadata?.full_name || user.user_metadata?.name;
  const photoURL = user.user_metadata?.avatar_url || user.user_metadata?.picture;

  const getInitials = () => {
    if (displayName) {
      return displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="h-10 w-10 cursor-pointer">
          <AvatarImage src={photoURL || undefined} alt={displayName || "User"} />
          <AvatarFallback className="bg-primary text-primary-foreground">{getInitials()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1 text-end">
            <p className="text-sm font-medium leading-none">{displayName || t("user")}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!isDashboardPage && (
          <DropdownMenuItem
            onSelect={handleDashboard}
            className="cursor-pointer flex justify-between rtl:flex-row-reverse"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>{t("dashboard")}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onSelect={handleAddBusiness}
          className="cursor-pointer flex justify-between rtl:flex-row-reverse"
        >
          <Plus className="h-4 w-4" />
          <span>{t("addBusiness")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleSignOut} className="cursor-pointer flex justify-between rtl:flex-row-reverse">
          <LogOut className="h-4 w-4" />
          <span>{t("signOut")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
