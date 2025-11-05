import { Button } from "@/components/ui/button";
import {
  DashboardCard,
  DashboardCardContent,
} from "@/components/ui/dashboard-card";
import Link from "next/link";

interface EmptyStateProps {
  title?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
}

export function EmptyState({
  title = "עדיין לא חיברת עסקים",
  description = "חבר את חשבון Google Business Profile שלך כדי להתחיל לקבל תשובות AI אוטומטיות לביקורות הלקוחות שלך",
  ctaText,
  ctaHref,
}: EmptyStateProps) {
  return (
    <DashboardCard>
      <DashboardCardContent className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground max-w-sm mb-4">{description}</p>
        {ctaText && ctaHref && (
          <Button asChild>
            <Link href={ctaHref}>{ctaText}</Link>
          </Button>
        )}
      </DashboardCardContent>
    </DashboardCard>
  );
}
