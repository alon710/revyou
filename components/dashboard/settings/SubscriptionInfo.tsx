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
import {
  formatHebrewDate,
  getCurrentBillingPeriod,
} from "@/lib/subscription/billing-period";

interface SubscriptionInfoProps {
  limits: PlanLimits;
  subscription: Subscription | null;
  currentLocations: number;
  currentReviews: number;
}

export function SubscriptionInfo({
  limits,
  currentLocations,
  currentReviews,
}: SubscriptionInfoProps) {
  const { locationsPercent, reviewsPercent } = getUsagePercentages(
    currentLocations,
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
                  {currentLocations} מתוך {limits.locations} עסקים
                </span>
                <span className="text-muted-foreground">
                  {locationsPercent}%
                </span>
              </div>
              <Progress value={locationsPercent} />
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
