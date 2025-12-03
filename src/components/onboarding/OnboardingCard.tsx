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
import { motion } from "framer-motion";

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
        className="flex-1 hover:bg-pastel-lavender/10 transition-all duration-300"
        disabled={backButton.disabled || backButton.loading}
      >
        {backButton.loading ? backButton.loadingLabel || backButton.label : backButton.label}
      </Button>
    );

    const nextBtn = nextButton && (
      <Button
        onClick={nextButton.onClick}
        className="flex-1 shadow-primary hover:shadow-xl transition-all duration-300"
        disabled={nextButton.disabled || nextButton.loading}
      >
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <DashboardCard>
        <DashboardCardHeader>
          <DashboardCardTitle>{title}</DashboardCardTitle>
          <DashboardCardDescription>{description}</DashboardCardDescription>
        </DashboardCardHeader>
        <DashboardCardContent className="space-y-6">
          {children}

          {!hideNavigation && <div className="flex gap-4">{renderButtons()}</div>}
        </DashboardCardContent>
      </DashboardCard>
    </motion.div>
  );
}
