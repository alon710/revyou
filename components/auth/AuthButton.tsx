"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AuthButtonProps {
  size?: "sm" | "default" | "lg";
  className?: string;
  showAccountButton?: boolean;
}

export function AuthButton({
  size = "sm",
  className,
  showAccountButton = false,
}: AuthButtonProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (loading) {
    return <Skeleton className={cn("h-9 w-20", className)} />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        {showAccountButton && (
          <Link href="/dashboard/locations">
            <Button size={size} className={className}>
              החשבון שלי
            </Button>
          </Link>
        )}
        <IconButton
          icon={LogOut}
          aria-label="התנתק"
          size={size}
          onClick={handleSignOut}
          className={className}
        />
      </div>
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
