"use client";

import { useState } from "react";
import { OnboardingCard } from "@/components/onboarding/OnboardingCard";
import { Building2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

export function ConnectAccountForm() {
  const router = useRouter();
  const tCommon = useTranslations("common");
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
      backButton={{ onClick: handleBack, label: tCommon("back") }}
      nextButton={{
        label: t("connectButton"),
        loadingLabel: t("connectingButton"),
        onClick: handleConnect,
        loading: connecting,
      }}
    >
      <div className="bg-pastel-lavender/20 p-6 rounded-2xl border border-border/40">
        <h4 className="font-semibold mb-4 text-lg">{t("permissionsTitle")}</h4>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start gap-3">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-pastel-lavender/30 shrink-0">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <span className="pt-1">{t("permissions.businessList")}</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-pastel-lavender/30 shrink-0">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <span className="pt-1">{t("permissions.readReviews")}</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-pastel-lavender/30 shrink-0">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <span className="pt-1">{t("permissions.publishReplies")}</span>
          </li>
        </ul>
      </div>
    </OnboardingCard>
  );
}
