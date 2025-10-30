"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/contexts/LocationContext";
import { deleteLocation } from "@/lib/firebase/locations";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/ui/loading";
import LocationDetailsCard from "@/components/dashboard/locations/LocationDetailsCard";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";

export default function LocationsPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    currentLocation,
    locations,
    loading: locationLoading,
    refreshLocations,
  } = useLocation();
  const { limits } = useSubscription();

  const handleDelete = async () => {
    if (!currentLocation || !user) return;

    try {
      await deleteLocation(user.uid, currentLocation.id);
      await refreshLocations();
    } catch (error) {
      console.error("Error deleting location:", error);
    }
  };

  const maxLocations = limits.locations;
  const canAddMore = locations.length < maxLocations;

  if (authLoading || locationLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="md" />
      </div>
    );
  }

  if (locations.length === 0 || !currentLocation) {
    return (
      <PageContainer>
        <PageHeader
          title="העסקים שלי"
          description="נהל את חשבונות Google Business Profile המחוברים שלך"
        />
        <EmptyState />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={currentLocation.name}
        description={currentLocation.address}
        icon={
          !currentLocation.connected && <Badge variant="secondary">מנותק</Badge>
        }
        actions={
          <>
            <DeleteConfirmation
              title="מחיקת עסק"
              description={`פעולה זו תמחק את העסק "${currentLocation.name}" לצמיתות!`}
              confirmationText={currentLocation.name}
              confirmationLabel="כדי לאשר, הקלד את שם העסק:"
              confirmationPlaceholder="שם העסק"
              onDelete={handleDelete}
              deleteButtonText="מחק עסק"
              variant="inline"
            />
            <Button asChild disabled={!canAddMore} variant="outline" size="sm">
              <Link href="/locations/connect">הוסף עסק</Link>
            </Button>
          </>
        }
      />

      <LocationDetailsCard
        location={currentLocation}
        userId={user!.uid}
        loading={locationLoading}
        onUpdate={refreshLocations}
      />
    </PageContainer>
  );
}
