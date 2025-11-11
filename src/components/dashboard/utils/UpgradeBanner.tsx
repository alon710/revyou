"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useUIStore } from "@/lib/store/ui-store";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

export function UpgradeBanner() {
  const t = useTranslations("dashboard.components.upgradeBanner");
  const { planType, loading } = useSubscription();
  const router = useRouter();
  const { dismissUpgradeBanner, shouldShowUpgradeBanner } = useUIStore();
  const [isAnimating, setIsAnimating] = useState(false);

  const isVisible = useMemo(() => {
    if (loading || planType !== "free") {
      return false;
    }
    return shouldShowUpgradeBanner();
  }, [loading, planType, shouldShowUpgradeBanner]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setIsAnimating(true), 100);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setIsAnimating(false), 0);
    return () => clearTimeout(timer);
  }, [isVisible]);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      dismissUpgradeBanner();
    }, 300);
  };

  const handleUpgrade = () => {
    router.push("/");
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-16 md:bottom-0 inset-x-0 z-50 px-4 pb-4 transition-transform duration-300 ${
        isAnimating ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-linear-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 rounded-lg shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground mb-0.5">{t("title")}</h3>
                <p className="text-xs text-muted-foreground">{t("description")}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" onClick={handleUpgrade} className="hidden sm:flex">
                {t("upgradeNow")}
              </Button>

              <Button size="sm" variant="ghost" onClick={handleDismiss} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
                <span className="sr-only">{t("close")}</span>
              </Button>
            </div>
          </div>

          <div className="sm:hidden px-4 pb-4">
            <Button onClick={handleUpgrade} className="w-full" size="sm">
              {t("upgradeToPlan")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
