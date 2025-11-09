"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { UserAvatarDropdown } from "@/components/auth/UserAvatarDropdown";

interface AuthButtonProps {
  size?: "sm" | "default" | "lg";
  className?: string;
  variant?: "landing" | "dashboard";
}

export function AuthButton({ size = "sm", className, variant = "dashboard" }: AuthButtonProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return (
      <>
        {variant === "landing" && (
          <Link href="/dashboard">
            <Button size={size} className={className}>
              החשבון שלי
            </Button>
          </Link>
        )}
        {variant === "dashboard" && <UserAvatarDropdown />}
      </>
    );
  }

  return (
    <Link href="/login">
      <Button size={size} className={className}>
        התחברות
      </Button>
    </Link>
  );
}
