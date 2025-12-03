"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export function Statistics() {
  const t = useTranslations("landing.stats");

  return (
    <section className="py-20 bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-5xl font-bold text-primary mb-2">500+</div>
            <div className="text-muted-foreground">{t("businesses")}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="text-5xl font-bold text-primary mb-2">10K+</div>
            <div className="text-muted-foreground">{t("responses")}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="text-5xl font-bold text-primary mb-2">98%</div>
            <div className="text-muted-foreground">{t("satisfaction")}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="text-5xl font-bold text-primary mb-2">1K+</div>
            <div className="text-muted-foreground">{t("hoursSaved")}</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
