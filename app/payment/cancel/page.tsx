"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PaymentResultCard } from "@/components/payment/PaymentResultCard";

export default function PaymentCancelPage() {
  return (
    <PaymentResultCard
      variant="cancel"
      title="התשלום בוטל"
      description={
        <>
          התהליך בוטל ולא בוצע תשלום.
          <br />
          תוכל לחזור ולהירשם בכל עת שתרצה.
        </>
      }
      footer={
        <>
          יש לך שאלות?{" "}
          <a
            href="mailto:support@example.com"
            className="text-primary hover:underline"
          >
            צור קשר עם התמיכה
          </a>
        </>
      }
    >
      <Link href="/#pricing" className="block">
        <Button className="w-full">חזרה לתוכניות המחיר</Button>
      </Link>

      <Link href="/businesses" className="block">
        <Button variant="outline" className="w-full">
          עבור לעסקים שלי
        </Button>
      </Link>
    </PaymentResultCard>
  );
}
