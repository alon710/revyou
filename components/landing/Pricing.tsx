"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth";
import {
  createSubscriptionCheckout,
  getAvailableProducts,
} from "@/lib/stripe/client";
import {
  type BillingPeriod,
  type EnrichedProduct,
  enrichProduct,
  sortProductsByPlan,
  FEATURE_CONFIGS,
  formatFeatureValue,
  getMonthlyPrice,
  getYearlyPrice,
  getPriceId,
} from "@/lib/stripe/entitlements";

const YEARLY_DISCOUNT = 0.2;

export function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [products, setProducts] = useState<EnrichedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

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

      if (!user) {
        router.push(
          `/login?returnTo=/&plan=${product.planId}&period=${billingPeriod}`
        );
        return;
      }

      if (isFree) {
        router.push("/businesses");
        return;
      }

      const priceId = getPriceId(product, billingPeriod);
      if (!priceId) {
        console.error("No price ID found for product:", product.name);
        return;
      }

      const session = await createSubscriptionCheckout(priceId);
      window.location.assign(session.url);
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
      <section id="pricing" className="bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header skeleton */}
          <div className="text-center mb-16">
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-80 mx-auto mb-8" />
            <Skeleton className="h-10 w-48 mx-auto" />
          </div>

          {/* 3 pricing cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="relative p-8 flex flex-col rounded-lg border border-border/40 shadow-sm"
              >
                {/* Badge placeholder */}
                <Skeleton className="h-6 w-16 mb-4" />

                {/* Plan info */}
                <div className="mb-6">
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />

                  {/* Price section */}
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>

                {/* Features list */}
                <div className="space-y-3 mb-8 flex-grow">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="flex items-start gap-2">
                      <Skeleton className="h-5 w-5 rounded-full flex-shrink-0" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Skeleton className="h-10 w-full rounded-md" />
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            תוכניות מחיר שמתאימות לכם
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            בחרו את התוכנית המתאימה לעסק שלכם
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {products.map((product) => {
            const monthlyPrice = getOriginalMonthlyPrice(product);
            const showYearlyDiscount =
              billingPeriod === "yearly" && monthlyPrice > 0;

            return (
              <Card
                key={product.id}
                className={`relative p-8 flex flex-col rounded-lg ${
                  product.recommended
                    ? "border border-primary/40 shadow-md"
                    : "border border-border/40 shadow-sm"
                }`}
              >
                {product.recommended && (
                  <div className="absolute -top-4 right-1/2 translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    מומלץ
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {product.name}
                  </h3>
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
                      <span className="text-4xl font-bold text-foreground">
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
                    : product.metadata?.cta ||
                      (product.planId === "free" ? "התחל בחינם" : "התחל עכשיו")}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
