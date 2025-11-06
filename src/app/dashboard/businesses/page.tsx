"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAllUserBusinesses } from "@/lib/firebase/business";
import type { Business } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/ui/loading";
import { Settings, MapPin, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardContent,
} from "@/components/ui/dashboard-card";
import Image from "next/image";

export default function BusinessesPage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchBusinesses() {
      if (!user) return;

      try {
        setLoading(true);
        const bizList = await getAllUserBusinesses(user.uid);
        setBusinesses(bizList);
      } catch (error) {
        console.error("Error fetching businesses:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBusinesses();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="md" />
      </div>
    );
  }

  const handleBusinessClick = (businessId: string) => {
    router.push(`/dashboard/businesses/${businessId}/reviews`);
  };

  const handleSettingsClick = (e: React.MouseEvent, businessId: string) => {
    e.stopPropagation();
    router.push(`/dashboard/businesses/${businessId}/settings`);
  };

  return (
    <PageContainer>
      <PageHeader
        title="העסקים שלי"
        description="נהל את חשבונות Google Business Profile המחוברים שלך"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {businesses.map((business) => (
          <DashboardCard
            key={business.id}
            className="cursor-pointer relative min-h-[320px] flex flex-col"
            onClick={() => handleBusinessClick(business.id)}
          >
            <div className="absolute top-4 left-4 z-10">
              <IconButton
                icon={Settings}
                variant="ghost"
                size="sm"
                aria-label="הגדרות עסק"
                onClick={(e) => handleSettingsClick(e, business.id)}
              />
            </div>

            <DashboardCardHeader>
              {business.photoUrl && (
                <Image
                  src={business.photoUrl}
                  alt={business.name}
                  className="w-full h-32 object-cover rounded-t-lg -mt-6 -mx-6 mb-4"
                />
              )}
              <DashboardCardTitle>
                <div className="flex items-center justify-between w-full gap-2">
                  <span className="truncate">{business.name}</span>
                  {!business.connected && (
                    <Badge variant="secondary" className="shrink-0">
                      מנותק
                    </Badge>
                  )}
                </div>
              </DashboardCardTitle>
            </DashboardCardHeader>

            <DashboardCardContent>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span className="truncate">{business.address}</span>
              </div>
              {business.description && (
                <div className="my-3 bg-primary/10 p-3 rounded-md leading-relaxed text-sm text-muted-foreground line-clamp-3">
                  {business.description}
                </div>
              )}
            </DashboardCardContent>
          </DashboardCard>
        ))}
        <DashboardCard
          className="cursor-pointer border-dashed border-2 hover:border-primary/50 hover:bg-accent/50 transition-all flex flex-col items-center justify-center min-h-[320px]"
          onClick={() => router.push("/onboarding/step-2")}
        >
          <div className="flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">הוסף עסק</h3>
            <p className="text-sm text-muted-foreground mt-2">
              חבר עסק נוסף מ-Google Business Profile
            </p>
          </div>
        </DashboardCard>
      </div>
    </PageContainer>
  );
}
