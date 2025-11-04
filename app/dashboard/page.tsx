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

const statusChartConfig = {
  count: { label: "כמות" },
  pending: { label: "ממתין", color: "oklch(0.60 0.23 285)" },
  posted: { label: "פורסם", color: "oklch(0.60 0.23 285)" },
  rejected: { label: "נדחה", color: "oklch(0.60 0.23 285)" },
  failed: { label: "נכשל", color: "oklch(0.60 0.23 285)" },
} satisfies ChartConfig;

const starChartConfig = {
  count: { label: "כמות" },
  1: { label: "★", color: "oklch(0.60 0.23 285)" },
  2: { label: "★★", color: "oklch(0.60 0.23 285)" },
  3: { label: "★★★", color: "oklch(0.60 0.23 285)" },
  4: { label: "★★★★", color: "oklch(0.60 0.23 285)" },
  5: { label: "★★★★★", color: "oklch(0.60 0.23 285)" },
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
      stats.statusDistribution.map((item) => {
        const configItem =
          statusChartConfig[item.status as keyof typeof statusChartConfig];
        return {
          label: item.label,
          count: item.count,
          fill:
            configItem && "color" in configItem
              ? configItem.color
              : "hsl(var(--chart-1))",
        };
      }),
    [stats.statusDistribution]
  );

  const starChartData = useMemo<ChartDataItem[]>(
    () =>
      stats.starDistribution.map((item) => {
        const configItem =
          starChartConfig[item.stars as keyof typeof starChartConfig];
        return {
          label: item.label,
          count: item.count,
          fill:
            configItem && "color" in configItem
              ? configItem.color
              : "hsl(var(--chart-1))",
        };
      }),
    [stats.starDistribution]
  );

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
                <DashboardChart
                  data={statusChartData}
                  config={statusChartConfig}
                />
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
                <DashboardChart data={starChartData} config={starChartConfig} />
              </DashboardCardContent>
            </DashboardCard>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
