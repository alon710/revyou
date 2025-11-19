"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/empty-state";

function OnboardingChooseBusinessError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("common.errorState");

  useEffect(() => {
    console.error("Error in choose business page:", error);
  }, [error]);

  return <EmptyState title={t("title")} description={t("description")} actionLabel={t("retry")} onAction={reset} />;
}

export default OnboardingChooseBusinessError;
