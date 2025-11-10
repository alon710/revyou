"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TooltipIcon } from "@/components/ui/tooltip";

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
  return (
    <div className="space-y-6" dir="rtl">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {showTooltips && (
            <TooltipIcon text="שם העסק כפי שיופיע בתגובות ללקוחות. השאר ריק כדי להשתמש בשם מ-Google Business Profile" />
          )}
          <Label htmlFor="businessName">שם העסק</Label>
        </div>
        <Input
          id="businessName"
          type="text"
          value={values.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder={businessNamePlaceholder || "שם העסק"}
          disabled={disabled}
          dir="rtl"
        />
        {businessNamePlaceholder && (
          <p className="text-xs text-muted-foreground text-right">שם העסק כפי שהייתם רוצים שיופיע בתגובות</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {showTooltips && (
            <TooltipIcon text="תיאור מפורט של העסק, השירותים שאתה מספק, ונקודות ייחודיות. מידע זה יעזור ל-AI ליצור תשובות מותאמות ומדויקות יותר" />
          )}
          <Label htmlFor="businessDescription">תיאור העסק</Label>
        </div>
        <Textarea
          id="businessDescription"
          value={values.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="תאר את העסק שלך, את השירותים שאתה מספק, מה מייחד אותך מהמתחרים..."
          rows={4}
          disabled={disabled}
          className="resize-none"
          dir="rtl"
        />
        <p className="text-xs text-muted-foreground text-right">תיאור זה יעזור ל-AI ליצור תשובות מותאמות יותר</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {showTooltips && (
            <TooltipIcon text="מספר טלפון שיופיע בתגובות לביקורות שליליות (1-2 כוכבים) כדי לאפשר ללקוחות ליצור קשר ישיר ולפתור בעיות" />
          )}
          <Label htmlFor="businessPhone">טלפון ליצירת קשר</Label>
        </div>
        <Input
          id="businessPhone"
          type="tel"
          value={values.phoneNumber}
          onChange={(e) => onChange("phoneNumber", e.target.value)}
          placeholder="039025977"
          disabled={disabled}
          dir="ltr"
        />
        <p className="text-xs text-muted-foreground text-right">מספר טלפון שיופיע בתגובות שליליות (1-2 כוכבים)</p>
      </div>
    </div>
  );
}
