import { Button } from "@/components/ui/button";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardDescription,
  DashboardCardHeader,
  DashboardCardTitle,
} from "./dashboard-card";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>{title}</DashboardCardTitle>
        <DashboardCardDescription>{description}</DashboardCardDescription>
      </DashboardCardHeader>
      {actionLabel && onAction && (
        <DashboardCardContent>
          <Button onClick={onAction}>{actionLabel}</Button>
        </DashboardCardContent>
      )}
    </DashboardCard>
  );
}
