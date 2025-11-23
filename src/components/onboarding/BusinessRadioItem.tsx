"use client";

import { useLocale } from "next-intl";
import { getLocaleDir, type Locale } from "@/lib/locale";
import { GoogleBusinessProfileBusiness } from "@/lib/types";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Building2, MapPin } from "lucide-react";

interface BusinessRadioItemProps {
  business: GoogleBusinessProfileBusiness;
  selected: boolean;
}

export function BusinessRadioItem({ business, selected }: BusinessRadioItemProps) {
  const locale = useLocale() as Locale;
  const dir = getLocaleDir(locale);
  const isRTL = dir === "rtl";

  return (
    <div
      className={`relative flex items-start gap-3 rounded-lg border p-4 transition-colors ${
        isRTL ? "flex-row-reverse" : ""
      } ${selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
    >
      <RadioGroupItem value={business.id} id={business.id} className="mt-1" />
      <Label htmlFor={business.id} className="flex-1 cursor-pointer space-y-1">
        <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">{business.name}</span>
        </div>
        {business.address && (
          <div className={`flex items-start gap-2 text-sm text-muted-foreground ${isRTL ? "flex-row-reverse" : ""}`}>
            <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>{business.address}</span>
          </div>
        )}
      </Label>
    </div>
  );
}
