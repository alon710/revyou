"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/ui/loading";
import { Bell, Save, X } from "lucide-react";

interface NotificationPreferencesEditModalProps {
  emailOnNewReview: boolean;
  emailOnFailedPost: boolean;
  open: boolean;
  onClose: () => void;
  onSave: (preferences: {
    emailOnNewReview: boolean;
    emailOnFailedPost: boolean;
  }) => Promise<void>;
}

export function NotificationPreferencesEditModal({
  emailOnNewReview,
  emailOnFailedPost,
  open,
  onClose,
  onSave,
}: NotificationPreferencesEditModalProps) {
  const [localEmailOnNewReview, setLocalEmailOnNewReview] =
    useState(emailOnNewReview);
  const [localEmailOnFailedPost, setLocalEmailOnFailedPost] =
    useState(emailOnFailedPost);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await onSave({
        emailOnNewReview: localEmailOnNewReview,
        emailOnFailedPost: localEmailOnFailedPost,
      });
      onClose();
    } catch (error) {
      console.error("Error saving notification preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setLocalEmailOnNewReview(emailOnNewReview);
    setLocalEmailOnFailedPost(emailOnFailedPost);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            עריכת התראות אימייל
          </DialogTitle>
          <DialogDescription className="text-right">
            בחר אילו התראות תרצה לקבל באימייל
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Email on New Review */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <Label
                htmlFor="emailOnNewReview"
                className="text-sm font-medium cursor-pointer"
              >
                ביקורת חדשה
              </Label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                קבל התראה באימייל כאשר מתקבלת ביקורת חדשה
              </p>
            </div>
            <Switch
              id="emailOnNewReview"
              checked={localEmailOnNewReview}
              onCheckedChange={setLocalEmailOnNewReview}
              disabled={isLoading}
            />
          </div>

          {/* Email on Failed Post */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <Label
                htmlFor="emailOnFailedPost"
                className="text-sm font-medium cursor-pointer"
              >
                פרסום נכשל
              </Label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                קבל התראה באימייל כאשר פרסום תגובה אוטומטית נכשל
              </p>
            </div>
            <Switch
              id="emailOnFailedPost"
              checked={localEmailOnFailedPost}
              onCheckedChange={setLocalEmailOnFailedPost}
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <X className="ml-2 h-5 w-5" />
            ביטול
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loading size="sm" />
                שומר...
              </>
            ) : (
              <>
                <Save className="ml-2 h-5 w-5" />
                שמור שינויים
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
