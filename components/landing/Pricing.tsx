"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type PlanType = "free" | "basic" | "professional";
type BillingPeriod = "monthly" | "yearly";

interface Feature {
  name: string;
  values: {
    free: string | boolean;
    basic: string | boolean;
    professional: string | boolean;
  };
}

interface Plan {
  id: PlanType;
  name: string;
  monthlyPrice: number;
  description: string;
  cta: string;
  recommended: boolean;
}

const features: Feature[] = [
  {
    name: "מספר עסקים",
    values: { free: "1", basic: "3", professional: "10" },
  },
  {
    name: "ביקורות בחודש",
    values: { free: "5", basic: "250", professional: "1,000" },
  },
  {
    name: "אישור ידני",
    values: { free: "חובה", basic: "אופציונלי", professional: "אופציונלי" },
  },
  {
    name: "פרסום אוטומטי",
    values: { free: false, basic: true, professional: true },
  },
  {
    name: "תמיכה בוואטסאפ",
    values: { free: false, basic: false, professional: true },
  },
];

const YEARLY_DISCOUNT = 0.2;

const plans: Plan[] = [
  {
    id: "free",
    name: "חינם",
    monthlyPrice: 0,
    description: "מושלם להתחלה ולעסקים קטנים",
    cta: "התחל בחינם",
    recommended: false,
  },
  {
    id: "basic",
    name: "בסיסי",
    monthlyPrice: 99,
    description: "לעסקים קטנים ובינוניים",
    cta: "התחל עכשיו",
    recommended: true,
  },
  {
    id: "professional",
    name: "מקצועי",
    monthlyPrice: 349,
    description: "לעסקים גדולים עם צרכים מתקדמים",
    cta: "התחל עכשיו",
    recommended: false,
  },
];

export function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");

  const calculateMonthlyPrice = (monthlyPrice: number) => {
    if (monthlyPrice === 0) return 0;
    if (billingPeriod === "yearly") {
      return Math.round(monthlyPrice * (1 - YEARLY_DISCOUNT));
    }
    return monthlyPrice;
  };

  const formatPrice = (monthlyPrice: number) => {
    const price = calculateMonthlyPrice(monthlyPrice);
    return `₪${price}`;
  };

  return (
    <section id="pricing" className="bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            תוכניות מחיר שמתאימות לכם
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            בחרו את התוכנית המתאימה לעסק שלכם
          </p>

          <Tabs
            value={billingPeriod}
            onValueChange={(value) => setBillingPeriod(value as BillingPeriod)}
            className="w-auto"
          >
            <TabsList>
              <TabsTrigger value="yearly">
                <span className="ms-1 text-xs text-primary">(חסכו 20%)</span>
                שנתי
              </TabsTrigger>
              <TabsTrigger value="monthly">חודשי</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative p-8 flex flex-col rounded-lg ${
                plan.recommended
                  ? "border border-primary/40 shadow-md"
                  : "border border-border/40 shadow-sm"
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 right-1/2 translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  מומלץ
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {plan.description}
                </p>
                <div className="flex flex-col">
                  {billingPeriod === "yearly" && plan.monthlyPrice > 0 && (
                    <span className="text-sm text-muted-foreground line-through mb-1">
                      ₪{plan.monthlyPrice}
                    </span>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">
                      {formatPrice(plan.monthlyPrice)}
                    </span>
                    <span className="text-muted-foreground">/חודש</span>
                  </div>
                  {billingPeriod === "yearly" && plan.monthlyPrice > 0 && (
                    <span className="text-xs text-primary mt-1">
                      חסכון של ₪
                      {Math.round(plan.monthlyPrice * YEARLY_DISCOUNT)} לחודש
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {features.map((feature, index) => {
                  const value = feature.values[plan.id];
                  const isBoolean = typeof value === "boolean";
                  const isEnabled = isBoolean ? value : true;

                  return (
                    <li key={index} className="flex items-start gap-2">
                      {isBoolean ? (
                        isEnabled ? (
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        )
                      ) : (
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`text-sm ${
                          isEnabled
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {isBoolean ? feature.name : `${feature.name}: ${value}`}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <Link href="/register" className="w-full">
                <Button
                  className="w-full"
                  variant={plan.recommended ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
