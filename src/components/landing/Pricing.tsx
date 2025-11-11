"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { getAvailableProducts } from "@/lib/stripe/client";
import { type BillingPeriod } from "@/lib/stripe/entitlements";
import { EnrichedProduct, enrichProduct, sortProductsByPlan } from "@/lib/stripe/product-parser";
import { FEATURE_CONFIGS, formatFeatureValue } from "@/lib/stripe/feature-config";
import { getMonthlyPrice, getPriceId, getYearlyPrice } from "@/lib/stripe/pricing";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

const YEARLY_DISCOUNT = 0.2;

export function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [products, setProducts] = useState<EnrichedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations("landing.pricing");

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const fetchedProducts = await getAvailableProducts();

        const enrichedProducts = fetchedProducts.map(enrichProduct).filter((p) => p.active);

        const sortedProducts = sortProductsByPlan(enrichedProducts);
        setProducts(sortedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const handleCheckout = async (product: EnrichedProduct) => {
    setLoadingProductId(product.id);

    try {
      const isFree = product.planId === "free";

      if (isFree) {
        if (!user) {
          router.push(`/login?redirect=${encodeURIComponent("/dashboard/home")}`);
        } else {
          router.push("/dashboard/home");
        }
        return;
      }

      const priceId = getPriceId(product, billingPeriod);
      const redirectUrl = priceId
        ? `/checkout?plan=${product.planId}&period=${billingPeriod}&priceId=${priceId}`
        : `/checkout?plan=${product.planId}&period=${billingPeriod}`;

      if (!user) {
        router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
      } else {
        router.push(redirectUrl);
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setLoadingProductId(null);
    }
  };

  const getProductPrice = (product: EnrichedProduct) => {
    if (billingPeriod === "yearly") {
      const yearlyPrice = getYearlyPrice(product);
      return yearlyPrice > 0 ? yearlyPrice : getMonthlyPrice(product);
    }
    return getMonthlyPrice(product);
  };

  const formatPrice = (product: EnrichedProduct) => {
    const price = Math.round(getProductPrice(product));
    return `₪${price}`;
  };

  const getOriginalMonthlyPrice = (product: EnrichedProduct) => {
    return Math.round(getMonthlyPrice(product));
  };

  const getSavingsAmount = (product: EnrichedProduct) => {
    const monthlyPrice = getMonthlyPrice(product);
    const yearlyPrice = getYearlyPrice(product);
    if (yearlyPrice > 0 && monthlyPrice > 0) {
      return Math.round(monthlyPrice - yearlyPrice);
    }
    return Math.round(monthlyPrice * YEARLY_DISCOUNT);
  };

  if (loading) {
    return (
      <div>
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-80 mx-auto mb-8" />
            <Skeleton className="h-10 w-48 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="relative p-8 flex flex-col rounded-lg border border-border/40 shadow-sm">
                <Skeleton className="h-6 w-16 mb-4" />

                <div className="mb-6">
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />

                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>

                <div className="space-y-3 mb-8 grow">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="flex items-start gap-2">
                      <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>

                <Skeleton className="h-10 w-full rounded-md" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">{t("title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">{t("subtitle")}</p>

          <Tabs
            value={billingPeriod}
            onValueChange={(value) => setBillingPeriod(value as BillingPeriod)}
            className="w-auto"
          >
            <TabsList>
              <TabsTrigger value="yearly">
                <span className="ms-1 text-xs text-primary">{t("yearlyDiscount")}</span>
                {t("yearly")}
              </TabsTrigger>
              <TabsTrigger value="monthly">{t("monthly")}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={billingPeriod}
            className="grid grid-cols-1 md:grid-cols-[1fr_1.15fr_1fr] gap-8 md:gap-6 max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {products.map((product, index) => {
              const monthlyPrice = getOriginalMonthlyPrice(product);
              const showYearlyDiscount = billingPeriod === "yearly" && monthlyPrice > 0;

              return (
                <motion.div
                  key={product.id}
                  className={`relative p-8 flex flex-col rounded-lg group text-card-foreground touch-manipulation ${
                    product.recommended
                      ? "border-2 border-primary shadow-2xl bg-linear-to-br from-primary/15 via-primary/10 to-primary/5"
                      : "border border-border/40 shadow-lg bg-card"
                  }`}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: product.recommended ? 1.02 : 1,
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                    opacity: { duration: 0.3, ease: "easeOut" },
                    scale: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                  }}
                  whileHover={{
                    scale: product.recommended ? 1.03 : 1.02,
                    y: -4,
                    transition: {
                      duration: 0.3,
                      ease: [0.16, 1, 0.3, 1],
                    },
                  }}
                >
                  <motion.div
                    className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
                      product.recommended
                        ? "bg-linear-to-br from-primary/15 via-primary/8 to-primary/15"
                        : "bg-linear-to-br from-primary/5 via-transparent to-primary/10"
                    }`}
                    initial={false}
                  />

                  <motion.div
                    className={`absolute inset-0 border-2 rounded-lg transition-all duration-500 pointer-events-none ${
                      product.recommended
                        ? "border-primary/0 group-hover:border-primary/40"
                        : "border-primary/0 group-hover:border-primary/20"
                    }`}
                    initial={false}
                  />

                  <div className="mb-6 relative">
                    <motion.h3
                      className="text-2xl font-bold text-foreground mb-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: index * 0.05 + 0.1,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                    >
                      {product.name}
                    </motion.h3>
                    <motion.p
                      className="text-sm text-muted-foreground mb-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: index * 0.05 + 0.15,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                    >
                      {product.description}
                    </motion.p>
                    <motion.div
                      className="flex flex-col"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: index * 0.05 + 0.2,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                    >
                      {showYearlyDiscount && (
                        <span className="text-sm text-muted-foreground line-through mb-1">₪{monthlyPrice}</span>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-foreground">{formatPrice(product)}</span>
                        <span className="text-muted-foreground">{t("perMonth")}</span>
                      </div>
                      {showYearlyDiscount && (
                        <span className="text-xs text-primary mt-1">
                          {t("savings", { amount: getSavingsAmount(product) })}
                        </span>
                      )}
                    </motion.div>
                  </div>

                  <ul className="space-y-3 mb-8 grow">
                    {FEATURE_CONFIGS.map((featureConfig, featureIndex) => {
                      const value = product.features[featureConfig.key];
                      const formattedValue = formatFeatureValue(value, featureConfig.type);
                      const isBoolean = featureConfig.type === "boolean";
                      const isEnabled =
                        isBoolean && typeof formattedValue === "boolean"
                          ? formattedValue
                          : value !== undefined && value !== null;
                      const featureName = t(`features.${featureConfig.key}`);

                      return (
                        <motion.li
                          key={featureConfig.key}
                          className="flex items-start gap-2"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: index * 0.05 + 0.25 + featureIndex * 0.03,
                            duration: 0.3,
                            ease: "easeOut",
                          }}
                        >
                          {isBoolean ? (
                            isEnabled ? (
                              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                            )
                          ) : (
                            <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          )}
                          <span className={`text-sm ${isEnabled ? "text-foreground" : "text-muted-foreground"}`}>
                            {isBoolean ? featureName : `${featureName}: ${formattedValue}`}
                          </span>
                        </motion.li>
                      );
                    })}
                  </ul>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: index * 0.05 + 0.25 + FEATURE_CONFIGS.length * 0.03,
                      duration: 0.3,
                      ease: "easeOut",
                    }}
                  >
                    <Button
                      className="w-full"
                      variant={product.recommended ? "default" : "outline"}
                      onClick={() => handleCheckout(product)}
                      disabled={loadingProductId === product.id}
                    >
                      {loadingProductId === product.id
                        ? t("loading")
                        : product.metadata?.cta || (product.planId === "free" ? t("freeCta") : t("paidCta"))}
                    </Button>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
