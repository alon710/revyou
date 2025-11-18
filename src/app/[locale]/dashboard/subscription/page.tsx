import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { getTranslations } from "next-intl/server";
import { getUserStats } from "@/lib/actions/stats.actions";
import { getActiveSubscription } from "@/lib/actions/subscription.actions";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import type { PlanTier } from "@/lib/subscriptions/plans";
import { SubscriptionInfo } from "@/components/dashboard/dashboard/SubscriptionInfo";
import { UpgradeButton } from "./UpgradeButton";

export const dynamic = "force-dynamic";

export default async function SubscriptionPage() {
  const { userId } = await getAuthenticatedUserId();
  const t = await getTranslations("dashboard.subscription");

  const [stats, subscription] = await Promise.all([getUserStats(userId), getActiveSubscription()]);

  const planType: PlanTier = subscription ? (subscription.planTier as PlanTier) : "free";

  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="space-y-6">
        <SubscriptionInfo
          limits={stats.limits}
          subscription={subscription}
          currentBusiness={stats.businesses}
          currentReviews={stats.reviews}
          businessesPercent={stats.businessesPercent}
          reviewsPercent={stats.reviewsPercent}
          planType={planType}
        />

        <div className="flex gap-3 flex-wrap">
          {planType === "free" && <UpgradeButton />}

          {planType !== "free" && (
            <div className="text-sm text-muted-foreground">
              <p>
                {t("currentPlan")}: {planType.toUpperCase()}
              </p>
              <p className="mt-1">{t("contactSupport")}</p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
