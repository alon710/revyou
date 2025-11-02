"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useBusinessData } from "@/contexts/BusinessDataContext";
import { deleteBusiness, getUserBusinesses } from "@/lib/firebase/business";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import BusinessDetailsCard from "@/components/dashboard/businesses/BusinessDetailsCard";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Business } from "@/types/database";

export default function BusinessPage() {
  const { user } = useAuth();
  const { business, refreshBusiness } = useBusinessData();
  const { limits } = useSubscription();
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBusinesses() {
      if (!user) return;
      try {
        const fetchedBusinesses = await getUserBusinesses(user.uid);
        const connected = fetchedBusinesses.filter((b) => b.connected);
        setBusinesses(connected);
      } catch (error) {
        console.error("Error loading businesses:", error);
      } finally {
        setLoading(false);
      }
    }
    loadBusinesses();
  }, [user]);

  const handleDelete = async () => {
    if (!business || !user) return;

    try {
      await deleteBusiness(user.uid, business.id);

      const fetchedBusinesses = await getUserBusinesses(user.uid);
      const connected = fetchedBusinesses.filter((b) => b.connected);

      if (connected.length > 0) {
        router.push(`/dashboard/businesses/${connected[0].id}`);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error deleting business:", error);
    }
  };

  const maxBusinesses = limits.businesses;
  const canAddMore = businesses.length < maxBusinesses;

  return (
    <PageContainer>
      <PageHeader
        title={business.name}
        description={business.address}
        icon={!business.connected && <Badge variant="secondary">מנותק</Badge>}
        actions={
          <>
            <DeleteConfirmation
              title="מחיקת עסק"
              description={`פעולה זו תמחק את העסק "${business.name}" לצמיתות!`}
              confirmationText={business.name}
              confirmationLabel="כדי לאשר, הקלד את שם העסק:"
              confirmationPlaceholder="שם העסק"
              onDelete={handleDelete}
              deleteButtonText="מחק עסק"
              variant="inline"
            />
            <Button asChild disabled={!canAddMore} variant="outline" size="sm">
              <Link href="/dashboard/businesses/connect">הוסף עסק</Link>
            </Button>
          </>
        }
      />

      <BusinessDetailsCard
        business={business}
        userId={user!.uid}
        loading={loading}
        onUpdate={refreshBusiness}
      />
    </PageContainer>
  );
}
