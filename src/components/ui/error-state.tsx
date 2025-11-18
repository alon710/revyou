"use client";

import { Button } from "@/components/ui/button";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardDescription,
  DashboardCardHeader,
  DashboardCardTitle,
} from "./dashboard-card";

interface ErrorStateProps {
  title?: string;
  description?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong!",
  description = "An error occurred while loading this page.",
  showRetry = true,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <DashboardCard className="max-w-md">
        <DashboardCardHeader>
          <DashboardCardTitle>{title}</DashboardCardTitle>
          <DashboardCardDescription>{description}</DashboardCardDescription>
        </DashboardCardHeader>
        {showRetry && onRetry && (
          <DashboardCardContent>
            <Button onClick={onRetry}>Try again</Button>
          </DashboardCardContent>
        )}
      </DashboardCard>
    </div>
  );
}
