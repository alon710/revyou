import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, Star, MessageSquare } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-secondary/20 py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              בינה מלאכותית מתקדמת לעסק שלך
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            תשובות מקצועיות לביקורות
            <span className="text-primary"> באופן אוטומטי</span>
          </h1>

          {/* Subheading */}
          <p className="mb-10 text-lg text-muted-foreground sm:text-xl md:text-2xl max-w-3xl mx-auto">
            חסכו זמן יקר והגיבו לכל ביקורת בצורה אישית ומקצועית עם הכוח של בינה מלאכותית.
            שמרו על קול המותג שלכם ושפרו את המוניטין העסקי.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-6">
                התחל ניסיון חינם
                <Sparkles className="mr-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                גלה איך זה עובד
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <span>תשובות מותאמות אישית</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span>תמיכה בעברית ואנגלית</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>אינטגרציה עם Google Business</span>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
      </div>
    </section>
  );
}
