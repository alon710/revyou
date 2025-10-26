"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);

  const sessionId = searchParams.get("session_id");
  const billingPeriod = searchParams.get("billing_period") as
    | "monthly"
    | "yearly"
    | null;

  useEffect(() => {
    // Countdown timer before redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/businesses");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const getBillingText = () => {
    if (!billingPeriod) return "";
    return billingPeriod === "yearly" ? "שנתי" : "חודשי";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-3">
          תשלום בוצע בהצלחה!
        </h1>

        <p className="text-muted-foreground mb-6">
          המנוי שלך הופעל בהצלחה
          {billingPeriod && ` (${getBillingText()})`}.
          <br />
          תוכל להתחיל להשתמש בכל התכונות המתקדמות כבר עכשיו.
        </p>

        {sessionId && (
          <p className="text-xs text-muted-foreground mb-6">
            מזהה עסקה: {sessionId}
          </p>
        )}

        <div className="space-y-3">
          <Link href="/businesses" className="block">
            <Button className="w-full">עבור לעסקים שלי</Button>
          </Link>

          <Link href="/settings" className="block">
            <Button variant="outline" className="w-full">
              הגדרות מנוי
            </Button>
          </Link>
        </div>

        <p className="text-sm text-muted-foreground mt-6">
          מועבר אוטומטית בעוד {countdown} שניות...
        </p>
      </Card>
    </div>
  );
}
