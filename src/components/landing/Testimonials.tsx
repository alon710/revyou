"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export function Testimonials() {
  const t = useTranslations("landing.testimonials");

  return (
    <section id="testimonials" className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-4xl font-bold text-center mb-16">{t("title")}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="p-8 rounded-2xl border border-border/40 bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-2 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <p className="text-muted-foreground mb-6 italic text-lg leading-relaxed flex-1">
                &ldquo;{t(`items.${i}.quote`)}&rdquo;
              </p>
              <div className="border-t border-border/40 pt-6 mt-auto">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-pastel-lavender/30 flex items-center justify-center text-xl font-bold text-primary">
                    {t(`items.${i}.name`).charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold">{t(`items.${i}.name`)}</div>
                    <div className="text-sm text-muted-foreground">{t(`items.${i}.role`)}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
