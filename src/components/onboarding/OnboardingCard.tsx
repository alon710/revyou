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
    onClick: () => void;
    disabled?: boolean;
  };
  nextButton: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
}

export function OnboardingCard({ title, description, children, backButton, nextButton }: OnboardingCardProps) {
  return (
    <div>
      <DashboardCard>
        <DashboardCardHeader>
          <DashboardCardTitle>{title}</DashboardCardTitle>
          <DashboardCardDescription>{description}</DashboardCardDescription>
        </DashboardCardHeader>
        <DashboardCardContent className="space-y-6">
          {children}

          <div className="flex gap-3">
            {backButton && (
              <Button onClick={backButton.onClick} variant="outline" className="flex-1" disabled={backButton.disabled}>
                {backButton.label}
              </Button>
            )}
            <Button onClick={nextButton.onClick} className="flex-1" disabled={nextButton.disabled}>
              {nextButton.label}
            </Button>
          </div>
        </DashboardCardContent>
      </DashboardCard>
    </div>
  );
}
