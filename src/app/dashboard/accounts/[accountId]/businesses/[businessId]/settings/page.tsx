"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Business } from "@/lib/types";
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
  params: Promise<{ accountId: string; businessId: string }>;
}) {
  const { accountId, businessId } = use(params);
  const { user } = useAuth();
  const router = useRouter();

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBusiness = useCallback(async () => {
    if (!user || !accountId || !businessId) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/users/${user.uid}/accounts/${accountId}/businesses/${businessId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch business");
      }

      const { business: biz } = await response.json();
      setBusiness(biz);
    } catch (error) {
      console.error("Error fetching business:", error);
    } finally {
      setLoading(false);
    }
  }, [user, accountId, businessId]);

  useEffect(() => {
    fetchBusiness();
  }, [fetchBusiness]);

  const handleDelete = async () => {
    if (!business || !user) return;

    try {
      const response = await fetch(`/api/users/${user.uid}/accounts/${accountId}/businesses/${businessId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete business");
      }

      router.push(`/dashboard/accounts/${accountId}/businesses`);
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
          <BackButton href={`/dashboard/accounts/${accountId}/businesses`} />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-4">
        <BackButton href={`/dashboard/accounts/${accountId}/businesses`} />
      </div>

      <PageHeader
        title={business.name}
        description={business.address}
        icon={!business.connected && <Badge variant="secondary">מנותק</Badge>}
      />

      <BusinessDetailsCard
        business={business}
        accountId={accountId}
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
