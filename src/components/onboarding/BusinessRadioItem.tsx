"use client";

import { useDirection } from "@/contexts/DirectionProvider";
import { GoogleBusinessProfileBusiness } from "@/lib/types";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Building2, MapPin } from "lucide-react";

interface BusinessRadioItemProps {
  business: GoogleBusinessProfileBusiness;
  selected: boolean;
}

export function BusinessRadioItem({ business, selected }: BusinessRadioItemProps) {
  const { isRTL } = useDirection();

  return (
    <div
      className={`relative flex items-start gap-4 rounded-2xl border p-5 transition-all duration-300 ${
        isRTL ? "flex-row-reverse" : ""
      } ${selected ? "border-primary bg-pastel-lavender/20 shadow-md" : "border-border/40 hover:border-primary/50 hover:shadow-sm hover:bg-pastel-lavender/5"}`}
    >
      <RadioGroupItem value={business.id} id={business.id} className="mt-1" />
      <Label htmlFor={business.id} className="flex-1 cursor-pointer space-y-2">
        <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-pastel-lavender/30">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-lg">{business.name}</span>
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
