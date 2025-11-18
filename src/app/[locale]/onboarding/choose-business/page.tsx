"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "@/i18n/routing";
import { GoogleBusinessProfileBusiness } from "@/lib/types";
import { toast } from "sonner";
import { OnboardingCard } from "@/components/onboarding/OnboardingCard";
import { BusinessRadioItem } from "@/components/onboarding/BusinessRadioItem";
import { Loading } from "@/components/ui/loading";
import { AlertCircle } from "lucide-react";
import { RadioGroup } from "@/components/ui/radio-group";
import { useTranslations } from "next-intl";
import { getGoogleBusinesses, subscribeToGoogleNotifications } from "@/lib/actions/google.actions";
import { upsertBusiness } from "@/lib/actions/businesses.actions";
import { getDefaultBusinessConfig } from "@/lib/utils/business-config";

export default function OnboardingStep3() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
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
    if (!accountId || !user) return;

    try {
      setLoading(true);
      setError(null);

      const businesses = await getGoogleBusinesses(user.id, accountId);

      setAvailableBusinesses(businesses);

      if (businesses.length === 0) {
        setError(t("errors.noBusinessesFound"));
      }
    } catch (err) {
      console.error("Error loading available businesses:", err);
      const errorMessage = err instanceof Error ? err.message : t("errors.failedToLoad");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [accountId, user, t]);

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

      const defaults = getDefaultBusinessConfig();

      const business = await upsertBusiness(user.id, accountId, {
        googleBusinessId: selectedBusiness.id,
        name: selectedBusiness.name,
        address: selectedBusiness.address,
        phoneNumber: selectedBusiness.phoneNumber,
        websiteUrl: selectedBusiness.websiteUrl,
        mapsUrl: selectedBusiness.mapsUrl,
        description: selectedBusiness.description,
        photoUrl: selectedBusiness.photoUrl,
        ...defaults,
      });

      try {
        await subscribeToGoogleNotifications(user.id, accountId);
      } catch (err) {
        console.error("Error subscribing to notifications:", err);
      }

      router.push(`/onboarding/business-details?accountId=${accountId}&businessId=${business.id}`);
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
          <BusinessRadioItem key={business.id} business={business} selected={selectedBusiness?.id === business.id} />
        ))}
      </RadioGroup>
    </OnboardingCard>
  );
}
