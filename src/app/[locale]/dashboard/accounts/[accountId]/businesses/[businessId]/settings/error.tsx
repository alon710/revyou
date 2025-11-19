"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/empty-state";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("common.errorState");

  useEffect(() => {
    console.error("Error in business settings page:", error);
  }, [error]);

  return <EmptyState title={t("title")} description={t("description")} actionLabel={t("retry")} onAction={reset} />;
}
