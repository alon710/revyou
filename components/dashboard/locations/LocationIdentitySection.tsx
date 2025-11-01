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
import { LocationIdentityEditModal } from "@/components/dashboard/locations/LocationIdentityEditModal";

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
          <DashboardCardField label="שם העסק">
            <p className="text-sm font-medium">
              {config.name || location.name}
            </p>
          </DashboardCardField>

          <DashboardCardField label="תיאור העסק">
            <p className="text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap leading-relaxed">
              {config.description || "אין תיאור"}
            </p>
          </DashboardCardField>

          <DashboardCardField label="טלפון ליצירת קשר (לביקורות שליליות)">
            <p className="text-sm font-medium">{config.phoneNumber}</p>
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
