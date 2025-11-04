"use client";

import { useEffect, useMemo } from "react";
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
import {
  DashboardChart,
  type ChartDataItem,
} from "@/components/dashboard/charts/DashboardChart";
import { type ChartConfig } from "@/components/ui/chart";
import { toast } from "sonner";
import { BarChart3 } from "lucide-react";

const chartConfig = {
  count: { label: "כמות" },
} satisfies ChartConfig;

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

  const statusChartData = useMemo<ChartDataItem[]>(
    () =>
      stats.statusDistribution.map((item) => ({
        label: item.label,
        count: item.count,
        fill: "oklch(0.5413 0.2466 293.01)",
      })),
    [stats.statusDistribution]
  );

  const starChartData = useMemo<ChartDataItem[]>(
    () =>
      stats.starDistribution.map((item) => ({
        label: item.label,
        count: item.count,
        fill: "oklch(0.5413 0.2466 293.01)",
      })),
    [stats.starDistribution]
  );

  if (businessLoading) {
    return (
      <PageContainer>
        <Loading fullScreen text="טוען..." />
      </PageContainer>
    );
  }

  if (businesses.length === 0 || !currentBusiness) {
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardCard>
              <DashboardCardHeader>
                <DashboardCardTitle>התפלגות סטטוס תגובות</DashboardCardTitle>
                <DashboardCardDescription>
                  מספר הביקורות לפי סטטוס התגובה
                </DashboardCardDescription>
              </DashboardCardHeader>
              <DashboardCardContent>
                <DashboardChart data={statusChartData} config={chartConfig} />
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
                <DashboardChart data={starChartData} config={chartConfig} />
              </DashboardCardContent>
            </DashboardCard>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
