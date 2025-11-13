"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "@/i18n/routing";
import { GoogleBusinessProfileBusiness } from "@/lib/types";
import { toast } from "sonner";
import { OnboardingCard } from "@/components/onboarding/OnboardingCard";
import { Loading } from "@/components/ui/loading";
import { AlertCircle, Building2, MapPin } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useTranslations, useLocale } from "next-intl";
import { getLocaleDir, type Locale } from "@/i18n/config";

export default function OnboardingStep3() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale() as Locale;
  const dir = getLocaleDir(locale);
  const isRTL = dir === "rtl";
  const t = useTranslations("onboarding.chooseBusiness");
  const tCommon = useTranslations("onboarding.common");
  const [availableBusinesses, setAvailableBusinesses] = useState<GoogleBusinessProfileBusiness[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<GoogleBusinessProfileBusiness | null>(null);
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

      const response = await fetch(`/api/google/businesses?accountId=${accountId}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(data.error || t("errors.rateLimitError"));
        }
        throw new Error(data.error || t("errors.failedToLoad"));
      }

      setAvailableBusinesses(data.businesses);

      if (data.businesses.length === 0) {
        setError(t("errors.noBusinessesFound"));
      }
    } catch (err) {
      console.error("Error loading available businesses:", err);
      const errorMessage = err instanceof Error ? err.message : t("errors.failedToLoad");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [accountId, t]);

  useEffect(() => {
    if (accountId) {
      loadAvailableBusinesses();
    }
  }, [accountId, loadAvailableBusinesses]);

  const handleBack = () => {
    router.push("/onboarding/connect-account");
  };

  const handleConnect = async () => {
    if (!user || !accountId || !selectedBusiness) return;

    try {
      setConnecting(true);
      setError(null);

      const response = await fetch(`/api/users/${user.uid}/accounts/${accountId}/businesses`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleBusinessId: selectedBusiness.id,
          name: selectedBusiness.name,
          address: selectedBusiness.address,
          phoneNumber: selectedBusiness.phoneNumber,
          websiteUrl: selectedBusiness.websiteUrl,
          mapsUrl: selectedBusiness.mapsUrl,
          description: selectedBusiness.description,
          photoUrl: selectedBusiness.photoUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create business");
      }

      try {
        const subscribeResponse = await fetch("/api/google/notifications/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountId }),
        });

        if (!subscribeResponse.ok) {
          console.error("Failed to subscribe to notifications:", await subscribeResponse.text());
        }
      } catch (err) {
        console.error("Error subscribing to notifications:", err);
      }

      router.push(`/onboarding/business-details?accountId=${accountId}&businessId=${data.business.id}`);
    } catch (err) {
      console.error("Error connecting business:", err);
      const errorMessage = err instanceof Error ? err.message : t("errors.failedToConnect");
      toast.error(errorMessage);
    } finally {
      setConnecting(false);
    }
  };

  if (!accountId) {
    return null;
  }

  if (loading) {
    return (
      <OnboardingCard
        title={t("title")}
        description={t("loadingBusinesses")}
        backButton={{ onClick: handleBack, label: tCommon("back") }}
        nextButton={{ label: t("connectButton"), onClick: handleConnect, disabled: true }}
      >
        <div className="flex items-center justify-center py-8">
          <Loading size="md" />
        </div>
      </OnboardingCard>
    );
  }

  if (error && availableBusinesses.length === 0) {
    return (
      <OnboardingCard
        title={t("title")}
        description={t("description")}
        backButton={{ onClick: handleBack, label: tCommon("back") }}
        nextButton={{ label: tCommon("tryAgain"), onClick: loadAvailableBusinesses, disabled: loading }}
      >
        <div className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{error}</p>
        </div>
      </OnboardingCard>
    );
  }

  return (
    <OnboardingCard
      title={t("title")}
      description={t("descriptionWithCount", { count: availableBusinesses.length })}
      backButton={{ onClick: handleBack, loading: connecting, label: tCommon("back") }}
      nextButton={{
        label: t("connectButton"),
        loadingLabel: t("connectingButton"),
        onClick: handleConnect,
        disabled: !selectedBusiness,
        loading: connecting,
      }}
    >
      <RadioGroup
        value={selectedBusiness?.id || ""}
        onValueChange={(value) => {
          const business = availableBusinesses.find((b) => b.id === value);
          setSelectedBusiness(business || null);
        }}
        className="gap-3"
      >
        {availableBusinesses.map((business) => (
          <div
            key={business.id}
            className={`relative flex items-start gap-3 rounded-lg border p-4 transition-colors ${
              isRTL ? "flex-row-reverse" : ""
            } ${
              selectedBusiness?.id === business.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <RadioGroupItem value={business.id} id={business.id} className="mt-1" />
            <Label htmlFor={business.id} className="flex-1 cursor-pointer space-y-1">
              <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">{business.name}</span>
              </div>
              {business.address && (
                <div className={`flex items-start gap-2 text-sm text-muted-foreground ${isRTL ? "flex-row-reverse" : ""}`}>
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>{business.address}</span>
                </div>
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </OnboardingCard>
  );
}
