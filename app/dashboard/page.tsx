"use client";

import { useEffect } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
} from "@/components/ui/dashboard-card";
import { ReviewsStatusChart } from "@/components/dashboard/charts/ReviewsStatusChart";
import { StarDistributionChart } from "@/components/dashboard/charts/StarDistributionChart";
import { toast } from "sonner";
import { BarChart3 } from "lucide-react";

export default function DashboardPage() {
  const {
    currentBusiness,
    businesses,
    loading: businessLoading,
  } = useBusiness();
  const { stats, loading: statsLoading, error } = useDashboardStats();

  useEffect(() => {
    if (error) {
      toast.error("שגיאה בטעינת נתונים: " + error);
    }
  }, [error]);

  if (businessLoading) {
    return (
      <PageContainer>
        <Loading fullScreen text="טוען..." />
      </PageContainer>
    );
  }

  if (businesses.length === 0) {
    return (
      <PageContainer>
        <PageHeader
          title="לוח בקרה"
          description="סקירה כללית של הביקורות שלך"
          icon={<BarChart3 className="h-8 w-8" />}
        />
        <EmptyState />
      </PageContainer>
    );
  }

  if (!currentBusiness) {
    return (
      <PageContainer>
        <PageHeader
          title="לוח בקרה"
          description="סקירה כללית של הביקורות שלך"
          icon={<BarChart3 className="h-8 w-8" />}
        />
        <EmptyState />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={currentBusiness.name}
        description="סקירה כללית של הביקורות והתגובות"
      />

      {statsLoading ? (
        <Loading text="טוען נתונים..." />
      ) : stats.totalReviews === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          אין ביקורות עדיין. הביקורות של {currentBusiness.name} יופיעו כאן ברגע
          שהן יגיעו מגוגל
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DashboardCard>
              <DashboardCardHeader>
                <DashboardCardTitle>סה״כ ביקורות</DashboardCardTitle>
              </DashboardCardHeader>
              <DashboardCardContent>
                <div className="text-3xl font-bold">{stats.totalReviews}</div>
              </DashboardCardContent>
            </DashboardCard>

            <DashboardCard>
              <DashboardCardHeader>
                <DashboardCardTitle>דירוג ממוצע</DashboardCardTitle>
              </DashboardCardHeader>
              <DashboardCardContent>
                <div className="text-3xl font-bold">
                  {stats.averageRating.toFixed(1)}
                </div>
              </DashboardCardContent>
            </DashboardCard>

            <DashboardCard>
              <DashboardCardHeader>
                <DashboardCardTitle>ממתינות לטיפול</DashboardCardTitle>
              </DashboardCardHeader>
              <DashboardCardContent>
                <div className="text-3xl font-bold">
                  {stats.statusDistribution.find((s) => s.status === "pending")
                    ?.count || 0}
                </div>
              </DashboardCardContent>
            </DashboardCard>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardCard>
              <DashboardCardHeader>
                <DashboardCardTitle>התפלגות סטטוס תגובות</DashboardCardTitle>
                <DashboardCardDescription>
                  מספר הביקורות לפי סטטוס התגובה
                </DashboardCardDescription>
              </DashboardCardHeader>
              <DashboardCardContent>
                <ReviewsStatusChart data={stats.statusDistribution} />
              </DashboardCardContent>
            </DashboardCard>

            <DashboardCard>
              <DashboardCardHeader>
                <DashboardCardTitle>התפלגות דירוגים</DashboardCardTitle>
                <DashboardCardDescription>
                  מספר הביקורות לפי כמות כוכבים
                </DashboardCardDescription>
              </DashboardCardHeader>
              <DashboardCardContent>
                <StarDistributionChart data={stats.starDistribution} />
              </DashboardCardContent>
            </DashboardCard>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
