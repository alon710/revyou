"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
            <X className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-3">התשלום בוטל</h1>

        <p className="text-muted-foreground mb-8">
          התהליך בוטל ולא בוצע תשלום.
          <br />
          תוכל לחזור ולהירשם בכל עת שתרצה.
        </p>

        <div className="space-y-3">
          <Link href="/#pricing" className="block">
            <Button className="w-full">חזרה לתוכניות המחיר</Button>
          </Link>

          <Link href="/businesses" className="block">
            <Button variant="outline" className="w-full">
              עבור לעסקים שלי
            </Button>
          </Link>
        </div>

        <p className="text-sm text-muted-foreground mt-6">
          יש לך שאלות?{" "}
          <a
            href="mailto:support@example.com"
            className="text-primary hover:underline"
          >
            צור קשר עם התמיכה
          </a>
        </p>
      </Card>
    </div>
  );
}
