"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TooltipIcon } from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";

export interface BusinessDetailsFormData {
  name: string;
  description: string;
  phoneNumber: string;
}

interface BusinessDetailsFormProps {
  values: BusinessDetailsFormData;
  onChange: (field: keyof BusinessDetailsFormData, value: string) => void;
  showTooltips?: boolean;
  disabled?: boolean;
  businessNamePlaceholder?: string;
}

export function BusinessDetailsForm({
  values,
  onChange,
  showTooltips = true,
  disabled = false,
  businessNamePlaceholder,
}: BusinessDetailsFormProps) {
  const t = useTranslations("dashboard.businesses.forms.businessDetails");

  return (
    <div className="space-y-6" dir="rtl">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {showTooltips && <TooltipIcon text={t("name.tooltip")} />}
          <Label htmlFor="businessName">{t("name.label")}</Label>
        </div>
        <Input
          id="businessName"
          type="text"
          value={values.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder={businessNamePlaceholder || t("name.placeholder")}
          disabled={disabled}
          dir="rtl"
        />
        {businessNamePlaceholder && <p className="text-xs text-muted-foreground text-end">{t("name.helper")}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {showTooltips && <TooltipIcon text={t("description.tooltip")} />}
          <Label htmlFor="businessDescription">{t("description.label")}</Label>
        </div>
        <Textarea
          id="businessDescription"
          value={values.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder={t("description.placeholder")}
          rows={4}
          disabled={disabled}
          className="resize-none"
          dir="rtl"
        />
        <p className="text-xs text-muted-foreground text-end">{t("description.helper")}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {showTooltips && <TooltipIcon text={t("phone.tooltip")} />}
          <Label htmlFor="businessPhone">{t("phone.label")}</Label>
        </div>
        <Input
          id="businessPhone"
          type="tel"
          value={values.phoneNumber}
          onChange={(e) => onChange("phoneNumber", e.target.value)}
          placeholder={t("phone.placeholder")}
          disabled={disabled}
          dir="ltr"
        />
        <p className="text-xs text-muted-foreground text-end">{t("phone.helper")}</p>
      </div>
    </div>
  );
}
