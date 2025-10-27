"use client";

import { useState } from "react";
import { Business, BusinessConfig } from "@/types/database";
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
import { BusinessIdentityEditModal } from "@/components/dashboard/business-config/BusinessIdentityEditModal";

interface BusinessIdentitySectionProps {
  config: BusinessConfig;
  business: Business;
  loading?: boolean;
  onSave: (config: Partial<BusinessConfig>) => Promise<void>;
}

export default function BusinessIdentitySection({
  config,
  business,
  loading,
  onSave,
}: BusinessIdentitySectionProps) {
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
          {/* Business Name */}
          <DashboardCardField label="שם העסק">
            <p className="text-sm font-medium">
              {config.businessName || business.name}
            </p>
          </DashboardCardField>

          {/* Business Description */}
          <DashboardCardField label="תיאור העסק">
            <p className="text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap leading-relaxed">
              {config.businessDescription || "אין תיאור"}
            </p>
          </DashboardCardField>

          {/* Business Phone */}
          <DashboardCardField label="טלפון ליצירת קשר (לביקורות שליליות)">
            <p className="text-sm font-medium">{config.businessPhone}</p>
          </DashboardCardField>
        </DashboardCardContent>
      </DashboardCard>

      <BusinessIdentityEditModal
        business={business}
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={onSave}
      />
    </>
  );
}
