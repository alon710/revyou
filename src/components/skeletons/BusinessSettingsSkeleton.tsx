import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { DashboardCard } from "@/components/ui/dashboard-card";

export function BusinessSettingsSkeleton() {
  return (
    <PageContainer>
      <div className="mb-4">
        <Skeleton className="h-9 w-20" />
      </div>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>

      <div className="space-y-6">
        {[1, 2, 3].map((index) => (
          <DashboardCard key={index}>
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-6 w-40" />
                  </div>
                  <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton className="h-9 w-9" />
              </div>
            </div>

            <div className="flex-1 p-6 pt-4 space-y-6">
              {index === 1 && (
                <>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </>
              )}
              {index === 2 && (
                <>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-36" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </>
              )}
              {index === 3 && (
                <>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </>
              )}
            </div>
          </DashboardCard>
        ))}

        <DashboardCard className="border-destructive/50">
          <div className="p-6 pb-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex-1 p-6 pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-80" />
              </div>
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
        </DashboardCard>
      </div>
    </PageContainer>
  );
}
