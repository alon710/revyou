"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { useTranslations } from "next-intl";

export default function InsightsPage() {
  const t = useTranslations("dashboard.insights");

  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="flex items-center justify-center min-h-[400px]">
        <h1 className="text-4xl font-bold text-muted-foreground">{t("comingSoon")}</h1>
      </div>
    </PageContainer>
  );
}
