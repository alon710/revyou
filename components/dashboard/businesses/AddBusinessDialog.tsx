"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAccount } from "@/contexts/AccountContext";
import { useBusiness } from "@/contexts/BusinessContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BusinessSelector } from "./BusinessSelector";
import { checkBusinessLimit } from "@/lib/firebase/business-limits";
import { createBusiness, getAllUserBusinesses } from "@/lib/firebase/business";
import { toast } from "sonner";
import type { GoogleBusinessProfileBusiness, Business } from "@/types/database";
import { Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AddBusinessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddBusinessDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddBusinessDialogProps) {
  const { user } = useAuth();
  const { currentAccount } = useAccount();
  const { refreshBusinesses } = useBusiness();

  const [step, setStep] = useState<"intro" | "loading" | "select">("intro");
  const [availableBusinesses, setAvailableBusinesses] = useState<
    GoogleBusinessProfileBusiness[]
  >([]);
  const [existingBusinesses, setExistingBusinesses] = useState<Business[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAvailableBusinesses = useCallback(async () => {
    try {
      setLoadingAvailable(true);
      setError(null);

      const response = await fetch("/api/google/businesses");
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(
            data.error ||
              "Google מגביל את מספר הבקשות. נא להמתין דקה ולנסות שוב."
          );
        }
        throw new Error(data.error || "Failed to load businesses");
      }

      setAvailableBusinesses(data.businesses);

      if (data.businesses.length === 0) {
        setError("לא נמצאו עסקים בחשבון Google Business Profile שלך");
      } else {
        setStep("select");
      }
    } catch (err) {
      console.error("Error loading available businesses:", err);
      const errorMessage =
        err instanceof Error ? err.message : "לא ניתן לטעון עסקים";
      setError(errorMessage);
      setStep("intro");
    } finally {
      setLoadingAvailable(false);
    }
  }, []);

  const loadExistingBusinesses = useCallback(async () => {
    if (!user) return;
    try {
      const businesses = await getAllUserBusinesses(user.uid);
      setExistingBusinesses(businesses);
    } catch (err) {
      console.error("Error loading existing businesses:", err);
    }
  }, [user]);

  useEffect(() => {
    if (open) {
      setStep("intro");
      setError(null);
      loadExistingBusinesses();
    }
  }, [open, loadExistingBusinesses]);

  const handleStartOAuth = async () => {
    if (!user) return;

    try {
      setError(null);

      const canAdd = await checkBusinessLimit(user.uid);
      if (!canAdd) {
        setError(
          "הגעת למגבלת העסקים בחבילת המינוי שלך. שדרג כדי להוסיף עסקים נוספים."
        );
        return;
      }

      // Store that we're adding a business
      if (typeof window !== "undefined") {
        sessionStorage.setItem("pendingBusinessAdd", "true");
      }

      // Redirect to Google OAuth
      window.location.href = "/api/google/auth";
    } catch (err) {
      console.error("Error starting OAuth:", err);
      setError("לא ניתן להתחיל את תהליך ההזדהות");
    }
  };

  const handleLoadBusinesses = async () => {
    if (!user) return;

    try {
      setError(null);

      const canAdd = await checkBusinessLimit(user.uid);
      if (!canAdd) {
        setError(
          "הגעת למגבלת העסקים בחבילת המינוי שלך. שדרג כדי להוסיף עסקים נוספים."
        );
        return;
      }

      setStep("loading");
      await loadAvailableBusinesses();
    } catch (err) {
      console.error("Error:", err);
      setError("שגיאה בטעינת עסקים");
      setStep("intro");
    }
  };

  const handleConnect = async (business: GoogleBusinessProfileBusiness) => {
    if (!user || !currentAccount) {
      setError("לא נמצא חשבון פעיל. אנא התחבר מחדש.");
      return;
    }

    try {
      setConnecting(true);
      setError(null);

      // Check if business is already connected
      const isAlreadyConnected = existingBusinesses.some(
        (b) => b.googleBusinessId === business.id
      );

      if (isAlreadyConnected) {
        toast.error("העסק כבר מחובר");
        return;
      }

      const canAdd = await checkBusinessLimit(user.uid);
      if (!canAdd) {
        setError("הגעת למגבלת העסקים בחבילת המינוי שלך");
        return;
      }

      await createBusiness({
        userId: user.uid,
        accountId: currentAccount.id,
        googleBusinessId: business.id,
        name: business.name,
        address: business.address,
        phoneNumber: business.phoneNumber,
        websiteUrl: business.websiteUrl,
        mapsUrl: business.mapsUrl,
        description: business.description,
      });

      await refreshBusinesses();
      toast.success("העסק נוסף בהצלחה");
      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error connecting business:", err);
      const errorMessage =
        err instanceof Error ? err.message : "לא ניתן לחבר את העסק";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] [direction:rtl]">
        <DialogHeader>
          <DialogTitle className="text-right">הוסף עסק חדש</DialogTitle>
          <DialogDescription className="text-right">
            חבר עסק מ-Google Business Profile
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === "intro" && (
            <>
              <div className="bg-muted rounded-lg p-4 space-y-3 text-right">
                <h4 className="font-medium text-sm">בחר אפשרות:</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• אם כבר התחברת עם Google - טען את העסקים הזמינים</li>
                  <li>• אם צריך להתחבר עם חשבון חדש - התחבר דרך Google</li>
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <Button onClick={handleLoadBusinesses} className="gap-2 w-full">
                  <Plus className="h-4 w-4" />
                  טען עסקים זמינים
                </Button>
                <Button
                  variant="outline"
                  onClick={handleStartOAuth}
                  className="gap-2 w-full"
                >
                  התחבר עם Google
                </Button>
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  ביטול
                </Button>
              </div>
            </>
          )}

          {(step === "loading" || step === "select") && (
            <BusinessSelector
              businesses={availableBusinesses}
              loading={loadingAvailable}
              error={error}
              onSelect={handleConnect}
              onRetry={loadAvailableBusinesses}
              connecting={connecting}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
