"use client";

import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardHeader,
} from "@/components/ui/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GoogleLocationData {
  id: string;
  name: string;
  address: string;
  accountId: string;
  accountName: string;
  resourceName: string;
  phone?: string;
  website?: string;
}

interface BusinessSelectorProps {
  locations: GoogleLocationData[];
  selectedLocationId: string | null;
  onSelect: (location: GoogleLocationData) => void;
  loading?: boolean;
}

/**
 * Location Selector Component
 * Allows user to select a location location from their Google account
 */
export default function BusinessSelector({
  locations,
  selectedLocationId,
  onSelect,
  loading = false,
}: BusinessSelectorProps) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">טוען מיקומים...</p>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <DashboardCard>
        <DashboardCardContent className="py-8 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">לא נמצאו עסקים</h3>
          <p className="text-muted-foreground">
            לא נמצאו עסקים בחשבון Google Location Profile שלך
          </p>
        </DashboardCardContent>
      </DashboardCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">בחר עסק לחיבור</h3>
        <p className="text-muted-foreground">
          נמצאו {locations.length} עסקים בחשבון Google Location Profile שלך
        </p>
      </div>

      <div className="grid gap-4">
        {locations.map((location) => {
          const isSelected = selectedLocationId === location.id;

          return (
            <DashboardCard
              key={location.id}
              className={cn(
                "cursor-pointer transition-all hover:border-primary",
                isSelected && "border-primary bg-primary/5"
              )}
              onClick={() => onSelect(location)}
            >
              <DashboardCardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold text-lg">{location.name}</h4>
                      {isSelected && <Check className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4" />
                      {location.address}
                    </div>
                  </div>
                </div>
              </DashboardCardHeader>

              <DashboardCardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{location.accountName}</Badge>
                  {location.phone && (
                    <Badge variant="outline">{location.phone}</Badge>
                  )}
                  {location.website && <Badge variant="outline">יש אתר</Badge>}
                </div>
              </DashboardCardContent>
            </DashboardCard>
          );
        })}
      </div>
    </div>
  );
}
