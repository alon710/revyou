"use client";

import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { BackButton } from "@/components/ui/back-button";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/ui/loading";
import { ConnectBusinessCard } from "@/components/dashboard/businesses/ConnectBusinessCard";

export default function ConnectBusinessPage() {
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="md" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <PageContainer>
      <div className="flex items-center gap-4 mb-6">
        <BackButton href="/dashboard/businesses" />
      </div>

      <PageHeader
        title="חבר עסק חדש"
        description="חבר את חשבון Google Business Profile שלך"
      />

      <ConnectBusinessCard
        userId={user.uid}
        successParam={searchParams.get("success")}
        errorParam={searchParams.get("error")}
        accountIdParam={searchParams.get("accountId")}
      />
    </PageContainer>
  );
}
