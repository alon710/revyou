import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { DashboardCard } from "@/components/ui/dashboard-card";

export function ReviewsListSkeleton() {
  return (
    <PageContainer>
      <div className="mb-6">
        <Skeleton className="h-9 w-20" />
      </div>

      <div className="space-y-1">
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="space-y-4 mt-6">
        {[1, 2, 3].map((index) => (
          <DashboardCard key={index}>
            <div className="p-6 pb-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 space-y-4">
              <div>
                <Skeleton className="h-3 w-16 mb-2" />
                <div className="rounded-md bg-muted/50 p-3 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>

              {index !== 3 && (
                <div className="border-t border-border/40 pt-4">
                  <Skeleton className="h-3 w-20 mb-2" />
                  <div className="rounded-md border border-primary/20 bg-primary/5 p-3 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              )}
            </div>

            {index <= 2 && (
              <div className="flex items-center justify-end gap-2 p-6 pt-4 border-t border-border/40">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-9 w-20" />
              </div>
            )}
          </DashboardCard>
        ))}
      </div>
    </PageContainer>
  );
}
