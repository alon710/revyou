import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "next-intl/server";
import { getBusiness } from "@/lib/actions/businesses.actions";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { BusinessSettingsActions } from "./BusinessSettingsActions";

export const dynamic = "force-dynamic";

export default async function BusinessSettingsPage({
  params,
}: {
  params: Promise<{ locale: string; accountId: string; businessId: string }>;
}) {
  const { locale, accountId, businessId } = await params;
  const { userId } = await getAuthenticatedUserId();
  const t = await getTranslations({ locale, namespace: "dashboard.settings" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const business = await getBusiness(userId, accountId, businessId);

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

      <BusinessSettingsActions
        business={business}
        accountId={accountId}
        userId={userId}
        translations={{
          deleteBusiness: t("deleteBusiness"),
          deleteConfirmation: t("deleteConfirmation", { businessName: business.name }),
          deleteConfirmationLabel: t("deleteConfirmationLabel"),
          deleteConfirmationPlaceholder: t("deleteConfirmationPlaceholder"),
          deleteButton: t("deleteButton"),
          cancel: tCommon("cancel"),
          dangerZone: tCommon("dangerZone"),
          irreversibleActions: tCommon("irreversibleActions"),
          textMismatch: tCommon("textMismatch"),
          deleting: tCommon("deleting"),
        }}
      />
    </PageContainer>
  );
}
