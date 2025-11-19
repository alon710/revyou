import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { DashboardCard } from "@/components/ui/dashboard-card";

export function SettingsSkeleton() {
  return (
    <PageContainer>
      <div className="space-y-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="space-y-6 max-w-2xl">
        <DashboardCard>
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-9 w-9" />
            </div>
          </div>

          <div className="flex-1 p-6 pt-4 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="p-6 pb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-48" />
              </div>
              <Skeleton className="h-4 w-64" />
            </div>
          </div>

          <div className="flex-1 p-6 pt-4">
            <div className="flex items-center justify-between px-4 py-4 -mx-6 border-t border-border/40 first:border-t-0 first:pt-0 first:-mt-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-48" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-9 w-9" />
            </div>

            <div className="flex items-center justify-between px-4 py-4 -mx-6 border-t border-border/40">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-4 w-44" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        </DashboardCard>
      </div>
    </PageContainer>
  );
}
