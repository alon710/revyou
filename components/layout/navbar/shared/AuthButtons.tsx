"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/firebase/auth";
import { useAuth } from "@/contexts/AuthContext";
import { User, LogOut } from "lucide-react";

interface AuthButtonsProps {
  variant?: "desktop" | "mobile";
  onAction?: () => void;
}

export function AuthButtons({
  variant = "desktop",
  onAction,
}: AuthButtonsProps) {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    onAction?.();
  };

  const handleAccountClick = () => {
    router.push("/locations");
    onAction?.();
  };

  const buttonClass = variant === "mobile" ? "w-full" : "";

  if (user) {
    if (variant === "mobile") {
      return (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAccountClick}
            className="p-2 text-sm font-medium text-gray-900 hover:text-purple-700 hover:bg-gray-50 rounded-lg transition-all duration-200 cursor-pointer"
            aria-label="החשבון שלי"
          >
            <User className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="p-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer"
            aria-label="התנתק"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 px-2">
        <button
          type="button"
          onClick={handleAccountClick}
          className="px-4 py-2 text-sm font-medium text-gray-900 hover:text-purple-700 hover:bg-gray-50 rounded-lg transition-all duration-200 cursor-pointer"
        >
          החשבון שלי
        </button>
        <div className="w-px h-4 bg-gray-200" />
        <button
          type="button"
          onClick={handleSignOut}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer"
        >
          התנתק
        </button>
      </div>
    );
  }

  return (
    <>
      <Link href="/login">
        <Button variant="outline" className={buttonClass}>
          התחברות
        </Button>
      </Link>
      <Link href="/login">
        <Button className={buttonClass}>התחל ניסיון חינם</Button>
      </Link>
    </>
  );
}
