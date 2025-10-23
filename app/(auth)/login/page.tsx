"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithGoogle } from "@/lib/firebase/auth";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/ui/Logo";
import { Loading } from "@/components/ui/loading";
import { Chrome } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/businesses");
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
      router.push("/businesses");
    }
  };

  if (authLoading) {
    return <Loading fullScreen />;
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="justify-center mb-4" textClassName="text-3xl" />
          <p className="text-gray-600">היכנס כדי להתחיל לנהל את הביקורות שלך</p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>התחברות</CardTitle>
            <CardDescription>התחבר עם חשבון Google שלך להמשך</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Google Sign In Button */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full gap-2"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loading size="sm" />
                  מתחבר...
                </>
              ) : (
                <>
                  <Chrome className="h-5 w-5" />
                  התחבר עם Google
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Terms & Privacy */}
        <p className="text-center text-sm text-gray-600 mt-6">
          על ידי התחברות, אתה מסכים ל
          <Link href="/terms" className="text-primary hover:underline mx-1">
            תנאי השימוש
          </Link>
          ול
          <Link href="/privacy" className="text-primary hover:underline mx-1">
            מדיניות הפרטיות
          </Link>
        </p>
      </div>
    </div>
  );
}
