"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardDescription,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/ui/dashboard-card";

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
  nextButton?: {
    label: string;
    loadingLabel?: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
  hideNavigation?: boolean;
}

export function OnboardingCard({
  title,
  description,
  children,
  backButton,
  nextButton,
  hideNavigation = false,
}: OnboardingCardProps) {
  const renderButtons = () => {
    if (hideNavigation) return null;

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

    const nextBtn = nextButton && (
      <Button onClick={nextButton.onClick} className="flex-1" disabled={nextButton.disabled || nextButton.loading}>
        {nextButton.loading ? nextButton.loadingLabel || nextButton.label : nextButton.label}
      </Button>
    );

    return (
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

          {!hideNavigation && <div className="flex gap-3">{renderButtons()}</div>}
        </DashboardCardContent>
      </DashboardCard>
    </div>
  );
}
