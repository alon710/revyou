"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Error in settings page:", error);
  }, [error]);

  return <ErrorState onRetry={reset} />;
}
