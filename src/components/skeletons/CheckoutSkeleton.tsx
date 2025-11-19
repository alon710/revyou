import { Skeleton } from "@/components/ui/skeleton";

export function CheckoutSkeleton() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        {}
        <Skeleton className="h-12 w-12 rounded-full" />

        {}
        <div className="space-y-2 flex flex-col items-center">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
    </div>
  );
}
