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
import type { PlanLimits } from "@/lib/stripe/entitlements";
import type { Subscription } from "@/lib/hooks/useSubscription";
import { getUsagePercentages } from "@/lib/subscription/usage-stats";
import { formatHebrewDate, getCurrentBillingPeriod } from "@/lib/subscription/billing-period";

interface SubscriptionInfoProps {
  limits: PlanLimits;
  subscription: Subscription | null;
  currentBusinesses: number;
  currentReviews: number;
}

export function SubscriptionInfo({
  limits,
  currentBusinesses,
  currentReviews,
}: SubscriptionInfoProps) {
  const { businessesPercent, reviewsPercent } = getUsagePercentages(
    currentBusinesses,
    currentReviews,
    limits
  );
  const { resetDate } = getCurrentBillingPeriod();

  return (
    <div className="space-y-6">
      <DashboardCard>
        <DashboardCardHeader>
          <DashboardCardTitle>שימוש ומגבלות</DashboardCardTitle>
          <DashboardCardDescription>
            מעקב אחר השימוש שלך בתוכנית הנוכחית
          </DashboardCardDescription>
        </DashboardCardHeader>
        <DashboardCardContent className="space-y-6">
          <DashboardCardField label="עסקים מחוברים">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {currentBusinesses} / {limits.businesses} עסקים
                </span>
                <span className="text-muted-foreground">
                  {businessesPercent}%
                </span>
              </div>
              <Progress value={businessesPercent} />
            </div>
          </DashboardCardField>

          <DashboardCardField label="ביקורות החודש">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {currentReviews} / {limits.reviewsPerMonth} ביקורות
                </span>
                <span className="text-muted-foreground">{reviewsPercent}%</span>
              </div>
              <Progress value={reviewsPercent} />
              <p className="text-xs text-muted-foreground">
                מתאפס ב-{formatHebrewDate(resetDate)}
              </p>
            </div>
          </DashboardCardField>
        </DashboardCardContent>
      </DashboardCard>
    </div>
  );
}
