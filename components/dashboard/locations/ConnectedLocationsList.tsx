"use client";

import { Location } from "@/types/database";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardDescription,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/ui/dashboard-card";
import { Building2, MapPin, Plus } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";

interface ConnectedLocationsListProps {
  locations: Location[];
  onAddNew: () => void;
  loading?: boolean;
}

export function ConnectedLocationsList({
  locations,
  onAddNew,
  loading,
}: ConnectedLocationsListProps) {
  return (
    <DashboardCard>
      <DashboardCardHeader>
        <div className="flex items-center justify-between gap-4" dir="rtl">
          <div>
            <DashboardCardTitle>העסקים המחוברים שלך</DashboardCardTitle>
            <DashboardCardDescription>
              {locations.length} עסקים מחוברים
            </DashboardCardDescription>
          </div>
          <IconButton
            icon={Plus}
            aria-label="הוסף עסק חדש"
            variant="default"
            size="default"
            onClick={onAddNew}
            disabled={loading}
          />
        </div>
      </DashboardCardHeader>
      <DashboardCardContent>
        <div className="space-y-3" dir="rtl">
          {locations.map((location) => (
            <div
              key={location.id}
              className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50"
            >
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <h4 className="font-semibold">{location.name}</h4>
                {location.address && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <span>{location.address}</span>
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
