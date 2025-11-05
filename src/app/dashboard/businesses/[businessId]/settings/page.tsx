"use client";

import { use } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/ui/loading";
import BusinessDetailsCard from "@/components/dashboard/businesses/BusinessDetailsCard";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";
import { deleteBusiness } from "@/lib/firebase/business";
import { useRouter } from "next/navigation";

export default function BusinessSettingsPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = use(params);
  const { user, loading: authLoading } = useAuth();
  const {
    businesses,
    loading: businessLoading,
    refreshBusinesses,
    currentAccount,
  } = useBusiness();
  const router = useRouter();

  const business = businesses.find((b) => b.id === businessId);

  const handleDelete = async () => {
    if (!business || !currentAccount || !user) return;

    try {
      await deleteBusiness(user.uid, currentAccount.id, business.id);
      await refreshBusinesses();
      router.push("/dashboard/businesses");
    } catch (error) {
      console.error("Error deleting business:", error);
    }
  };

  if (authLoading || businessLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="md" />
      </div>
    );
  }

  if (!business) {
    return (
      <PageContainer>
        <PageHeader title="עסק לא נמצא" />
        <div className="text-center py-12">
          <p className="text-muted-foreground">העסק המבוקש לא נמצא.</p>
          <BackButton href="/dashboard/businesses" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-4">
        <BackButton href="/dashboard/businesses" />
      </div>

      <PageHeader
        title={business.name}
        description={business.address}
        icon={!business.connected && <Badge variant="secondary">מנותק</Badge>}
        actions={
          <DeleteConfirmation
            title="מחיקת עסק"
            description={`פעולה זו תמחק את העסק "${business.name}" לצמיתות!`}
            confirmationText={business.name}
            confirmationLabel="כדי לאשר, הקלד את שם העסק:"
            confirmationPlaceholder="שם העסק"
            onDelete={handleDelete}
            deleteButtonText="מחק עסק"
            variant="inline"
          />
        }
      />

      <BusinessDetailsCard
        business={business}
        userId={user!.uid}
        loading={businessLoading}
        onUpdate={refreshBusinesses}
      />
    </PageContainer>
  );
}
