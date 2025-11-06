"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getBusinessById, deleteBusiness } from "@/lib/firebase/business";
import type { Business } from "@/types/database";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/ui/loading";
import BusinessDetailsCard from "@/components/dashboard/businesses/BusinessDetailsCard";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";
import { useRouter } from "next/navigation";

export default function BusinessSettingsPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = use(params);
  const { user } = useAuth();
  const router = useRouter();

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBusiness = useCallback(async () => {
    if (!user || !businessId) return;

    try {
      setLoading(true);
      const biz = await getBusinessById(user.uid, businessId);
      setBusiness(biz);
    } catch (error) {
      console.error("Error fetching business:", error);
    } finally {
      setLoading(false);
    }
  }, [user, businessId]);

  useEffect(() => {
    fetchBusiness();
  }, [fetchBusiness]);

  const handleDelete = async () => {
    if (!business || !user) return;

    try {
      await deleteBusiness(user.uid, business.accountId, business.id);
      router.push("/dashboard/businesses");
    } catch (error) {
      console.error("Error deleting business:", error);
    }
  };

  if (loading) {
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
      />

      <BusinessDetailsCard
        business={business}
        accountId={business.accountId}
        userId={user!.uid}
        loading={loading}
        onUpdate={fetchBusiness}
      />

      <DeleteConfirmation
        title="מחיקת עסק"
        description={`פעולה זו תמחק את העסק "${business.name}" לצמיתות!`}
        confirmationText={business.name}
        confirmationLabel="כדי לאשר, הקלד את שם העסק:"
        confirmationPlaceholder="שם העסק"
        onDelete={handleDelete}
        deleteButtonText="מחק עסק"
      />
    </PageContainer>
  );
}
