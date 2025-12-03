"use client";

import { Button } from "@/components/ui/button";

import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

import { useTranslations } from "next-intl";

export function Hero() {
  const t = useTranslations("landing.hero");
  return (
    <section
      id="hero"
      tabIndex={-1}
      className="relative overflow-hidden min-h-[60vh] md:min-h-[90vh] flex items-center rounded-b-[2rem] md:rounded-b-[3rem] lg:rounded-b-[4rem]"
    >
      <div className="absolute inset-0" style={{ background: "var(--gradient-soft)" }} />

      <motion.div
        className="absolute top-20 end-10 w-[500px] h-[500px] rounded-full opacity-40 blur-3xl pointer-events-none"
        style={{ background: "var(--pastel-lavender)" }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 start-10 w-[400px] h-[400px] rounded-full opacity-40 blur-3xl pointer-events-none"
        style={{ background: "var(--pastel-sky)" }}
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-center gap-16 md:gap-16 py-16 md:py-20">
          <motion.div
            className="w-full md:w-1/2 order-2 flex items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          ></motion.div>
          <motion.div
            className="w-full md:w-1/2 text-center md:text-start order-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.h1
              className="mb-6 text-5xl font-bold tracking-tight md:text-7xl leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {t("title")}
              <span className="block text-primary mt-2">{t("titleHighlight")}</span>
            </motion.h1>

            <motion.p
              className="mb-10 text-xl text-muted-foreground max-w-xl mx-auto md:ms-0 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {t("description")}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link href="/login">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 shadow-primary hover:shadow-xl transition-all duration-300"
                >
                  {t("cta")}
                </Button>
              </Link>
            </motion.div>

            <motion.div
              className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>{t("badge1")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>{t("badge2")}</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
