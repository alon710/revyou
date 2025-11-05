"use client";

import { Button } from "@/components/ui/button";
import { LottiePlayer } from "@/components/ui/lottie-player";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import lottieJson from "@/../public/heroAnimation.json";

export function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[60vh] md:min-h-[90vh] flex items-center rounded-b-[2rem] md:rounded-b-[3rem] lg:rounded-b-[4rem] pt-32">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f8f7fb] via-white to-[#f4f0fb]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(137,80,255,0.08)_0%,_transparent_70%)]" />

      <div className="absolute top-20 right-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-center gap-16 md:gap-16 py-16 md:py-20">
          <motion.div
            className="w-full md:w-1/2 order-2 flex items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            <LottiePlayer
              animationData={lottieJson}
              ariaLabel="Hero animation"
              className="max-w-full"
            />
          </motion.div>
          <motion.div
            className="w-full md:w-1/2 text-center md:text-right order-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-r from-purple-200/20 via-blue-200/20 to-purple-200/20 blur-3xl -z-10" />

            <motion.h1
              className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              תשובות מקצועיות לביקורות
              <br />
              <motion.span
                className="bg-clip-text text-transparent bg-gradient-to-l from-gray-900 via-blue-700 to-purple-700 bg-[length:200%_100%]"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                באופן אוטומטי
              </motion.span>
            </motion.h1>

            <motion.div
              className="h-1 md:h-1.5 w-28 sm:w-32 md:w-44 lg:w-52 mx-auto md:mr-0 rounded-full bg-gradient-to-r from-blue-500/70 via-purple-500/70 to-blue-400/70 shadow-[0_0_18px_rgba(59,130,246,0.25)] mb-8"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />

            <motion.p
              className="mb-10 text-lg text-gray-700 sm:text-xl md:text-2xl max-w-3xl mx-auto md:mr-0 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              חסכו זמן יקר והגיבו לכל ביקורת בצורה אישית ומקצועית עם הכוח של
              בינה מלאכותית. שמרו על קול המותג שלכם ושפרו את המוניטין העסקי.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link href="/">
                <motion.div
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button className="relative text-lg px-8 py-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-[0_8px_24px_rgba(99,102,241,0.4)] hover:shadow-[0_12px_32px_rgba(99,102,241,0.5)] transition-all duration-300 group overflow-hidden">
                    <span className="relative z-10">חודש ניסיון חינם</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            <motion.div
              className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 text-sm text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>חינם לחלוטין</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>ללא התחייבות</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
