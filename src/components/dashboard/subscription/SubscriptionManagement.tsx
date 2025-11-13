"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ExternalLink, CreditCard } from "lucide-react";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
  DashboardCardField,
} from "@/components/ui/dashboard-card";
import { type PlanLimits, type PlanType } from "@/lib/stripe/entitlements";
import { type Subscription } from "@/hooks/useSubscription";
import { formatDate, getCurrentBillingPeriod } from "@/lib/subscription/billing-period";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import type { Locale } from "@/i18n/config";

interface SubscriptionManagementProps {
  limits: PlanLimits;
  subscription: Subscription | null;
  currentBusiness: number;
  currentReviews: number;
  businessesPercent: number;
  reviewsPercent: number;
  planType: PlanType;
  stripeLink: string | null;
}

function getPlanBadgeInfo(planType: PlanType, planLabel: string) {
  const planMap = {
    free: { label: planLabel, variant: "secondary" as const },
    basic: { label: planLabel, variant: "default" as const },
    pro: { label: planLabel, variant: "default" as const },
  };
  return planMap[planType];
}

export function SubscriptionManagement({
  limits,
  currentBusiness,
  currentReviews,
  businessesPercent,
  reviewsPercent,
  planType,
  stripeLink,
}: SubscriptionManagementProps) {
  const t = useTranslations("dashboard.subscription");
  const tInfo = useTranslations("dashboard.subscription.info");
  const locale = useLocale() as Locale;
  const { resetDate } = getCurrentBillingPeriod();
  const planLabel = tInfo(`plans.${planType}`);
  const badgeInfo = getPlanBadgeInfo(planType, planLabel);

  const handleManageSubscription = () => {
    if (stripeLink) {
      try {
        const url = new URL(stripeLink);
        if (!url.hostname.includes("stripe.com")) {
          return;
        }
      } catch {
        return;
      }
      window.open(stripeLink, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      <DashboardCard>
        <DashboardCardHeader>
          <div className="flex items-start justify-between">
            <div>
              <DashboardCardTitle>{tInfo("title")}</DashboardCardTitle>
              <DashboardCardDescription>{tInfo("description")}</DashboardCardDescription>
            </div>
            <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
          </div>
        </DashboardCardHeader>
        <DashboardCardContent className="space-y-6">
          <DashboardCardField label={tInfo("businessesLabel")}>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {tInfo("businessesCount", { current: currentBusiness, max: limits.businesses })}
                </span>
                <span className="text-muted-foreground">{businessesPercent}%</span>
              </div>
              <Progress value={businessesPercent} />
            </div>
          </DashboardCardField>

          <DashboardCardField label={tInfo("reviewsLabel")}>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {tInfo("reviewsCount", { current: currentReviews, max: limits.reviewsPerMonth })}
                </span>
                <span className="text-muted-foreground">{reviewsPercent}%</span>
              </div>
              <Progress value={reviewsPercent} />
              <p className="text-xs text-muted-foreground">
                {tInfo("resetsOn", { date: formatDate(resetDate, locale) })}
              </p>
            </div>
          </DashboardCardField>
        </DashboardCardContent>
      </DashboardCard>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild variant="default" size="lg">
          <Link href="/#pricing">
            <CreditCard className="w-4 h-4 me-2" />
            {t("viewAllPlans")}
          </Link>
        </Button>

        {stripeLink && planType !== "free" && (
          <Button onClick={handleManageSubscription} variant="outline" size="lg">
            <ExternalLink className="w-4 h-4 me-2" />
            {t("manageSubscription")}
          </Button>
        )}
      </div>
    </div>
  );
}
