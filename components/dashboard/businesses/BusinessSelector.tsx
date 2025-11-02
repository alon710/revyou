"use client";

import { useState } from "react";
import { GoogleBusinessProfileBusiness } from "@/types/database";
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

interface BusinessSelectorProps {
  businesses: GoogleBusinessProfileBusiness[];
  loading?: boolean;
  error?: string | null;
  onSelect: (business: GoogleBusinessProfileBusiness) => void;
  onRetry: () => void;
  connecting?: boolean;
}

export function BusinessSelector({
  businesses,
  loading,
  error,
  onSelect,
  onRetry,
  connecting,
}: BusinessSelectorProps) {
  const [selected, setSelected] =
    useState<GoogleBusinessProfileBusiness | null>(null);

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
          ) : businesses.length > 0 ? (
            `בחר את העסק שברצונך לחבר (נמצאו ${businesses.length} עסקים)`
          ) : (
            "בחר את העסק שברצונך לחבר מרשימת העסקים שלך"
          )}
        </div>
      </DashboardCardHeader>
      <DashboardCardContent>
        {!loading && error && businesses.length === 0 && (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={onRetry} disabled={loading}>
              נסה שוב
            </Button>
          </div>
        )}

        {!loading && businesses.length > 0 && (
          <>
            <RadioGroup
              value={selected?.id || ""}
              onValueChange={(value) => {
                const business = businesses.find((loc) => loc.id === value);
                setSelected(business || null);
              }}
              className="gap-3"
              dir="rtl"
            >
              {businesses.map((business) => (
                <div
                  key={business.id}
                  className={`relative flex items-start gap-3 rounded-lg border p-4 transition-colors ${
                    selected?.id === business.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem
                    value={business.id}
                    id={business.id}
                    className="mt-1"
                  />
                  <Label
                    htmlFor={business.id}
                    className="flex-1 cursor-pointer space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{business.name}</span>
                    </div>
                    {business.address && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                        <span>{business.address}</span>
                      </div>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="mt-6 flex gap-3" dir="rtl">
              <Button
                onClick={handleConnect}
                className="flex-1"
                disabled={connecting || !selected}
              >
                {connecting ? "מחבר..." : "חבר עסק זה"}
              </Button>
            </div>
          </>
        )}
      </DashboardCardContent>
    </DashboardCard>
  );
}
