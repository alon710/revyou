"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

export default function DashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="דף הבית"
        description="סקירה כללית של הביקורות והתגובות"
      />
    </PageContainer>
  );
}
