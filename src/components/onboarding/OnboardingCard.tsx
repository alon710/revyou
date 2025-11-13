"use client";

import { ReactNode } from "react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardDescription,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/ui/dashboard-card";
import { getLocaleDir, type Locale } from "@/i18n/config";

interface OnboardingCardProps {
  title: string;
  description: string;
  children: ReactNode;
  backButton?: {
    label: string;
    loadingLabel?: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
  nextButton: {
    label: string;
    loadingLabel?: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
}

export function OnboardingCard({ title, description, children, backButton, nextButton }: OnboardingCardProps) {
  const locale = useLocale() as Locale;
  const dir = getLocaleDir(locale);
  const isRTL = dir === "rtl";

  const renderButtons = () => {
    const backBtn = backButton && (
      <Button
        onClick={backButton.onClick}
        variant="outline"
        className="flex-1"
        disabled={backButton.disabled || backButton.loading}
      >
        {backButton.loading ? backButton.loadingLabel || backButton.label : backButton.label}
      </Button>
    );
    const nextBtn = (
      <Button onClick={nextButton.onClick} className="flex-1" disabled={nextButton.disabled || nextButton.loading}>
        {nextButton.loading ? nextButton.loadingLabel || nextButton.label : nextButton.label}
      </Button>
    );

    return isRTL ? (
      <>
        {nextBtn}
        {backBtn}
      </>
    ) : (
      <>
        {backBtn}
        {nextBtn}
      </>
    );
  };

  return (
    <div>
      <DashboardCard>
        <DashboardCardHeader>
          <DashboardCardTitle>{title}</DashboardCardTitle>
          <DashboardCardDescription>{description}</DashboardCardDescription>
        </DashboardCardHeader>
        <DashboardCardContent className="space-y-6">
          {children}

          <div className="flex gap-3">{renderButtons()}</div>
        </DashboardCardContent>
      </DashboardCard>
    </div>
  );
}
