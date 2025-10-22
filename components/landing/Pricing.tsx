import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "חינם",
    price: "₪0",
    period: "לחודש",
    description: "מושלם להתחלה ולעסקים קטנים",
    features: [
      "עסק אחד",
      "עד 10 ביקורות בחודש",
      "תשובות AI בסיסיות",
      "אישור ידני נדרש",
      "תמיכה בעברית ואנגלית",
      "התאמת טון דיבור",
    ],
    cta: "התחל בחינם",
    popular: false,
  },
  {
    name: "בסיסי",
    price: "₪99",
    period: "לחודש",
    description: "לעסקים קטנים ובינוניים",
    features: [
      "עד 3 עסקים",
      "עד 100 ביקורות בחודש",
      "תשובות AI מתקדמות",
      "פרסום אוטומטי (אופציונלי)",
      "תמיכה רב-לשונית",
      "התאמה אישית מלאה",
      "דשבורד ניתוח",
      "תמיכה באימייל",
    ],
    cta: "התחל ניסיון",
    popular: true,
  },
  {
    name: "מקצועי",
    price: "₪249",
    period: "לחודש",
    description: "לעסקים גדולים עם צרכים מתקדמים",
    features: [
      "עד 10 עסקים",
      "עד 500 ביקורות בחודש",
      "תשובות AI מתקדמות ביותר",
      "פרסום אוטומטי מלא",
      "כל התכונות של התוכנית הבסיסית",
      "ניתוח סנטימנט",
      "דוחות מתקדמים",
      "תמיכה טלפונית",
      "API גישה",
    ],
    cta: "התחל ניסיון",
    popular: false,
  },
  {
    name: "ארגוני",
    price: "מותאם אישית",
    period: "",
    description: "לארגונים גדולים ורשתות",
    features: [
      "עסקים ללא הגבלה",
      "ביקורות ללא הגבלה",
      "כל התכונות של התוכנית המקצועית",
      "ניהול צוות מתקדם",
      "אינטגרציות מותאמות אישית",
      "מנהל חשבון ייעודי",
      "הדרכה והטמעה",
      "SLA מובטח",
    ],
    cta: "צור קשר",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 sm:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            תוכניות מחיר שמתאימות לכם
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            בחרו את התוכנית המתאימה לעסק שלכם. ניתן לשדרג או להוריד דרגה בכל עת
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative p-8 flex flex-col ${
                plan.popular
                  ? "border-primary border-2 shadow-xl scale-105"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 right-1/2 translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  הכי פופולרי
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground">/{plan.period}</span>
                  )}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link href="/register" className="w-full">
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            כל התוכניות כוללות ניסיון חינם ל-14 יום. ללא צורך בכרטיס אשראי.
          </p>
        </div>
      </div>
    </section>
  );
}
