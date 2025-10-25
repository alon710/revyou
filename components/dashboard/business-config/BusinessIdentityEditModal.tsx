"use client";

import { useState } from "react";
import { Business, BusinessConfig } from "@/types/database";
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
import { Loading } from "@/components/ui/loading";
import { Building2, Save, X } from "lucide-react";

interface BusinessIdentityEditModalProps {
  business: Business;
  open: boolean;
  onClose: () => void;
  onSave: (config: Partial<BusinessConfig>) => Promise<void>;
}

export function BusinessIdentityEditModal({
  business,
  open,
  onClose,
  onSave,
}: BusinessIdentityEditModalProps) {
  const [businessName, setBusinessName] = useState(
    business.config.businessName || ""
  );
  const [businessDescription, setBusinessDescription] = useState(
    business.config.businessDescription || ""
  );
  const [businessPhone, setBusinessPhone] = useState(
    business.config.businessPhone || ""
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await onSave({
        businessName,
        businessDescription,
        businessPhone,
      });
      onClose();
    } catch (error) {
      console.error("Error saving business identity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setBusinessName(business.config.businessName || "");
    setBusinessDescription(business.config.businessDescription || "");
    setBusinessPhone(business.config.businessPhone || "");
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
          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="businessName" className="text-right block">
              שם העסק
            </Label>
            <Input
              id="businessName"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder={business.name}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground text-right">
              השאר ריק כדי להשתמש בשם מ-Google: {business.name}
            </p>
          </div>

          {/* Business Description */}
          <div className="space-y-2">
            <Label htmlFor="businessDescription" className="text-right block">
              תיאור העסק
            </Label>
            <Textarea
              id="businessDescription"
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              placeholder="תאר את העסק שלך, את השירותים שאתה מספק..."
              rows={4}
              disabled={isLoading}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              תיאור זה יעזור ל-AI ליצור תשובות מותאמות יותר
            </p>
          </div>

          {/* Business Phone */}
          <div className="space-y-2">
            <Label htmlFor="businessPhone" className="text-right block">
              טלפון ליצירת קשר (לביקורות שליליות)
            </Label>
            <Input
              id="businessPhone"
              type="tel"
              value={businessPhone}
              onChange={(e) => setBusinessPhone(e.target.value)}
              placeholder="03-123-4567"
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
