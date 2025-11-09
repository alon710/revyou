"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

export default function InsightsPage() {
  return (
    <PageContainer>
      <PageHeader title="תובנות" description="סטטיסטיקות ותובנות על העסק שלך" />

      <div className="flex items-center justify-center min-h-[400px]">
        <h1 className="text-4xl font-bold text-muted-foreground">בקרוב</h1>
      </div>
    </PageContainer>
  );
}
