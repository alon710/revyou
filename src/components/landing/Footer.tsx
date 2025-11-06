"use client";

import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary/30 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">
              תשובות AI
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              פתרון AI מתקדם לניהול ותשובות אוטומטיות לביקורות לקוחות. חסכו זמן
              ושפרו את המוניטין העסקי שלכם.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="mailto:alon710@gmail.com"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>alon710@gmail.com</span>
              </a>
              <a
                href="tel:+972-50-671-5060"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>050-671-5060</span>
              </a>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>תל אביב, ישראל</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              המוצר
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() =>
                    document
                      .getElementById("how-it-works")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  איך זה עובד
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    document
                      .getElementById("pricing")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  מחירון
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    document
                      .getElementById("faq")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  שאלות נפוצות
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              משאבים
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/sitemap"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  מפת אתר
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              מידע משפטי
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  מדיניות פרטיות
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  תנאי שימוש
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} תשובות AI. כל הזכויות שמורות.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
