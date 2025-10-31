"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createLocation } from "@/lib/firebase/locations";
import { checkLocationLimit } from "@/lib/firebase/location-limits";
import { GoogleBusinessProfileLocation } from "@/types/database";
import { Button } from "@/components/ui/button";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardDescription,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/ui/dashboard-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BackButton } from "@/components/ui/back-button";
import { Building2, AlertCircle, MapPin } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/ui/loading";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function ConnectLocationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState<"auth" | "select">("auth");
  const [locations, setLocations] = useState<GoogleBusinessProfileLocation[]>(
    []
  );
  const [selectedLocation, setSelectedLocation] =
    useState<GoogleBusinessProfileLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const loadLocations = useCallback(async () => {
    if (!user) return;

    try {
      setLoadingLocations(true);
      setError(null);

      const response = await fetch(`/api/google/locations?userId=${user.uid}`);
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

      setLocations(data.locations);

      if (data.locations.length === 0) {
        setError("לא נמצאו עסקים בחשבון Google Business Profile שלך");
      }
    } catch (err) {
      console.error("Error loading locations:", err);
      const errorMessage =
        err instanceof Error ? err.message : "לא ניתן לטעון מיקומים";
      setError(errorMessage);
    } finally {
      setLoadingLocations(false);
    }
  }, [user]);

  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") {
      setStep("select");
      loadLocations();
    }

    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams, loadLocations]);

  const handleStartOAuth = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const canAdd = await checkLocationLimit(user.uid);
      if (!canAdd) {
        setError(
          "הגעת למגבלת העסקים בחבילת המינוי שלך. שדרג כדי להוסיף עסקים נוספים."
        );
        return;
      }

      window.location.href = `/api/google/auth?userId=${user.uid}`;
    } catch (err) {
      console.error("Error starting OAuth:", err);
      setError("לא ניתן להתחיל את תהליך ההזדהות");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!selectedLocation || !user) return;

    try {
      setConnecting(true);
      setError(null);

      const canAdd = await checkLocationLimit(user.uid);
      if (!canAdd) {
        setError("הגעת למגבלת העסקים בחבילת המינוי שלך");
        return;
      }

      await createLocation({
        userId: user.uid,
        googleAccountId: selectedLocation.accountId,
        googleLocationId: selectedLocation.id,
        name: selectedLocation.name,
        address: selectedLocation.address,
      });

      router.push("/locations");
    } catch (err) {
      console.error("Error connecting location:", err);
      const errorMessage =
        err instanceof Error ? err.message : "לא ניתן לחבר את העסק";
      setError(errorMessage);
    } finally {
      setConnecting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="md" />
      </div>
    );
  }

  return (
    <PageContainer>
      <div className="flex items-center gap-4 mb-6">
        <BackButton href="/locations" />
      </div>

      <PageHeader
        title="חבר עסק חדש"
        description="חבר את חשבון Google Business Profile שלך"
      />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: OAuth Authorization */}
      {step === "auth" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>
              התחבר ל-Google Business Profile
            </DashboardCardTitle>
            <DashboardCardDescription>
              אנחנו צריכים הרשאה כדי לגשת לחשבון Google Business Profile שלך
              ולנהל תשובות לביקורות
            </DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">מה נבקש גישה אליו:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>רשימת העסקים שלך ב-Google Business Profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>קריאת ביקורות לקוחות</span>
                </li>
                <li className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>פרסום תשובות לביקורות</span>
                </li>
              </ul>
            </div>

            <Button
              onClick={handleStartOAuth}
              disabled={loading}
              size="lg"
              className="w-full"
            >
              התחבר עם Google
            </Button>
          </DashboardCardContent>
        </DashboardCard>
      )}

      {/* Step 2: Location Selection */}
      {step === "select" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>בחר עסק</DashboardCardTitle>
            <div className="text-sm text-muted-foreground">
              {loadingLocations ? (
                <Loading size="md" text="טוען עסקים..." />
              ) : locations.length > 0 ? (
                `בחר את העסק שברצונך לחבר (נמצאו ${locations.length} עסקים)`
              ) : (
                "בחר את העסק שברצונך לחבר מרשימת העסקים שלך"
              )}
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            {!loadingLocations && error && locations.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={loadLocations} disabled={loadingLocations}>
                  נסה שוב
                </Button>
              </div>
            )}

            {!loadingLocations && locations.length > 0 && (
              <>
                <RadioGroup
                  value={selectedLocation?.id || ""}
                  onValueChange={(value) => {
                    const location = locations.find((loc) => loc.id === value);
                    setSelectedLocation(location || null);
                  }}
                  className="gap-3"
                >
                  {locations.map((location) => (
                    <div
                      key={location.id}
                      className={`relative flex items-start space-x-3 space-x-reverse rounded-lg border p-4 transition-colors ${
                        selectedLocation?.id === location.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem
                        value={location.id}
                        id={location.id}
                        className="mt-1"
                      />
                      <Label
                        htmlFor={location.id}
                        className="flex-1 cursor-pointer space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{location.name}</span>
                        </div>
                        {location.address && (
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                            <span>{location.address}</span>
                          </div>
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {selectedLocation && (
                  <div className="mt-6 flex gap-3">
                    <Button
                      onClick={handleConnect}
                      disabled={connecting}
                      size="lg"
                      className="flex-1"
                    >
                      {connecting ? "מחבר..." : "חבר עסק זה"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedLocation(null)}
                      disabled={connecting}
                    >
                      בטל בחירה
                    </Button>
                  </div>
                )}
              </>
            )}
          </DashboardCardContent>
        </DashboardCard>
      )}
    </PageContainer>
  );
}
