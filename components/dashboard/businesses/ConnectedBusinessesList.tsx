"use client";

import { Business } from "@/types/database";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardDescription,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/ui/dashboard-card";
import { Building2, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConnectedBusinessesListProps {
  businesses: Business[];
  onAddNew: () => void;
  loading?: boolean;
}

export function ConnectedBusinessesList({
  businesses,
  onAddNew,
  loading,
}: ConnectedBusinessesListProps) {
  return (
    <DashboardCard>
      <DashboardCardHeader>
        <div className="flex items-center justify-between gap-4" dir="rtl">
          <div>
            <DashboardCardTitle>העסקים המחוברים שלך</DashboardCardTitle>
            <DashboardCardDescription>
              {businesses.length} עסקים מחוברים
            </DashboardCardDescription>
          </div>
          <Button
            aria-label="הוסף עסק חדש"
            variant="default"
            onClick={onAddNew}
            disabled={loading}
          >
            <span className="px-2">הוסף עסק חדש</span>
          </Button>
        </div>
      </DashboardCardHeader>
      <DashboardCardContent>
        <div className="space-y-3" dir="rtl">
          {businesses.map((business) => (
            <div
              key={business.id}
              className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50"
            >
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <h4 className="font-semibold">{business.name}</h4>
                {business.address && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <span>{business.address}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </DashboardCardContent>
    </DashboardCard>
  );
}
