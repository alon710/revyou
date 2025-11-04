"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/ui/loading";
import BusinessDetailsCard from "@/components/dashboard/businesses/BusinessDetailsCard";

export default function BusinessesPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    currentBusiness,
    businesses,
    loading: businessLoading,
    refreshBusinesses,
  } = useBusiness();

  if (authLoading || businessLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="md" />
      </div>
    );
  }

  if (businesses.length === 0 || !currentBusiness) {
    return (
      <PageContainer>
        <PageHeader
          title="העסקים שלי"
          description="נהל את חשבונות Google Business Profile המחוברים שלך"
        />
        <EmptyState />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={currentBusiness.name}
        description={currentBusiness.address}
        icon={
          !currentBusiness.connected && <Badge variant="secondary">מנותק</Badge>
        }
      />

      <BusinessDetailsCard
        business={currentBusiness}
        userId={user!.uid}
        loading={businessLoading}
        onUpdate={refreshBusinesses}
      />
    </PageContainer>
  );
}
