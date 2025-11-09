"use client";

import { useState } from "react";
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
  const [isNavigating, setIsNavigating] = useState(false);

  if (loading) {
    return null;
  }

  if (user) {
    return (
      <>
        {variant === "landing" && (
          <Link href="/dashboard/home" onClick={() => setIsNavigating(true)}>
            <Button size={size} className={className} disabled={isNavigating}>
              {isNavigating ? "מעביר..." : "החשבון שלי"}
            </Button>
          </Link>
        )}
        {variant === "dashboard" && <UserAvatarDropdown />}
      </>
    );
  }

  return (
    <Link href="/login" onClick={() => setIsNavigating(true)}>
      <Button size={size} className={className} disabled={isNavigating}>
        {isNavigating ? "מתחבר..." : "התחברות"}
      </Button>
    </Link>
  );
}
