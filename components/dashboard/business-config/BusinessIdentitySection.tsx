import { Business, BusinessConfig } from "@/types/database";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
  DashboardCardField,
} from "@/components/ui/dashboard-card";
import { Building2 } from "lucide-react";
import { SectionBaseProps, ConfigUpdateCallback } from "./types";

interface BusinessIdentitySectionProps extends SectionBaseProps {
  config: BusinessConfig;
  business: Business;
  onChange: ConfigUpdateCallback;
}

export default function BusinessIdentitySection({
  variant,
  config,
  business,
  loading,
  onChange,
}: BusinessIdentitySectionProps) {
  const isEditMode = variant === "edit";

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle icon={<Building2 className="h-5 w-5" />}>
          פרטי עסק
        </DashboardCardTitle>
        <DashboardCardDescription>
          פרטי זהות העסק לשימוש בתגובות AI
        </DashboardCardDescription>
      </DashboardCardHeader>
      <DashboardCardContent className="space-y-6">
        {/* Business Name */}
        <DashboardCardField label="שם העסק">
          {isEditMode ? (
            <div className="space-y-2">
              <Input
                id="businessName"
                type="text"
                value={config.businessName || ""}
                onChange={(e) => onChange({ businessName: e.target.value })}
                placeholder={business.name}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                השאר ריק כדי להשתמש בשם מ-Google: {business.name}
              </p>
            </div>
          ) : (
            <p className="text-sm font-medium">
              {config.businessName || business.name}
            </p>
          )}
        </DashboardCardField>

        {/* Business Description */}
        <DashboardCardField label="תיאור העסק">
          {isEditMode ? (
            <div className="space-y-2">
              <Textarea
                id="businessDescription"
                value={config.businessDescription}
                onChange={(e) =>
                  onChange({ businessDescription: e.target.value })
                }
                placeholder="תאר את העסק שלך, את השירותים שאתה מספק..."
                rows={4}
                disabled={loading}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                תיאור זה יעזור ל-AI ליצור תשובות מותאמות יותר
              </p>
            </div>
          ) : (
            <p className="text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap leading-relaxed">
              {config.businessDescription || "אין תיאור"}
            </p>
          )}
        </DashboardCardField>

        {/* Business Phone */}
        <DashboardCardField label="טלפון ליצירת קשר (לביקורות שליליות)">
          {isEditMode ? (
            <div className="space-y-2">
              <Input
                id="businessPhone"
                type="tel"
                value={config.businessPhone || ""}
                onChange={(e) => onChange({ businessPhone: e.target.value })}
                placeholder="03-123-4567"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                מספר טלפון שיופיע בתגובות שליליות (1-2 כוכבים)
              </p>
            </div>
          ) : (
            <p className="text-sm font-medium">
              {config.businessPhone || "לא הוגדר"}
            </p>
          )}
        </DashboardCardField>
      </DashboardCardContent>
    </DashboardCard>
  );
}
