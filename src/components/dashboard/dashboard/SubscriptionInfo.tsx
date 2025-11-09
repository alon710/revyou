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
import type { PlanLimits, PlanType } from "@/lib/stripe/entitlements";
import type { Subscription } from "@/hooks/useSubscription";
import { formatHebrewDate, getCurrentBillingPeriod } from "@/lib/subscription/billing-period";

interface SubscriptionInfoProps {
  limits: PlanLimits;
  subscription: Subscription | null;
  currentBusiness: number;
  currentReviews: number;
  businessesPercent: number;
  reviewsPercent: number;
  planType: PlanType;
}

function getPlanBadgeInfo(planType: PlanType) {
  const planMap = {
    free: { label: "חינם", variant: "secondary" as const },
    basic: { label: "בסיסית", variant: "default" as const },
    pro: { label: "פרו", variant: "default" as const },
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
  const { resetDate } = getCurrentBillingPeriod();
  const badgeInfo = getPlanBadgeInfo(planType);

  return (
    <div className="space-y-6">
      <DashboardCard>
        <DashboardCardHeader>
          <div className="flex items-start justify-between">
            <div>
              <DashboardCardTitle>שימוש ומגבלות</DashboardCardTitle>
              <DashboardCardDescription>מעקב אחר השימוש שלך בתוכנית הנוכחית</DashboardCardDescription>
            </div>
            <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
          </div>
        </DashboardCardHeader>
        <DashboardCardContent className="space-y-6">
          <DashboardCardField label="עסקים מחוברים">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {currentBusiness} מתוך {limits.businesses} עסקים
                </span>
                <span className="text-muted-foreground">{businessesPercent}%</span>
              </div>
              <Progress value={businessesPercent} />
            </div>
          </DashboardCardField>

          <DashboardCardField label="ביקורות החודש">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {currentReviews} מתוך {limits.reviewsPerMonth} ביקורות
                </span>
                <span className="text-muted-foreground">{reviewsPercent}%</span>
              </div>
              <Progress value={reviewsPercent} />
              <p className="text-xs text-muted-foreground">מתאפס ב-{formatHebrewDate(resetDate)}</p>
            </div>
          </DashboardCardField>
        </DashboardCardContent>
      </DashboardCard>
    </div>
  );
}
