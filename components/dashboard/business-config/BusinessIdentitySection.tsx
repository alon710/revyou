import { Business, BusinessConfig } from "@/types/database";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle>פרטי עסק</CardTitle>
        <CardDescription>
          פרטי זהות העסק לשימוש בתגובות AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Business Name */}
        <div className="space-y-2">
          <Label htmlFor="businessName">שם העסק</Label>
          {isEditMode ? (
            <>
              <Input
                id="businessName"
                type="text"
                value={config.businessName || ""}
                onChange={(e) =>
                  onChange({ businessName: e.target.value })
                }
                placeholder={business.name}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                השאר ריק כדי להשתמש בשם מ-Google: {business.name}
              </p>
            </>
          ) : (
            <p className="text-sm font-medium">
              {config.businessName || business.name}
            </p>
          )}
        </div>

        {/* Business Description */}
        <div className="space-y-2">
          <Label htmlFor="businessDescription">תיאור העסק</Label>
          {isEditMode ? (
            <>
              <Textarea
                id="businessDescription"
                value={config.businessDescription}
                onChange={(e) =>
                  onChange({ businessDescription: e.target.value })
                }
                placeholder="תאר את העסק שלך, את השירותים שאתה מספק..."
                rows={4}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                תיאור זה יעזור ל-AI ליצור תשובות מותאמות יותר
              </p>
            </>
          ) : (
            <p className="text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">
              {config.businessDescription || "אין תיאור"}
            </p>
          )}
        </div>

        {/* Business Phone */}
        <div className="space-y-2">
          <Label htmlFor="businessPhone">
            טלפון ליצירת קשר (לביקורות שליליות)
          </Label>
          {isEditMode ? (
            <>
              <Input
                id="businessPhone"
                type="tel"
                value={config.businessPhone || ""}
                onChange={(e) =>
                  onChange({ businessPhone: e.target.value })
                }
                placeholder="03-123-4567"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                מספר טלפון שיופיע בתגובות שליליות (1-2 כוכבים)
              </p>
            </>
          ) : (
            <p className="text-sm font-medium">
              {config.businessPhone || "לא הוגדר"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
