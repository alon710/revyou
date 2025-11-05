"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithGoogle } from "@/lib/firebase/auth";
import { useAuth } from "@/contexts/AuthContext";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardDescription,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/ui/dashboard-card";
import { Logo } from "@/components/ui/Logo";
import { Loading } from "@/components/ui/loading";
import { GoogleSsoButton } from "@/components/ui/google-sso-button";
import Link from "next/link";

export const dynamic = "force-dynamic";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      const redirect = searchParams.get("redirect") || "/dashboard";
      router.push(redirect);
    }
  }, [user, authLoading, router, searchParams]);

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

  if (authLoading) {
    return <Loading fullScreen />;
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
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
            {error && (
              <div className="bg-destructive/10 border border-destructive/40 text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

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

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading fullScreen />}>
      <LoginForm />
    </Suspense>
  );
}
