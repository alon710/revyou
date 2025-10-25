"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { deleteBusiness } from "@/lib/firebase/businesses";
import { getUserSubscriptionTier } from "@/lib/firebase/users";
import {
  SubscriptionTier,
  SUBSCRIPTION_LIMITS,
} from "@/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { toast } from "sonner";
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
  const [subscriptionTier, setSubscriptionTier] =
    useState<SubscriptionTier>("free");

  useEffect(() => {
    if (!user || authLoading) return;

    const loadSubscription = async () => {
      try {
        const tier = await getUserSubscriptionTier(user.uid);
        setSubscriptionTier(tier);
      } catch (error) {
        console.error("Error loading subscription:", error);
      }
    };

    loadSubscription();
  }, [user, authLoading]);

  const handleDelete = async () => {
    if (!currentBusiness) return;

    try {
      await deleteBusiness(currentBusiness.id);
      toast.success("העסק נמחק בהצלחה");
      await refreshBusinesses();
    } catch (error) {
      console.error("Error deleting business:", error);
      toast.error("לא ניתן למחוק את העסק");
    }
  };

  const maxBusinesses = SUBSCRIPTION_LIMITS[subscriptionTier].businesses;
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
      />

      <BusinessDetailsCard
        business={currentBusiness}
        loading={businessLoading}
        onUpdate={refreshBusinesses}
      />

      <div className="flex items-center justify-end gap-2 mt-6">
        <DeleteConfirmation
          title="מחיקת עסק"
          description={`פעולה זו תמחק את העסק "${currentBusiness.name}" לצמיתות!`}
          items={[
            "כל הביקורות והתגובות המקושרות",
            "הגדרות ותצורות AI",
            "היסטוריית פעילות",
            "חיבור ל-Google Business Profile",
          ]}
          confirmationText={currentBusiness.name}
          confirmationLabel="כדי לאשר, הקלד את שם העסק:"
          confirmationPlaceholder="שם העסק"
          onDelete={handleDelete}
          deleteButtonText="מחק עסק"
          variant="inline"
        />
        <Button asChild disabled={!canAddMore} size="default">
          <Link href="/businesses/connect">
            <Plus className="ml-2 h-5 w-5" />
            חבר עסק
          </Link>
        </Button>
      </div>
    </PageContainer>
  );
}
