import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { DashboardCard } from "@/components/ui/dashboard-card";

export function DashboardHomeSkeleton() {
  return (
    <PageContainer>
      <div className="space-y-1">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2].map((businessIndex) => (
              <DashboardCard key={businessIndex}>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-6 flex-1" />
                    {businessIndex === 2 && <Skeleton className="h-5 w-24 rounded-full" />}
                  </div>

                  <div className="flex items-start gap-2">
                    <Skeleton className="h-4 w-4 mt-0.5 shrink-0" />
                    <Skeleton className="h-4 flex-1" />
                  </div>

                  <Skeleton className="h-20 w-full rounded-md" />

                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 flex-1" />
                  </div>
                </div>
              </DashboardCard>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DashboardCard>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <Skeleton className="h-6 flex-1" />
                </div>

                <div className="flex items-start gap-2">
                  <Skeleton className="h-4 w-4 mt-0.5 shrink-0" />
                  <Skeleton className="h-4 flex-1" />
                </div>

                <Skeleton className="h-20 w-full rounded-md" />

                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </div>
            </DashboardCard>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
