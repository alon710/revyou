"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="text-6xl font-bold text-foreground mb-4">500</div>
        <h1 className="text-2xl font-bold text-foreground mb-3">
          משהו השתבש
        </h1>
        <p className="text-muted-foreground mb-6">
          אירעה שגיאה בלתי צפויה. אנא נסה שוב מאוחר יותר.
        </p>
        <div className="space-y-3">
          <Button onClick={reset} className="w-full">
            <RefreshCw className="ml-2 h-4 w-4" />
            נסה שוב
          </Button>
          <Link href="/" className="block">
            <Button variant="outline" className="w-full">
              <Home className="ml-2 h-4 w-4" />
              חזרה לעמוד הבית
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
