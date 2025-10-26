"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      // Check if there's a return URL (for payment flow)
      const searchParams = new URLSearchParams(window.location.search);
      const returnTo = searchParams.get("returnTo");
      const plan = searchParams.get("plan");
      const period = searchParams.get("period");

      if (returnTo && plan && period) {
        // Build complete payment URL with user info
        try {
          const url = new URL(returnTo);
          if (user.email) {
            url.searchParams.set("prefilled_email", user.email);
          }
          url.searchParams.set("client_reference_id", user.uid);

          // Redirect to Stripe payment
          window.location.href = url.toString();
        } catch (error) {
          console.error("Error parsing return URL:", error);
          // Fallback to normal flow
          router.push("/businesses");
        }
      } else {
        // Normal flow - go to dashboard
        router.push("/businesses");
      }
    }
  }, [user, authLoading, router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    const { user, error } = await signInWithGoogle();

    if (error) {
      setError(error);
      setIsLoading(false);
    } else if (user) {
      // Check if there's a return URL (for payment flow)
      const searchParams = new URLSearchParams(window.location.search);
      const returnTo = searchParams.get("returnTo");
      const plan = searchParams.get("plan");
      const period = searchParams.get("period");

      if (returnTo && plan && period) {
        // Build complete payment URL with user info
        try {
          const url = new URL(returnTo);
          if (user.email) {
            url.searchParams.set("prefilled_email", user.email);
          }
          url.searchParams.set("client_reference_id", user.uid);

          // Redirect to Stripe payment
          window.location.href = url.toString();
        } catch (error) {
          console.error("Error parsing return URL:", error);
          // Fallback to normal flow
          router.push("/businesses");
        }
      } else {
        // Normal flow - go to dashboard
        router.push("/businesses");
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
          <Logo className="justify-center mb-4" textClassName="text-3xl" />
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
            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/40 text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

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
