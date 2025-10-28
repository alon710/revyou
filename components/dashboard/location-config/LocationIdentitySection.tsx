"use client";

import { useState } from "react";
import { Location, LocationConfig } from "@/types/database";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
  DashboardCardField,
} from "@/components/ui/dashboard-card";
import { Button } from "@/components/ui/button";
import { Building2, Settings } from "lucide-react";
import { LocationIdentityEditModal } from "@/components/dashboard/location-config/LocationIdentityEditModal";

interface LocationIdentitySectionProps {
  config: LocationConfig;
  location: Location;
  loading?: boolean;
  onSave: (config: Partial<LocationConfig>) => Promise<void>;
}

export default function LocationIdentitySection({
  config,
  location,
  loading,
  onSave,
}: LocationIdentitySectionProps) {
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <>
      <DashboardCard>
        <DashboardCardHeader>
          <div className="flex items-center justify-between">
            <div>
              <DashboardCardTitle icon={<Building2 className="h-5 w-5" />}>
                פרטי עסק
              </DashboardCardTitle>
              <DashboardCardDescription>
                פרטי זהות העסק לשימוש בתגובות AI
              </DashboardCardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditModal(true)}
              disabled={loading}
            >
              <Settings className="ml-2 h-4 w-4" />
              עריכה
            </Button>
          </div>
        </DashboardCardHeader>
        <DashboardCardContent className="space-y-6">
          {/* Location Name */}
          <DashboardCardField label="שם העסק">
            <p className="text-sm font-medium">
              {config.locationName || location.name}
            </p>
          </DashboardCardField>

          {/* Location Description */}
          <DashboardCardField label="תיאור העסק">
            <p className="text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap leading-relaxed">
              {config.locationDescription || "אין תיאור"}
            </p>
          </DashboardCardField>

          {/* Location Phone */}
          <DashboardCardField label="טלפון ליצירת קשר (לביקורות שליליות)">
            <p className="text-sm font-medium">{config.locationPhone}</p>
          </DashboardCardField>
        </DashboardCardContent>
      </DashboardCard>

      <LocationIdentityEditModal
        location={location}
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={onSave}
      />
    </>
  );
}
