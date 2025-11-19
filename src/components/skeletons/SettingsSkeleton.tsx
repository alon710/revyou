import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { DashboardCard } from "@/components/ui/dashboard-card";

export function SettingsSkeleton() {
  return (
    <PageContainer>
      {}
      <div className="space-y-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {}
      <div className="space-y-6 max-w-2xl">
        <DashboardCard>
          {}
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

          {}
          <div className="flex-1 p-6 pt-4 space-y-6">
            {}
            <div className="space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>

            {}
            <div className="space-y-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        </DashboardCard>
      </div>
    </PageContainer>
  );
}
