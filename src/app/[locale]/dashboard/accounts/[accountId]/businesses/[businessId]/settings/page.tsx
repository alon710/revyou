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
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

export default function BusinessSettingsPage({
  params,
}: {
  params: Promise<{ accountId: string; businessId: string }>;
}) {
  const { accountId, businessId } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations("dashboard.settings");
  const tCommon = useTranslations("common");
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

      router.push("/dashboard/home");
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
        <PageHeader title={t("businessNotFound")} />
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("businessNotFoundDescription")}</p>
          <BackButton label={tCommon("back")} />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-4">
        <BackButton label={tCommon("back")} />
      </div>

      <PageHeader
        title={business.name}
        description={business.address}
        icon={!business.connected && <Badge variant="secondary">{t("disconnected")}</Badge>}
      />

      <BusinessDetailsCard
        business={business}
        accountId={accountId}
        userId={user!.uid}
        loading={loading}
        onUpdate={fetchBusiness}
      />

      <DeleteConfirmation
        title={t("deleteBusiness")}
        description={t("deleteConfirmation", { businessName: business.name })}
        confirmationText={business.name}
        confirmationLabel={t("deleteConfirmationLabel")}
        confirmationPlaceholder={t("deleteConfirmationPlaceholder")}
        onDelete={handleDelete}
        deleteButtonText={t("deleteButton")}
        cancelLabel={tCommon("cancel")}
        dangerZoneLabel={tCommon("dangerZone")}
        irreversibleActionsLabel={tCommon("irreversibleActions")}
        textMismatchMessage={tCommon("textMismatch")}
        deletingLabel={tCommon("deleting")}
      />
    </PageContainer>
  );
}
