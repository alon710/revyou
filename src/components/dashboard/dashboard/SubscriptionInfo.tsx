"use client";

import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
  DashboardCardField,
} from "@/components/ui/dashboard-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { PlanLimits, PlanTier } from "@/lib/subscriptions/plans";
import type { Subscription } from "@/lib/types/subscription.types";
import { formatDate, getCurrentBillingPeriod } from "@/lib/subscriptions/billing-period";
import { useTranslations, useLocale } from "next-intl";
import type { Locale } from "@/lib/locale";

interface SubscriptionInfoProps {
  limits: PlanLimits;
  subscription: Subscription | null;
  currentBusiness: number;
  currentReviews: number;
  businessesPercent: number;
  reviewsPercent: number;
  planType: PlanTier;
}

function getPlanBadgeInfo(planType: PlanTier, planLabel: string) {
  const planMap = {
    free: { label: planLabel, variant: "secondary" as const },
    basic: { label: planLabel, variant: "default" as const },
    pro: { label: planLabel, variant: "default" as const },
  };
  return planMap[planType];
}

export function SubscriptionInfo({
  limits,
  currentBusiness,
  currentReviews,
  businessesPercent,
  reviewsPercent,
  planType,
}: SubscriptionInfoProps) {
  const t = useTranslations("dashboard.subscription.info");
  const locale = useLocale() as Locale;
  const { resetDate } = getCurrentBillingPeriod();
  const planLabel = t(`plans.${planType}`);
  const badgeInfo = getPlanBadgeInfo(planType, planLabel);

  return (
    <div className="space-y-6">
      <DashboardCard>
        <DashboardCardHeader>
          <div className="flex items-start justify-between">
            <div>
              <DashboardCardTitle>{t("title")}</DashboardCardTitle>
              <DashboardCardDescription>{t("description")}</DashboardCardDescription>
            </div>
            <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
          </div>
        </DashboardCardHeader>
        <DashboardCardContent className="space-y-6">
          <DashboardCardField label={t("businessesLabel")}>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {t("businessesCount", { current: currentBusiness, max: limits.businesses })}
                </span>
                <span className="text-muted-foreground">{businessesPercent}%</span>
              </div>
              <Progress value={businessesPercent} />
            </div>
          </DashboardCardField>

          <DashboardCardField label={t("reviewsLabel")}>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {t("reviewsCount", { current: currentReviews, max: limits.reviewsPerMonth })}
                </span>
                <span className="text-muted-foreground">{reviewsPercent}%</span>
              </div>
              <Progress value={reviewsPercent} />
              <p className="text-xs text-muted-foreground">{t("resetsOn", { date: formatDate(resetDate, locale) })}</p>
            </div>
          </DashboardCardField>
        </DashboardCardContent>
      </DashboardCard>
    </div>
  );
}
