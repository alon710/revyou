import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            תשובות מקצועיות לביקורות
            <span className="text-primary"> באופן אוטומטי</span>
          </h1>

          <p className="mb-10 text-lg text-muted-foreground sm:text-xl md:text-2xl max-w-3xl mx-auto">
            חסכו זמן יקר והגיבו לכל ביקורת בצורה אישית ומקצועית עם הכוח של בינה מלאכותית.
            שמרו על קול המותג שלכם ושפרו את המוניטין העסקי.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-6">
                התחל ניסיון חינם
                <Sparkles className="ms-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                גלה איך זה עובד
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
