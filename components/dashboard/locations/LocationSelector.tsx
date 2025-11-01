"use client";

import { useState } from "react";
import { GoogleBusinessProfileLocation } from "@/types/database";
import { Button } from "@/components/ui/button";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/ui/dashboard-card";
import { Building2, AlertCircle, MapPin } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface LocationSelectorProps {
  locations: GoogleBusinessProfileLocation[];
  loading?: boolean;
  error?: string | null;
  onSelect: (location: GoogleBusinessProfileLocation) => void;
  onRetry: () => void;
  connecting?: boolean;
}

export function LocationSelector({
  locations,
  loading,
  error,
  onSelect,
  onRetry,
  connecting,
}: LocationSelectorProps) {
  const [selected, setSelected] =
    useState<GoogleBusinessProfileLocation | null>(null);

  const handleConnect = () => {
    if (selected) onSelect(selected);
  };

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>בחר עסק</DashboardCardTitle>
        <div className="text-sm text-muted-foreground">
          {loading ? (
            <Loading size="md" text="טוען עסקים..." />
          ) : locations.length > 0 ? (
            `בחר את העסק שברצונך לחבר (נמצאו ${locations.length} עסקים)`
          ) : (
            "בחר את העסק שברצונך לחבר מרשימת העסקים שלך"
          )}
        </div>
      </DashboardCardHeader>
      <DashboardCardContent>
        {!loading && error && locations.length === 0 && (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={onRetry} disabled={loading}>
              נסה שוב
            </Button>
          </div>
        )}

        {!loading && locations.length > 0 && (
          <>
            <RadioGroup
              value={selected?.id || ""}
              onValueChange={(value) => {
                const location = locations.find((loc) => loc.id === value);
                setSelected(location || null);
              }}
              className="gap-3"
              dir="rtl"
            >
              {locations.map((location) => (
                <div
                  key={location.id}
                  className={`relative flex items-start gap-3 rounded-lg border p-4 transition-colors ${
                    selected?.id === location.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem
                    value={location.id}
                    id={location.id}
                    className="mt-1"
                  />
                  <Label
                    htmlFor={location.id}
                    className="flex-1 cursor-pointer space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{location.name}</span>
                    </div>
                    {location.address && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                        <span>{location.address}</span>
                      </div>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {selected && (
              <div className="mt-6 flex gap-3" dir="rtl">
                <Button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="flex-1"
                >
                  {connecting ? "מחבר..." : "חבר עסק זה"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelected(null)}
                  disabled={connecting}
                >
                  בטל בחירה
                </Button>
              </div>
            )}
          </>
        )}
      </DashboardCardContent>
    </DashboardCard>
  );
}
