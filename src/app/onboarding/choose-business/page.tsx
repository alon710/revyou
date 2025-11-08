"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleBusinessProfileBusiness } from "../../../../types/database";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { BusinessSelector } from "@/components/dashboard/businesses/BusinessSelector";
import { toast } from "sonner";

export default function OnboardingStep3() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [availableBusinesses, setAvailableBusinesses] = useState<
    GoogleBusinessProfileBusiness[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const accountId = searchParams.get("accountId");

  useEffect(() => {
    if (!accountId) {
      router.push("/onboarding/connect-account");
    }
  }, [accountId, router]);

  const loadAvailableBusinesses = useCallback(async () => {
    if (!accountId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/google/businesses?accountId=${accountId}`
      );
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
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    if (accountId) {
      loadAvailableBusinesses();
    }
  }, [accountId, loadAvailableBusinesses]);

  const handleConnect = async (business: GoogleBusinessProfileBusiness) => {
    if (!user || !accountId) return;

    try {
      setConnecting(true);
      setError(null);

      const response = await fetch(
        `/api/users/${user.uid}/accounts/${accountId}/businesses`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            googleBusinessId: business.id,
            name: business.name,
            address: business.address,
            phoneNumber: business.phoneNumber,
            websiteUrl: business.websiteUrl,
            mapsUrl: business.mapsUrl,
            description: business.description,
            photoUrl: business.photoUrl,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create business");
      }

      toast.success("העסק התחבר בהצלחה");

      try {
        const subscribeResponse = await fetch(
          "/api/google/notifications/subscribe",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accountId }),
          }
        );

        if (!subscribeResponse.ok) {
          console.error(
            "Failed to subscribe to notifications:",
            await subscribeResponse.text()
          );
        }
      } catch (err) {
        console.error("Error subscribing to notifications:", err);
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Error connecting business:", err);
      const errorMessage =
        err instanceof Error ? err.message : "לא ניתן לחבר את העסק";
      toast.error(errorMessage);
    } finally {
      setConnecting(false);
    }
  };

  if (!accountId) {
    return null;
  }

  return (
    <div>
      <StepIndicator currentStep={2} stepName="בחירת עסק" />

      <BusinessSelector
        businesses={availableBusinesses}
        loading={loading}
        error={error}
        onSelect={handleConnect}
        onRetry={loadAvailableBusinesses}
        connecting={connecting}
      />
    </div>
  );
}
