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
import { toast } from "sonner";
import { useAccount } from "@/contexts/AccountContext";

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

      const response = await fetch("/api/google/businesses");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "לא ניתן לטעון עסקים");
      }

      setAvailableBusinesses(data.businesses);

      if (data.businesses.length === 0) {
        toast.error("לא נמצאו עסקים בחשבון Google Business Profile שלך");
      }
    } catch (err) {
      console.error("Error loading available businesses:", err);
      const errorMessage =
        err instanceof Error ? err.message : "לא ניתן לטעון עסקים";
      toast.error(errorMessage);
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
      toast.error(errorParam);
    }
  }, [successParam, errorParam, loadAvailableBusinesses]);

  const handleStartOAuth = async () => {
    try {
      setLoading(true);

      const canAdd = await checkBusinessLimit(userId);
      if (!canAdd) {
        toast.error(
          "הגעת למגבלת העסקים בחבילת המינוי שלך. שדרג כדי להוסיף עסקים נוספים."
        );
        return;
      }

      window.location.href = "/api/google/auth";
    } catch (err) {
      console.error("Error starting OAuth:", err);
      toast.error("לא ניתן להתחיל את תהליך ההזדהות");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (business: GoogleBusinessProfileBusiness) => {
    try {
      setConnecting(true);

      const accountId = accountIdParam || currentAccount?.id;
      if (!accountId) {
        toast.error("לא נמצא חשבון פעיל. אנא התחבר מחדש.");
        return;
      }

      const canAdd = await checkBusinessLimit(userId);
      if (!canAdd) {
        toast.error("הגעת למגבלת העסקים בחבילת המינוי שלך");
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
      toast.error(errorMessage);
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
          onSelect={handleConnect}
          onRetry={loadAvailableBusinesses}
          connecting={connecting}
        />
      )}
    </div>
  );
}
