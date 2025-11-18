"use client";

import { Business } from "@/lib/types";
import { DashboardCardField } from "@/components/ui/dashboard-card";
import { Building2 } from "lucide-react";
import EditableSection from "@/components/dashboard/shared/EditableSection";
import {
  BusinessDetailsForm,
  BusinessDetailsFormData,
} from "@/components/dashboard/businesses/forms/BusinessDetailsForm";
import { useTranslations } from "next-intl";

interface BusinessIdentitySectionProps {
  business: Business;
  loading?: boolean;
  onSave: (data: Partial<Business>) => Promise<void>;
}

export default function BusinessIdentitySection({ business, loading, onSave }: BusinessIdentitySectionProps) {
  const t = useTranslations("dashboard.businesses.sections.identity");
  const tCommon = useTranslations("common");

  const formData: BusinessDetailsFormData = {
    name: business.name || "",
    description: business.description || "",
    phoneNumber: business.phoneNumber || "",
  };

  return (
    <EditableSection
      title={t("title")}
      description={t("description")}
      icon={<Building2 className="h-5 w-5" />}
      modalTitle={t("modalTitle")}
      modalDescription={t("modalDescription")}
      loading={loading}
      data={formData}
      onSave={onSave}
      successMessage={tCommon("saveSuccess")}
      errorMessage={tCommon("saveError")}
      cancelLabel={tCommon("cancel")}
      saveLabel={tCommon("save")}
      savingLabel={tCommon("saving")}
      renderDisplay={() => (
        <>
          <DashboardCardField label={t("fields.name")}>
            <p className="text-sm font-medium">{business.name}</p>
          </DashboardCardField>

          <DashboardCardField label={t("fields.description")}>
            <p className="text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap leading-relaxed">
              {business.description || t("noDescription")}
            </p>
          </DashboardCardField>

          <DashboardCardField label={t("fields.phone")}>
            <p className="text-sm font-medium">{business.phoneNumber || t("noPhone")}</p>
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
