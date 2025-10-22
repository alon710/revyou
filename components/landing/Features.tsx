import { Card } from "@/components/ui/card";
import {
  Zap,
  Brain,
  Settings,
  Languages,
  Star,
  BarChart,
  Shield,
  Clock,
  MessageCircle,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "בינה מלאכותית מתקדמת",
    description:
      "מנוע AI חכם המבוסס על Gemini שמבין את הקונטקסט ויוצר תשובות טבעיות ומקצועיות",
  },
  {
    icon: Zap,
    title: "תשובות אוטומטיות",
    description:
      "קבלו תשובות מיידיות לכל ביקורת חדשה ללא צורך בהתערבות ידנית - חסכו שעות עבודה",
  },
  {
    icon: Settings,
    title: "התאמה אישית מלאה",
    description:
      "הגדירו את טון הדיבור, סגנון התשובה ותבניות שונות לכל דירוג כוכבים",
  },
  {
    icon: Languages,
    title: "תמיכה רב-לשונית",
    description:
      "תמיכה מלאה בעברית, אנגלית וזיהוי אוטומטי של שפת המבקר להתאמה מושלמת",
  },
  {
    icon: Star,
    title: "טיפול חכם בדירוגים",
    description:
      "הגדרות מותאמות לכל רמת דירוג - תשובות שונות ל-5 כוכבים לעומת 1 כוכב",
  },
  {
    icon: MessageCircle,
    title: "עריכה לפני פרסום",
    description:
      "בדקו ואשרו כל תשובה לפני שהיא מתפרסמת, או הפעילו מצב אוטומטי מלא",
  },
  {
    icon: BarChart,
    title: "דשבורד מתקדם",
    description:
      "עקבו אחר הביקורות, תשובות ונתוני ביצועים במקום אחד מרכזי ונוח",
  },
  {
    icon: Clock,
    title: "חיסכון בזמן",
    description:
      "חסכו עד 90% מהזמן שמושקע בניהול תשובות לביקורות והתמקדו בעסק",
  },
  {
    icon: Shield,
    title: "בטיחות ואבטחה",
    description:
      "אינטגרציה מאובטחת עם Google Business Profile ואבטחת מידע ברמה הגבוהה ביותר",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            למה לבחור ב<span className="text-primary">תשובות AI</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            פלטפורמה מקיפה שמשלבת טכנולוגיית AI מתקדמת עם ממשק פשוט וידידותי
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex flex-col h-full">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
