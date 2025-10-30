"use client";

import { useState } from "react";
import { Location, LocationConfig } from "@/types/database";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";

interface LocationIdentityEditModalProps {
  location: Location;
  open: boolean;
  onClose: () => void;
  onSave: (config: Partial<LocationConfig>) => Promise<void>;
}

export function LocationIdentityEditModal({
  location,
  open,
  onClose,
  onSave,
}: LocationIdentityEditModalProps) {
  const [locationName, setLocationName] = useState(
    location.config.locationName || ""
  );
  const [locationDescription, setLocationDescription] = useState(
    location.config.locationDescription || ""
  );
  const [locationPhone, setLocationPhone] = useState(
    location.config.locationPhone || ""
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await onSave({
        locationName: locationName,
        locationDescription: locationDescription,
        locationPhone: locationPhone,
      });
      onClose();
    } catch (error) {
      console.error("Error saving location identity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setLocationName(location.config.locationName || "");
    setLocationDescription(location.config.locationDescription || "");
    setLocationPhone(location.config.locationPhone || "");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            עריכת פרטי עסק
          </DialogTitle>
          <DialogDescription className="text-right">
            ערוך את פרטי זהות העסק לשימוש בתגובות AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="locationName" className="text-right block">
              שם העסק
            </Label>
            <Input
              id="locationName"
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder={location.name}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground text-right">
              השאר ריק כדי להשתמש בשם מ-Google: {location.name}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="locationDescription" className="text-right block">
              תיאור העסק
            </Label>
            <Textarea
              id="locationDescription"
              value={locationDescription}
              onChange={(e) => setLocationDescription(e.target.value)}
              placeholder="תאר את העסק שלך, את השירותים שאתה מספק..."
              rows={4}
              disabled={isLoading}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              תיאור זה יעזור ל-AI ליצור תשובות מותאמות יותר
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="locationPhone" className="text-right block">
              טלפון ליצירת קשר (לביקורות שליליות)
            </Label>
            <Input
              id="locationPhone"
              type="tel"
              value={locationPhone}
              onChange={(e) => setLocationPhone(e.target.value)}
              placeholder="039025977"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground text-right">
              מספר טלפון שיופיע בתגובות שליליות (1-2 כוכבים)
            </p>
          </div>
        </div>

        <DialogFooter className="flex justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            ביטול
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? <>שומר...</> : <>שמירה</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
