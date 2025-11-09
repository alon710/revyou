"use client";

import { Button } from "@/components/ui/button";
import { Link2, Settings, MessageSquare, CheckCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const steps = [
  {
    number: 1,
    icon: Link2,
    title: "חיבור חשבון Google Business",
    description: "התחברו בקליק אחד לחשבון Google Business Profile שלכם ובחרו את העסק להפעלה",
  },
  {
    number: 2,
    icon: Settings,
    title: "הגדרת העדפות",
    description: "התאימו את טון הדיבור, סגנון התשובות והוראות מיוחדות לכל דירוג כוכבים",
  },
  {
    number: 3,
    icon: MessageSquare,
    title: "קבלת תשובות אוטומטיות",
    description: "המערכת מזהה ביקורות חדשות ויוצרת תשובות מותאמות אישית באופן אוטומטי",
  },
  {
    number: 4,
    icon: CheckCircle,
    title: "אישור ופרסום",
    description: "בדקו ואשרו את התשובות לפני פרסום, או הפעילו מצב פרסום אוטומטי מלא",
  },
];

export function HowItWorks() {
  return (
    <div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">איך זה עובד?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ארבעה צעדים פשוטים להפעלת המערכת ותשובות אוטומטיות לביקורות
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  className="p-8 relative overflow-hidden border border-border/40 shadow-lg rounded-lg bg-card text-card-foreground cursor-pointer group"
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                    opacity: { duration: 0.3, ease: "easeOut" },
                    scale: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                  }}
                  whileHover={{
                    scale: 1.02,
                    y: -4,
                    transition: {
                      duration: 0.3,
                      ease: [0.16, 1, 0.3, 1],
                    },
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"
                    initial={false}
                  />

                  <motion.div
                    className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/20 rounded-lg transition-all duration-500"
                    initial={false}
                  />

                  <motion.div
                    className="absolute top-4 end-4 text-6xl font-bold text-primary/10 group-hover:text-primary/20 transition-colors duration-500"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: index * 0.05 + 0.1,
                      duration: 0.3,
                      ease: "backOut",
                    }}
                  >
                    {step.number}
                  </motion.div>

                  <div className="relative">
                    <motion.div
                      className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300"
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: index * 0.05 + 0.08,
                        duration: 0.3,
                        ease: "backOut",
                      }}
                    >
                      <Icon className="h-7 w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </motion.div>
                    <motion.h3
                      className="text-2xl font-semibold mb-3 text-foreground"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: index * 0.05 + 0.12,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                    >
                      {step.title}
                    </motion.h3>
                    <motion.p
                      className="text-muted-foreground leading-relaxed"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: index * 0.05 + 0.15,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                    >
                      {step.description}
                    </motion.p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-lg text-muted-foreground mb-6">מוכנים להתחיל? זה לוקח פחות מ-5 דקות</p>
          <Link href="/login">
            <Button className="text-lg px-8">התחל עכשיו בחינם</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
