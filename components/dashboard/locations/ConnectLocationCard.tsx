"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createLocation, getUserLocations } from "@/lib/firebase/locations";
import { checkLocationLimit } from "@/lib/firebase/location-limits";
import { GoogleBusinessProfileLocation, Location } from "@/types/database";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { ConnectedLocationsList } from "./ConnectedLocationsList";
import { OAuthPrompt } from "./OAuthPrompt";
import { LocationSelector } from "./LocationSelector";

interface ConnectLocationCardProps {
  userId: string;
  onSuccess?: () => void;
  successParam?: string | null;
  errorParam?: string | null;
}

export function ConnectLocationCard({
  userId,
  onSuccess,
  successParam,
  errorParam,
}: ConnectLocationCardProps) {
  const router = useRouter();

  const [step, setStep] = useState<"auth" | "select">("auth");
  const [existingLocations, setExistingLocations] = useState<Location[]>([]);
  const [availableLocations, setAvailableLocations] = useState<
    GoogleBusinessProfileLocation[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const loadExistingLocations = useCallback(async () => {
    try {
      setLoadingExisting(true);
      const locations = await getUserLocations(userId);
      setExistingLocations(locations);
    } catch (err) {
      console.error("Error loading existing locations:", err);
    } finally {
      setLoadingExisting(false);
    }
  }, [userId]);

  const loadAvailableLocations = useCallback(async () => {
    try {
      setLoadingAvailable(true);
      setError(null);

      const response = await fetch(`/api/google/locations?userId=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(
            data.error ||
              "Google מגביל את מספר הבקשות. נא להמתין דקה ולנסות שוב."
          );
        }
        throw new Error(data.error || "Failed to load locations");
      }

      setAvailableLocations(data.locations);

      if (data.locations.length === 0) {
        setError("לא נמצאו עסקים בחשבון Google Business Profile שלך");
      }
    } catch (err) {
      console.error("Error loading available locations:", err);
      const errorMessage =
        err instanceof Error ? err.message : "לא ניתן לטעון מיקומים";
      setError(errorMessage);
    } finally {
      setLoadingAvailable(false);
    }
  }, [userId]);

  useEffect(() => {
    loadExistingLocations();
  }, [loadExistingLocations]);

  useEffect(() => {
    if (successParam === "true") {
      setStep("select");
      loadAvailableLocations();
    }

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [successParam, errorParam, loadAvailableLocations]);

  const handleStartOAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      const canAdd = await checkLocationLimit(userId);
      if (!canAdd) {
        setError(
          "הגעת למגבלת העסקים בחבילת המינוי שלך. שדרג כדי להוסיף עסקים נוספים."
        );
        return;
      }

      window.location.href = `/api/google/auth?userId=${userId}`;
    } catch (err) {
      console.error("Error starting OAuth:", err);
      setError("לא ניתן להתחיל את תהליך ההזדהות");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (location: GoogleBusinessProfileLocation) => {
    try {
      setConnecting(true);
      setError(null);

      const canAdd = await checkLocationLimit(userId);
      if (!canAdd) {
        setError("הגעת למגבלת העסקים בחבילת המינוי שלך");
        return;
      }

      await createLocation({
        userId,
        googleAccountId: location.accountId,
        googleLocationId: location.id,
        name: location.name,
        address: location.address,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/locations");
      }
    } catch (err) {
      console.error("Error connecting location:", err);
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
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {existingLocations.length > 0 && step === "auth" && (
        <ConnectedLocationsList
          locations={existingLocations}
          onAddNew={handleStartOAuth}
          loading={loading}
        />
      )}

      {existingLocations.length === 0 && step === "auth" && (
        <OAuthPrompt onConnect={handleStartOAuth} loading={loading} />
      )}

      {step === "select" && (
        <LocationSelector
          locations={availableLocations}
          loading={loadingAvailable}
          error={error}
          onSelect={handleConnect}
          onRetry={loadAvailableLocations}
          connecting={connecting}
        />
      )}
    </div>
  );
}
