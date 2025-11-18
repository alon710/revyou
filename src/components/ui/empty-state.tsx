import { DashboardCard, DashboardCardDescription, DashboardCardHeader, DashboardCardTitle } from "./dashboard-card";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>{title}</DashboardCardTitle>
        <DashboardCardDescription>{description}</DashboardCardDescription>
      </DashboardCardHeader>
    </DashboardCard>
  );
}
