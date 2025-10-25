"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/firebase/auth";
import { useAuth } from "@/contexts/AuthContext";

interface AuthButtonsProps {
  variant?: "desktop" | "mobile";
  onAction?: () => void; // Callback after any action (for closing mobile menu)
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

  const buttonClass = variant === "mobile" ? "w-full" : "";

  if (user) {
    return (
      <>
        <Link href="/businesses">
          <Button className={buttonClass}>החשבון שלי</Button>
        </Link>
        <Button
          variant="outline"
          onClick={handleSignOut}
          className={buttonClass}
        >
          התנתק
        </Button>
      </>
    );
  }

  return (
    <>
      <Link href="/login">
        <Button variant="outline" className={buttonClass}>
          התחברות
        </Button>
      </Link>
      <Link href="/register">
        <Button className={buttonClass}>התחל ניסיון חינם</Button>
      </Link>
    </>
  );
}
