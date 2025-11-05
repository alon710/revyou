import { Button } from "@/components/ui/button";
import Link from "next/link";
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
  buttonText: string;
  buttonLink: string;
}

export function EmptyState({
  title,
  description,
  buttonText,
  buttonLink,
}: EmptyStateProps) {
  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>{title}</DashboardCardTitle>
        <DashboardCardDescription>{description}</DashboardCardDescription>
      </DashboardCardHeader>
      <DashboardCardContent>
        <Button asChild>
          <Link href={buttonLink}>{buttonText}</Link>
        </Button>
      </DashboardCardContent>
    </DashboardCard>
  );
}
