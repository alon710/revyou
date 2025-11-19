import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { DashboardCard } from "@/components/ui/dashboard-card";

export function GenericPageSkeleton() {
  return (
    <PageContainer>
      {}
      <div className="space-y-1">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-96" />
      </div>

      {}
      <DashboardCard>
        <div className="p-6 space-y-6">
          {}
          <div className="space-y-4">
            <Skeleton className="h-6 w-full max-w-2xl" />
            <Skeleton className="h-4 w-full max-w-xl" />
            <Skeleton className="h-4 w-full max-w-lg" />
          </div>

          <div className="space-y-4">
            <Skeleton className="h-6 w-full max-w-lg" />
            <Skeleton className="h-4 w-full max-w-2xl" />
            <Skeleton className="h-4 w-full max-w-xl" />
          </div>

          {}
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </DashboardCard>
    </PageContainer>
  );
}
