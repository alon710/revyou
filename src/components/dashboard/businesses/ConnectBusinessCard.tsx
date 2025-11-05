"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBusiness, getAllUserBusinesses } from "@/lib/firebase/business";
import { checkBusinessLimit } from "@/lib/firebase/business-limits";
import { GoogleBusinessProfileBusiness, Business } from "@/types/database";
import { Loading } from "@/components/ui/loading";
import { ConnectedBusinessesList } from "./ConnectedBusinessesList";
import { OAuthPrompt } from "./OAuthPrompt";
import { BusinessSelector } from "./BusinessSelector";
import { useAccount } from "@/contexts/AccountContext";
import { toast } from "sonner";

interface ConnectBusinessCardProps {
  userId: string;
  onSuccess?: () => void;
  successParam?: string | null;
  errorParam?: string | null;
  accountIdParam?: string | null;
}

export function ConnectBusinessCard({
  userId,
  onSuccess,
  successParam,
  errorParam,
  accountIdParam,
}: ConnectBusinessCardProps) {
  const router = useRouter();
  const { currentAccount } = useAccount();

  const [step, setStep] = useState<"auth" | "select">("auth");
  const [existingBusinesses, setExistingBusinesses] = useState<Business[]>([]);
  const [availableBusinesses, setAvailableBusinesses] = useState<
    GoogleBusinessProfileBusiness[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const loadExistingBusinesses = useCallback(async () => {
    try {
      setLoadingExisting(true);
      const businesses = await getAllUserBusinesses(userId);
      setExistingBusinesses(businesses);
    } catch (err) {
      console.error("Error loading existing businesses:", err);
    } finally {
      setLoadingExisting(false);
    }
  }, [userId]);

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
      }
    } catch (err) {
      console.error("Error loading available businesses:", err);
      const errorMessage =
        err instanceof Error ? err.message : "לא ניתן לטעון עסקים";
      setError(errorMessage);
    } finally {
      setLoadingAvailable(false);
    }
  }, []);

  useEffect(() => {
    loadExistingBusinesses();
  }, [loadExistingBusinesses]);

  useEffect(() => {
    if (successParam === "true") {
      setStep("select");
      loadAvailableBusinesses();
    }

    if (errorParam) {
      setError(errorParam);
    }
  }, [successParam, errorParam, loadAvailableBusinesses]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleStartOAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      const canAdd = await checkBusinessLimit(userId);
      if (!canAdd) {
        setError(
          "הגעת למגבלת העסקים בחבילת המינוי שלך. שדרג כדי להוסיף עסקים נוספים."
        );
        return;
      }

      window.location.href = "/api/google/auth";
    } catch (err) {
      console.error("Error starting OAuth:", err);
      setError("לא ניתן להתחיל את תהליך ההזדהות");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (business: GoogleBusinessProfileBusiness) => {
    try {
      setConnecting(true);
      setError(null);

      const accountId = accountIdParam || currentAccount?.id;
      if (!accountId) {
        setError("לא נמצא חשבון פעיל. אנא התחבר מחדש.");
        return;
      }

      const canAdd = await checkBusinessLimit(userId);
      if (!canAdd) {
        setError("הגעת למגבלת העסקים בחבילת המינוי שלך");
        return;
      }

      await createBusiness({
        userId,
        accountId,
        googleBusinessId: business.id,
        name: business.name,
        address: business.address,
        phoneNumber: business.phoneNumber,
        websiteUrl: business.websiteUrl,
        mapsUrl: business.mapsUrl,
        description: business.description,
        photoUrl: business.photoUrl,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard/businesses");
      }
    } catch (err) {
      console.error("Error connecting business:", err);
      const errorMessage =
        err instanceof Error ? err.message : "לא ניתן לחבר את העסק";
      setError(errorMessage);
    } finally {
      setConnecting(false);
    }
  };

  if (loadingExisting) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loading size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {existingBusinesses.length > 0 && step === "auth" && (
        <ConnectedBusinessesList
          businesses={existingBusinesses}
          onAddNew={handleStartOAuth}
          loading={loading}
        />
      )}

      {existingBusinesses.length === 0 && step === "auth" && (
        <OAuthPrompt onConnect={handleStartOAuth} loading={loading} />
      )}

      {step === "select" && (
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
  );
}
