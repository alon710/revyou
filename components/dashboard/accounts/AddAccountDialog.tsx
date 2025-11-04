"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAccountDialog({
  open,
  onOpenChange,
}: AddAccountDialogProps) {
  const handleConnect = () => {
    // Store that we're adding an account (so we know to return to appropriate page)
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pendingAccountAdd", "true");
    }

    // Redirect to Google OAuth
    window.location.href = "/api/google/auth";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] [direction:rtl]">
        <DialogHeader>
          <DialogTitle className="text-right">
            הוסף חשבון Google חדש
          </DialogTitle>
          <DialogDescription className="text-right">
            חבר חשבון Google נוסף כדי לנהל עסקים נוספים
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <div className="bg-muted rounded-lg p-4 space-y-3 text-right">
            <h4 className="font-medium text-sm">מה יקרה הלאה?</h4>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>תועבר לדף ההתחברות של Google</li>
              <li>בחר את החשבון שברצונך לחבר</li>
              <li>אשר את ההרשאות הנדרשות</li>
              <li>תחזור אוטומטית לאפליקציה</li>
            </ol>
          </div>

          <div className="flex justify-start gap-3">
            <Button onClick={handleConnect} className="gap-2">
              <Plus className="h-4 w-4" />
              חבר חשבון Google
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
