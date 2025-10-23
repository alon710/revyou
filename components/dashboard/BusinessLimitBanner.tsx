import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Crown } from "lucide-react";
import Link from "next/link";
import { SubscriptionTier } from "@/types/database";

interface BusinessLimitBannerProps {
  currentTier: SubscriptionTier;
  currentCount: number;
  maxAllowed: number;
}

/**
 * Business Limit Banner
 * Shows subscription limit info and upgrade prompt
 */
export default function BusinessLimitBanner({
  currentTier,
  currentCount,
  maxAllowed,
}: BusinessLimitBannerProps) {
  const isAtLimit = currentCount >= maxAllowed;
  const remaining = maxAllowed - currentCount;

  // Don't show banner if user has unlimited businesses
  if (maxAllowed === Infinity) {
    return null;
  }

  return (
    <Alert variant={isAtLimit ? "destructive" : "default"}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>
        {isAtLimit ? "הגעת למגבלת העסקים" : "מגבלת עסקים"}
      </AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          {isAtLimit ? (
            <p>
              השתמשת בכל {maxAllowed} העסקים המותרים בחבילת{" "}
              {getTierName(currentTier)} שלך. שדרג כדי לחבר עסקים נוספים.
            </p>
          ) : (
            <p>
              אתה משתמש ב-{currentCount} מתוך {maxAllowed} עסקים בחבילת{" "}
              {getTierName(currentTier)} שלך.
              {remaining === 1
                ? " נשאר עסק אחד."
                : ` נותרו ${remaining} עסקים.`}
            </p>
          )}
        </div>

        {isAtLimit && (
          <Button asChild variant="default" size="sm" className="mr-4">
            <Link href="/billing">
              <Crown className="ml-2 h-4 w-4" />
              שדרג עכשיו
            </Link>
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

function getTierName(tier: SubscriptionTier): string {
  const names: Record<SubscriptionTier, string> = {
    free: "חינם",
    basic: "בסיסי",
    pro: "מקצועי",
    enterprise: "ארגוני",
  };
  return names[tier];
}
