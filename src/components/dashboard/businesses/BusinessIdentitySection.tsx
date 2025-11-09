"use client";

import { Business, BusinessConfig } from "@/lib/types";
import { DashboardCardField } from "@/components/ui/dashboard-card";
import { Building2 } from "lucide-react";
import EditableSection from "@/components/dashboard/shared/EditableSection";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface BusinessIdentitySectionProps {
  config: BusinessConfig;
  business: Business;
  loading?: boolean;
  onSave: (config: Partial<BusinessConfig>) => Promise<void>;
}

interface BusinessIdentityFormData {
  name: string;
  description: string;
  phoneNumber: string;
}

export default function BusinessIdentitySection({ config, business, loading, onSave }: BusinessIdentitySectionProps) {
  const formData: BusinessIdentityFormData = {
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
        <>
          <div className="space-y-2">
            <Label htmlFor="businessName" className="text-right block">
              שם העסק
            </Label>
            <Input
              id="businessName"
              type="text"
              value={data.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder={business.name}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground text-right">
              השאר ריק כדי להשתמש בשם מ-Google: {business.name}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessDescription" className="text-right block">
              תיאור העסק
            </Label>
            <Textarea
              id="businessDescription"
              value={data.description}
              onChange={(e) => onChange("description", e.target.value)}
              placeholder="תאר את העסק שלך, את השירותים שאתה מספק..."
              rows={4}
              disabled={isLoading}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">תיאור זה יעזור ל-AI ליצור תשובות מותאמות יותר</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessPhone" className="text-right block">
              טלפון ליצירת קשר (לביקורות שליליות)
            </Label>
            <Input
              id="businessPhone"
              type="tel"
              value={data.phoneNumber}
              onChange={(e) => onChange("phoneNumber", e.target.value)}
              placeholder="039025977"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground text-right">מספר טלפון שיופיע בתגובות שליליות (1-2 כוכבים)</p>
          </div>
        </>
      )}
    />
  );
}
