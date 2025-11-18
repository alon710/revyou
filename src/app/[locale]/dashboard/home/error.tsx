"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

export default function Error({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.error("Error in home page:", error);
  }, [error]);

  return <ErrorState />;
}
