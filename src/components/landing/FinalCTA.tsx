"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";

export function FinalCTA() {
  const t = useTranslations("landing.finalCTA");

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: "var(--gradient-soft)" }} />

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-pastel-lavender/20 blur-3xl" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-pastel-mint/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-8 tracking-tight">{t("title")}</h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">{t("description")}</p>

          <Link href="/login">
            <Button size="lg" className="text-lg px-10 py-7 shadow-primary hover:shadow-xl transition-all duration-300">
              {t("cta")}
            </Button>
          </Link>

          <p className="mt-8 text-sm text-muted-foreground">{t("noCreditCard")}</p>
        </motion.div>
      </div>
    </section>
  );
}
