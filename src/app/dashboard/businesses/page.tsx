"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/ui/loading";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { Settings, MapPin, Plus, Link } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardContent,
} from "@/components/ui/dashboard-card";

export default function BusinessesPage() {
  const { loading: authLoading } = useAuth();
  const { businesses, loading: businessLoading } = useBusiness();
  const { limits } = useSubscription();
  const router = useRouter();

  const maxBusinesses = limits.businesses;

  if (authLoading || businessLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="md" />
      </div>
    );
  }

  const handleBusinessClick = (businessId: string) => {
    router.push(`/dashboard/reviews?businessId=${businessId}`);
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
            className="cursor-pointer relative"
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
                <img
                  src={business.photoUrl}
                  alt={business.name}
                  className="w-full h-32 object-cover rounded-t-lg -mt-6 -mx-6 mb-4"
                />
              )}
              <DashboardCardTitle>
                <div className="flex items-center justify-between w-full">
                  <span>{business.name}</span>
                  {!business.connected && (
                    <Badge variant="secondary">מנותק</Badge>
                  )}
                </div>
              </DashboardCardTitle>
            </DashboardCardHeader>

            <DashboardCardContent>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{business.address}</span>
              </div>
              {business.description && (
                <div className="my-3 bg-primary/10 p-3 rounded-md whitespace-pre-wrap leading-relaxed text-sm text-muted-foreground">
                  {business.description}
                </div>
              )}
            </DashboardCardContent>
          </DashboardCard>
        ))}

        <DashboardCard
          className="cursor-pointer border-dashed border-2 hover:border-primary/50 hover:bg-accent/50 transition-all flex flex-col items-center justify-center h-full"
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
