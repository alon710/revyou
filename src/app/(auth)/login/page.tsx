"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithGoogle } from "@/lib/firebase/auth";
import { useAuth } from "@/contexts/AuthContext";
import { getUser } from "@/lib/firebase/users";
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
import { toast } from "sonner";

export const dynamic = "force-dynamic";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkOnboardingStatus() {
      if (!authLoading && user) {
        try {
          const userData = await getUser(user.uid);

          // Check if onboarding is completed
          if (!userData?.onboardingCompleted) {
            router.push("/onboarding/step-1");
            return;
          }

          // Onboarding completed, proceed with normal redirect
          const redirect = searchParams.get("redirect") || "/dashboard";
          router.push(redirect);
        } catch (error) {
          console.error("Error checking onboarding status:", error);
          // On error, proceed to dashboard
          const redirect = searchParams.get("redirect") || "/dashboard";
          router.push(redirect);
        }
      }
    }

    checkOnboardingStatus();
  }, [user, authLoading, router, searchParams]);

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
      try {
        const userData = await getUser(user.uid);

        // Check if onboarding is completed
        if (!userData?.onboardingCompleted) {
          router.push("/onboarding/step-1");
          return;
        }

        // Onboarding completed, proceed with normal redirect
        const redirect = searchParams.get("redirect") || "/dashboard";
        router.push(redirect);
      } catch (err) {
        console.error("Error checking onboarding status:", err);
        // On error, proceed to dashboard
        const redirect = searchParams.get("redirect") || "/dashboard";
        router.push(redirect);
      }
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

        {/* Login Card */}
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
            {/* Google Sign In Button */}
            <GoogleSsoButton
              onClick={handleGoogleSignIn}
              isLoading={isLoading}
            />
          </DashboardCardContent>
        </DashboardCard>

        {/* Terms & Privacy */}
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
