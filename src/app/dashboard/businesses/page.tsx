"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { deleteBusiness } from "@/lib/firebase/business";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/ui/loading";
import BusinessDetailsCard from "@/components/dashboard/businesses/BusinessDetailsCard";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";

const EMPTY_STATE_PROPS = {
  title: "עדיין לא חיברת עסקים",
  description:
    "חבר את חשבון Google Business Profile שלך כדי להתחיל לקבל תשובות AI אוטומטיות לביקורות הלקוחות שלך",
  buttonText: "חבר עסק ראשון",
  buttonLink: "/onboarding/step-2",
};

export default function BusinessesPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    currentAccount,
    currentBusiness,
    businesses,
    loading: businessLoading,
    refreshBusinesses,
  } = useBusiness();
  const { limits } = useSubscription();

  const handleDelete = async () => {
    if (!currentBusiness || !currentAccount || !user) return;

    try {
      await deleteBusiness(user.uid, currentAccount.id, currentBusiness.id);
      await refreshBusinesses();
    } catch (error) {
      console.error("Error deleting business:", error);
    }
  };

  const maxBusinesses = limits.businesses;
  const canAddMore = businesses.length < maxBusinesses;

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
        <EmptyState {...EMPTY_STATE_PROPS} />
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
              <Link href="/onboarding/step-2">הוסף עסק</Link>
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
