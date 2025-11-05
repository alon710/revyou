"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { completeOnboarding } from "@/lib/firebase/users";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAvailableProducts } from "@/lib/stripe/client";
import { type BillingPeriod } from "@/lib/stripe/entitlements";
import {
  EnrichedProduct,
  enrichProduct,
  sortProductsByPlan,
} from "@/lib/stripe/product-parser";
import {
  FEATURE_CONFIGS,
  formatFeatureValue,
} from "@/lib/stripe/feature-config";
import {
  getMonthlyPrice,
  getPriceId,
  getYearlyPrice,
} from "@/lib/stripe/pricing";
import { toast } from "sonner";

const YEARLY_DISCOUNT = 0.2;

export default function OnboardingStep3() {
  const { user } = useAuth();
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [products, setProducts] = useState<EnrichedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const fetchedProducts = await getAvailableProducts();

        const enrichedProducts = fetchedProducts
          .map(enrichProduct)
          .filter((p) => p.active);

        const sortedProducts = sortProductsByPlan(enrichedProducts);
        setProducts(sortedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("לא ניתן לטעון את תוכניות המחיר");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const handleCheckout = async (product: EnrichedProduct) => {
    if (!user) return;

    setLoadingProductId(product.id);

    try {
      const isFree = product.planId === "free";

      if (isFree) {
        // Complete onboarding and go to dashboard
        await completeOnboarding(user.uid);
        toast.success("ברוך הבא! החשבון שלך מוכן לשימוש");
        router.push("/dashboard");
        return;
      }

      // For paid plans, redirect to checkout with onboarding flag
      const priceId = getPriceId(product, billingPeriod);
      const redirectUrl = priceId
        ? `/checkout?plan=${product.planId}&period=${billingPeriod}&priceId=${priceId}&onboarding=true`
        : `/checkout?plan=${product.planId}&period=${billingPeriod}&onboarding=true`;

      router.push(redirectUrl);
    } catch (error) {
      console.error("Error processing plan selection:", error);
      toast.error("אירעה שגיאה. נסה שוב.");
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
        <StepIndicator currentStep={3} />
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-80 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto mb-8" />
          <Skeleton className="h-10 w-48 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-8">
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-12 w-32 mb-6" />
              <div className="space-y-3 mb-8">
                {[1, 2, 3, 4, 5].map((j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
              <Skeleton className="h-10 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <StepIndicator currentStep={3} />

      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">בחר את התוכנית המתאימה לך</h2>
        <p className="text-muted-foreground mb-8">
          תוכל לשדרג או לשנות את התוכנית בכל עת
        </p>

        <Tabs
          value={billingPeriod}
          onValueChange={(value) => setBillingPeriod(value as BillingPeriod)}
          className="w-auto"
        >
          <TabsList>
            <TabsTrigger value="yearly">
              <span className="ms-1 text-xs text-primary">(חסכו 20%)</span>
              שנתי
            </TabsTrigger>
            <TabsTrigger value="monthly">חודשי</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={billingPeriod}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {products.map((product, index) => {
            const monthlyPrice = getOriginalMonthlyPrice(product);
            const showYearlyDiscount =
              billingPeriod === "yearly" && monthlyPrice > 0;

            return (
              <motion.div
                key={product.id}
                className={`relative p-8 flex flex-col rounded-lg ${
                  product.recommended
                    ? "border-2 border-primary shadow-xl bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5"
                    : "border border-border/40 shadow-lg bg-card"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {product.description}
                  </p>
                  <div className="flex flex-col">
                    {showYearlyDiscount && (
                      <span className="text-sm text-muted-foreground line-through mb-1">
                        ₪{monthlyPrice}
                      </span>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">
                        {formatPrice(product)}
                      </span>
                      <span className="text-muted-foreground">/חודש</span>
                    </div>
                    {showYearlyDiscount && (
                      <span className="text-xs text-primary mt-1">
                        חסכון של ₪{getSavingsAmount(product)} לחודש
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {FEATURE_CONFIGS.map((featureConfig) => {
                    const value = product.features[featureConfig.key];
                    const formattedValue = formatFeatureValue(
                      value,
                      featureConfig.type
                    );
                    const isBoolean = featureConfig.type === "boolean";
                    const isEnabled =
                      isBoolean && typeof formattedValue === "boolean"
                        ? formattedValue
                        : value !== undefined && value !== null;

                    return (
                      <li
                        key={featureConfig.key}
                        className="flex items-start gap-2"
                      >
                        {isBoolean ? (
                          isEnabled ? (
                            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          )
                        ) : (
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={`text-sm ${
                            isEnabled
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {isBoolean
                            ? featureConfig.displayName
                            : `${featureConfig.displayName}: ${formattedValue}`}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <Button
                  className="w-full"
                  variant={product.recommended ? "default" : "outline"}
                  onClick={() => handleCheckout(product)}
                  disabled={loadingProductId === product.id}
                >
                  {loadingProductId === product.id
                    ? "טוען..."
                    : product.planId === "free"
                    ? "התחל בחינם"
                    : "התחל עכשיו"}
                </Button>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
