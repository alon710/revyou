"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function UpgradeButton() {
  const t = useTranslations("dashboard.subscription");

  const handleUpgrade = () => {
    window.location.href = "/#pricing";
  };

  return (
    <Button onClick={handleUpgrade} size="lg">
      {t("upgradePlan")}
    </Button>
  );
}
