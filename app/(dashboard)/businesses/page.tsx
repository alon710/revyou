"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { deleteBusiness } from "@/lib/firebase/businesses";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { SUBSCRIPTION_LIMITS } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/ui/loading";
import BusinessDetailsCard from "@/components/dashboard/BusinessDetailsCard";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";

export default function BusinessesPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    currentBusiness,
    businesses,
    loading: businessLoading,
    refreshBusinesses,
  } = useBusiness();
  const { planType } = useSubscription();

  const handleDelete = async () => {
    if (!currentBusiness || !user) return;

    try {
      await deleteBusiness(user.uid, currentBusiness.id);
      await refreshBusinesses();
    } catch (error) {
      console.error("Error deleting business:", error);
    }
  };

  const maxBusinesses = SUBSCRIPTION_LIMITS[planType].businesses;
  const canAddMore =
    maxBusinesses === Infinity || businesses.length < maxBusinesses;

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
        actions={
          <>
            <DeleteConfirmation
              title="מחיקת עסק"
              description={`פעולה זו תמחק את העסק "${currentBusiness.name}" לצמיתות!`}
              confirmationText={currentBusiness.name}
              confirmationLabel="כדי לאשר, הקלד את שם העסק:"
              confirmationPlaceholder="שם העסק"
              onDelete={handleDelete}
              deleteButtonText="מחק עסק"
              variant="inline"
            />
            <Button asChild disabled={!canAddMore} variant="outline" size="sm">
              <Link href="/businesses/connect">הוסף עסק</Link>
            </Button>
          </>
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
