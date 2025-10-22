import { Card } from "@/components/ui/card";
import { Link2, Settings, MessageSquare, CheckCircle } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: Link2,
    title: "חיבור חשבון Google Business",
    description:
      "התחברו בקליק אחד לחשבון Google Business Profile שלכם ובחרו את העסק להפעלה",
  },
  {
    number: 2,
    icon: Settings,
    title: "הגדרת העדפות",
    description:
      "התאימו את טון הדיבור, סגנון התשובות והוראות מיוחדות לכל דירוג כוכבים",
  },
  {
    number: 3,
    icon: MessageSquare,
    title: "קבלת תשובות אוטומטיות",
    description:
      "המערכת מזהה ביקורות חדשות ויוצרת תשובות מותאמות אישית באופן אוטומטי",
  },
  {
    number: 4,
    icon: CheckCircle,
    title: "אישור ופרסום",
    description:
      "בדקו ואשרו את התשובות לפני פרסום, או הפעילו מצב פרסום אוטומטי מלא",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-32 bg-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            איך זה עובד?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ארבעה צעדים פשוטים להפעלת המערכת ותשובות אוטומטיות לביקורות
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card
                  key={index}
                  className="p-8 relative overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Step Number */}
                  <div className="absolute top-4 left-4 text-6xl font-bold text-primary/10">
                    {step.number}
                  </div>

                  {/* Content */}
                  <div className="relative">
                    <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-muted-foreground mb-6">
            מוכנים להתחיל? זה לוקח פחות מ-5 דקות
          </p>
          <a
            href="/register"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8"
          >
            התחל עכשיו בחינם
          </a>
        </div>
      </div>
    </section>
  );
}
