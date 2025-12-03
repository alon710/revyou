"use client";

import { Button } from "@/components/ui/button";
import { Link2, Settings, MessageSquare, CheckCircle } from "lucide-react";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const STEPS = [
  {
    icon: Link2,
    titleKey: "steps.0.title",
    descKey: "steps.0.description",
  },
  {
    icon: Settings,
    titleKey: "steps.1.title",
    descKey: "steps.1.description",
  },
  {
    icon: MessageSquare,
    titleKey: "steps.2.title",
    descKey: "steps.2.description",
  },
  {
    icon: CheckCircle,
    titleKey: "steps.3.title",
    descKey: "steps.3.description",
  },
] as const;

export function HowItWorks() {
  const t = useTranslations("landing.howItWorks");
  return (
    <div id="how-it-works">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">{t("title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8">
            {STEPS.map((step, index) => {
              const stepNumber = index + 1;
              return (
                <motion.div
                  key={index}
                  className="p-8 relative overflow-hidden border border-border/40 shadow-sm rounded-2xl bg-card text-card-foreground cursor-pointer group transition-all duration-300 hover:shadow-lg"
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
                    className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"
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
                    {stepNumber}
                  </motion.div>

                  <div className="relative">
                    <motion.div
                      className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-pastel-lavender/20 group-hover:bg-pastel-lavender/30 group-hover:scale-110 transition-all duration-300"
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: index * 0.05 + 0.08,
                        duration: 0.3,
                        ease: "backOut",
                      }}
                    >
                      <step.icon className="h-7 w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
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
                      {t(step.titleKey)}
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
                      {t(step.descKey)}
                    </motion.p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-lg text-muted-foreground mb-6">{t("ctaText")}</p>
          <Link href="/login">
            <Button className="text-lg px-8">{t("ctaButton")}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
