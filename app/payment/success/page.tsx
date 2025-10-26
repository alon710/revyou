"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PaymentResultCard } from "@/components/payment/PaymentResultCard";

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
    <PaymentResultCard
      variant="success"
      title="תשלום בוצע בהצלחה!"
      description={
        <>
          המנוי שלך הופעל בהצלחה
          {billingPeriod && ` (${getBillingText()})`}.
          <br />
          תוכל להתחיל להשתמש בכל התכונות המתקדמות כבר עכשיו.
        </>
      }
      metadata={sessionId ? `מזהה עסקה: ${sessionId}` : undefined}
      footer={`מועבר אוטומטית בעוד ${countdown} שניות...`}
    >
      <Link href="/businesses" className="block">
        <Button className="w-full">עבור לעסקים שלי</Button>
      </Link>

      <Link href="/settings" className="block">
        <Button variant="outline" className="w-full">
          הגדרות מנוי
        </Button>
      </Link>
    </PaymentResultCard>
  );
}
