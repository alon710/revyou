"use client";

import { useState } from "react";
import { OnboardingCard } from "@/components/onboarding/OnboardingCard";
import { Building2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

export default function OnboardingStep2() {
  const router = useRouter();
  const t = useTranslations("onboarding.connectAccount");
  const [connecting, setConnecting] = useState(false);

  const handleBack = () => {
    router.push("/dashboard/home");
  };

  const handleConnect = () => {
    setConnecting(true);
    window.location.href = "/api/google/auth?onboarding=true";
  };

  return (
    <OnboardingCard
      title={t("title")}
      description={t("description")}
      backButton={{ onClick: handleBack }}
      nextButton={{
        label: connecting ? t("connectingButton") : t("connectButton"),
        onClick: handleConnect,
        disabled: connecting,
      }}
    >
      <div className="bg-muted p-4 rounded-lg" dir="rtl">
        <h4 className="font-semibold mb-2">{t("permissionsTitle")}</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <Building2 className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{t("permissions.businessList")}</span>
          </li>
          <li className="flex items-start gap-2">
            <Building2 className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{t("permissions.readReviews")}</span>
          </li>
          <li className="flex items-start gap-2">
            <Building2 className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{t("permissions.publishReplies")}</span>
          </li>
        </ul>
      </div>
    </OnboardingCard>
  );
}
