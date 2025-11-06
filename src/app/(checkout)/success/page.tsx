"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { completeOnboarding } from "@/lib/firebase/users";
import { Loader2, CheckCircle2 } from "lucide-react";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [completing, setCompleting] = useState(true);
  const onboarding = searchParams.get("onboarding") === "true";

  useEffect(() => {
    async function handleSuccess() {
      if (authLoading) return;

      if (!user) {
        router.push("/login");
        return;
      }

      if (onboarding) {
        try {
          // Complete onboarding for the user
          await completeOnboarding(user.uid);
          setCompleting(false);

          // Wait a moment before redirecting to show success message
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        } catch (error) {
          console.error("Error completing onboarding:", error);
          // Even if there's an error, redirect to dashboard
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        }
      } else {
        // Not in onboarding mode, just redirect to dashboard
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    }

    handleSuccess();
  }, [user, authLoading, router, onboarding]);

  if (authLoading || completing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">מעבד תשלום...</h2>
            <p className="text-muted-foreground">מכין את החשבון שלך</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">ברוך הבא!</h2>
          <p className="text-muted-foreground">
            החשבון שלך מוכן. מעביר אותך לדשבורד...
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
