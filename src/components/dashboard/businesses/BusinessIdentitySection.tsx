"use client";

import { Business, BusinessConfig } from "@/lib/types";
import { DashboardCardField } from "@/components/ui/dashboard-card";
import { Building2 } from "lucide-react";
import EditableSection from "@/components/dashboard/shared/EditableSection";
import {
  BusinessDetailsForm,
  BusinessDetailsFormData,
} from "@/components/dashboard/businesses/forms/BusinessDetailsForm";

interface BusinessIdentitySectionProps {
  config: BusinessConfig;
  business: Business;
  loading?: boolean;
  onSave: (config: Partial<BusinessConfig>) => Promise<void>;
}

export default function BusinessIdentitySection({ config, business, loading, onSave }: BusinessIdentitySectionProps) {
  const formData: BusinessDetailsFormData = {
    name: config.name || "",
    description: config.description || "",
    phoneNumber: config.phoneNumber || "",
  };

  return (
    <EditableSection
      title="פרטי עסק"
      description="פרטי זהות העסק לשימוש בתגובות AI"
      icon={<Building2 className="h-5 w-5" />}
      modalTitle="עריכת פרטי עסק"
      modalDescription="ערוך את פרטי זהות העסק לשימוש בתגובות AI"
      loading={loading}
      data={formData}
      onSave={onSave}
      renderDisplay={() => (
        <>
          <DashboardCardField label="שם העסק">
            <p className="text-sm font-medium">{config.name || business.name}</p>
          </DashboardCardField>

          <DashboardCardField label="תיאור העסק">
            <p className="text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap leading-relaxed">
              {config.description || "אין תיאור"}
            </p>
          </DashboardCardField>

          <DashboardCardField label="טלפון ליצירת קשר (לביקורות שליליות)">
            <p className="text-sm font-medium">{config.phoneNumber || "אין טלפון"}</p>
          </DashboardCardField>
        </>
      )}
      renderForm={({ data, isLoading, onChange }) => (
        <BusinessDetailsForm
          values={data}
          onChange={onChange}
          disabled={isLoading}
          businessNamePlaceholder={business.name}
        />
      )}
    />
  );
}
