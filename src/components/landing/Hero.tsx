"use client";

import { Button } from "@/components/ui/button";
import { LottiePlayer } from "@/components/ui/lottie-player";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import lottieJson from "@/assets/heroAnimation.json";
import { useTranslations } from "next-intl";

export function Hero() {
  const t = useTranslations("landing.hero");
  return (
    <section className="relative overflow-hidden min-h-[60vh] md:min-h-[90vh] flex items-center rounded-b-[2rem] md:rounded-b-[3rem] lg:rounded-b-[4rem] pt-32">
      <div className="absolute inset-0 bg-linear-to-br from-background via-background to-muted" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08)_0%,transparent_70%)]" />

      <div className="absolute top-20 end-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 start-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-center gap-16 md:gap-16 py-16 md:py-20">
          <motion.div
            className="w-full md:w-1/2 order-2 flex items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            <LottiePlayer animationData={lottieJson} ariaLabel="Hero animation" className="max-w-full" />
          </motion.div>
          <motion.div
            className="w-full md:w-1/2 text-center md:text-start order-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="absolute top-1/4 start-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-linear-to-r from-primary/10 via-primary/15 to-primary/10 blur-3xl -z-10" />

            <motion.h1
              className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {t("title")}
              <br />
              <motion.span
                className="bg-clip-text text-transparent bg-linear-to-l from-foreground via-primary to-primary bg-size-[200%_100%]"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                {t("subtitle")}
              </motion.span>
            </motion.h1>

            <motion.div
              className="h-1 md:h-1.5 w-28 sm:w-32 md:w-44 lg:w-52 mx-auto md:me-0 rounded-full bg-linear-to-r from-primary/70 via-primary to-primary/70 shadow-[0_0_18px_hsl(var(--primary)/0.25)] mb-8"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />

            <motion.p
              className="mb-10 text-lg text-muted-foreground sm:text-xl md:text-2xl max-w-3xl mx-auto md:me-0 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {t("description")}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link href="/login">
                <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Button className="relative text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-[0_8px_24px_hsl(var(--primary)/0.4)] hover:shadow-[0_12px_32px_hsl(var(--primary)/0.5)] transition-all duration-300 group overflow-hidden">
                    <span className="relative z-10">{t("cta")}</span>
                    <div className="absolute inset-0 bg-primary/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            <motion.div
              className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>{t("badge1")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>{t("badge2")}</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
