"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, CheckCircle2 } from "lucide-react";

function SuccessContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [redirecting, setRedirecting] = useState(true);

  useEffect(() => {
    async function handleSuccess() {
      if (authLoading) return;

      if (!user) {
        router.push("/login");
        return;
      }

      // Wait a moment before redirecting to show success message
      setTimeout(() => {
        setRedirecting(false);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }, 500);
    }

    handleSuccess();
  }, [user, authLoading, router]);

  if (authLoading || redirecting) {
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
