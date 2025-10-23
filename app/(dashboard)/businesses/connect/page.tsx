"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createBusiness, checkBusinessLimit } from "@/lib/firebase/businesses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, Building2, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import BusinessSelector, { GoogleLocationData } from "@/components/dashboard/BusinessSelector";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

/**
 * Connect Business Page
 * Handles OAuth flow and business location selection
 */
export default function ConnectBusinessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState<"auth" | "select">("auth");
  const [locations, setLocations] = useState<GoogleLocationData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<GoogleLocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  // Load user's Google Business locations
  const loadLocations = async () => {
    if (!user) return;

    try {
      setLoadingLocations(true);
      setError(null);

      const response = await fetch(`/api/google/locations?userId=${user.uid}`);
      const data = await response.json();

      if (!response.ok) {
        // Handle rate limit errors specifically
        if (response.status === 429) {
          throw new Error(data.error || "Google מגביל את מספר הבקשות. נא להמתין דקה ולנסות שוב.");
        }
        throw new Error(data.error || "Failed to load locations");
      }

      setLocations(data.locations);

      if (data.locations.length === 0) {
        setError("לא נמצאו עסקים בחשבון Google Business Profile שלך");
      }
    } catch (err) {
      console.error("Error loading locations:", err);
      const errorMessage = err instanceof Error ? err.message : "לא ניתן לטעון מיקומים";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingLocations(false);
    }
  };

  // Check if user returned from OAuth callback
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") {
      // OAuth successful, load locations
      setStep("select");
      loadLocations();
    }

    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Start OAuth flow
  const handleStartOAuth = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Check if user can add more businesses
      const canAdd = await checkBusinessLimit(user.uid);
      if (!canAdd) {
        setError("הגעת למגבלת העסקים בחבילת המינוי שלך. שדרג כדי להוסיף עסקים נוספים.");
        return;
      }

      // Redirect to OAuth flow
      window.location.href = `/api/google/auth?userId=${user.uid}`;
    } catch (err) {
      console.error("Error starting OAuth:", err);
      setError("לא ניתן להתחיל את תהליך ההזדהות");
    } finally {
      setLoading(false);
    }
  };

  // Connect selected business
  const handleConnect = async () => {
    if (!selectedLocation || !user) return;

    try {
      setConnecting(true);
      setError(null);

      // Check business limit again
      const canAdd = await checkBusinessLimit(user.uid);
      if (!canAdd) {
        setError("הגעת למגבלת העסקים בחבילת המינוי שלך");
        return;
      }

      // Create business in Firestore
      await createBusiness({
        userId: user.uid,
        googleAccountId: selectedLocation.accountId,
        googleLocationId: selectedLocation.id,
        name: selectedLocation.name,
        address: selectedLocation.address,
      });

      toast.success("העסק חובר בהצלחה!");
      router.push("/businesses");
    } catch (err) {
      console.error("Error connecting business:", err);
      const errorMessage = err instanceof Error ? err.message : "לא ניתן לחבר את העסק";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setConnecting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageContainer maxWidth="4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/businesses">
            <ArrowRight className="ml-2 h-4 w-4" />
            חזור
          </Link>
        </Button>
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
        <Card>
          <CardHeader>
            <CardTitle>התחבר ל-Google Business Profile</CardTitle>
            <CardDescription>
              אנחנו צריכים הרשאה כדי לגשת לחשבון Google Business Profile שלך ולנהל תשובות לביקורות
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              {loading && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
              התחבר עם Google
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Business Selection */}
      {step === "select" && (
        <Card>
          <CardHeader>
            <CardTitle>בחר עסק</CardTitle>
            <CardDescription>
              בחר את העסק שברצונך לחבר מרשימת העסקים שלך
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && locations.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={loadLocations} disabled={loadingLocations}>
                  {loadingLocations && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  נסה שוב
                </Button>
              </div>
            )}

            {!error && (
              <BusinessSelector
                locations={locations}
                selectedLocationId={selectedLocation?.id || null}
                onSelect={setSelectedLocation}
                loading={loadingLocations}
              />
            )}

            {selectedLocation && (
              <div className="mt-6 flex gap-3">
                <Button
                  onClick={handleConnect}
                  disabled={connecting}
                  size="lg"
                  className="flex-1"
                >
                  {connecting && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
                  חבר עסק זה
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
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
