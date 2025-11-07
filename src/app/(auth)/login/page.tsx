"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithGoogle } from "@/lib/firebase/auth";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardDescription,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/ui/dashboard-card";
import { Logo } from "@/components/ui/Logo";
import { GoogleSsoButton } from "@/components/ui/google-sso-button";
import Link from "next/link";
import { toast } from "sonner";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    const { user, error } = await signInWithGoogle();

    if (error) {
      setError(error);
      setIsLoading(false);
    } else if (user) {
      const redirect = searchParams.get("redirect") || "/dashboard";
      router.push(redirect);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-background to-muted p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="justify-center mb-4" href={"/"} size="xl" />
          <p className="text-muted-foreground">
            היכנס כדי להתחיל לנהל את הביקורות שלך
          </p>
        </div>

        <DashboardCard>
          <DashboardCardHeader className="text-center">
            <DashboardCardTitle className="justify-center">
              התחברות
            </DashboardCardTitle>
            <DashboardCardDescription>
              התחבר עם חשבון Google שלך להמשך
            </DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-4">
            <GoogleSsoButton
              onClick={handleGoogleSignIn}
              isLoading={isLoading}
            />
          </DashboardCardContent>
        </DashboardCard>

        <p className="text-center text-sm text-muted-foreground mt-6">
          בהתחברות, אתה מסכים ל
          <Link
            href="/terms"
            className="text-primary hover:underline transition-all"
          >
            תנאי השימוש
          </Link>{" "}
          ול
          <Link
            href="/privacy"
            className="text-primary hover:underline transition-all"
          >
            מדיניות הפרטיות
          </Link>
        </p>
      </div>
    </div>
  );
}
