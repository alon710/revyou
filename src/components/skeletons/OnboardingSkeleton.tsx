import { Skeleton } from "@/components/ui/skeleton";
import { DashboardCard } from "@/components/ui/dashboard-card";

export function OnboardingSkeleton() {
  return (
    <div>
      <DashboardCard>
        {}
        <div className="flex flex-col space-y-2 p-6 pb-4">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>

        {}
        <div className="flex-1 p-6 pt-4 space-y-6">
          {}
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>

          {}
          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}
