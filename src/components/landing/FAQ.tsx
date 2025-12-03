"use client";

import { Card } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

const FAQ_ITEM_COUNT = 8;

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const t = useTranslations("landing.faq");

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div id="faq">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">{t("title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {Array.from({ length: FAQ_ITEM_COUNT }).map((_, index) => (
            <motion.div
              key={index}
              className="group relative"
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{
                scale: 1.03,
                y: -6,
                transition: {
                  duration: 0.3,
                  ease: [0.16, 1, 0.3, 1],
                },
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"
                initial={false}
              />

              <motion.div
                className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/15 rounded-lg transition-all duration-500"
                initial={false}
              />

              <Card className="relative overflow-hidden border border-border/40 shadow-sm hover:shadow-md rounded-lg bg-card">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-start p-6 flex items-center justify-between hover:bg-secondary/50 transition-all duration-300 cursor-pointer"
                >
                  <h3 className="text-lg font-semibold text-foreground pe-4">{t(`items.${index}.question`)}</h3>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    whileHover={{ scale: 1.2 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="px-6 pb-6 pt-0">
                        <motion.p
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{
                            duration: 0.4,
                            ease: "easeOut",
                            delay: 0.1,
                          }}
                          className="text-muted-foreground leading-relaxed"
                        >
                          {t(`items.${index}.answer`)}
                        </motion.p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
