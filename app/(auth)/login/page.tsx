'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle } from '@/lib/firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Chrome, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
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
      // Redirect to dashboard
      router.push('/dashboard');
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't show login form if already authenticated
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            תשובות AI לביקורות
          </h1>
          <p className="text-gray-600">
            היכנס כדי להתחיל לנהל את הביקורות שלך
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>התחברות</CardTitle>
            <CardDescription>
              התחבר עם חשבון Google שלך להמשך
            </CardDescription>
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
                  <Loader2 className="h-5 w-5 animate-spin" />
                  מתחבר...
                </>
              ) : (
                <>
                  <Chrome className="h-5 w-5" />
                  התחבר עם Google
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">או</span>
              </div>
            </div>

            {/* Back to Home */}
            <Link href="/">
              <Button variant="outline" className="w-full">
                חזרה לדף הבית
              </Button>
            </Link>
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
