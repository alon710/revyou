"use client";

import { useBusiness } from "@/contexts/BusinessContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, AlertCircle } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Loading } from "@/components/ui/loading";

export function BusinessToggler() {
  const { user } = useAuth();
  const {
    currentBusiness,
    businesses,
    selectedBusinessId,
    selectBusiness,
    loading,
  } = useBusiness();
  const router = useRouter();
  const pathname = usePathname();

  const handleBusinessChange = (businessId: string) => {
    selectBusiness(businessId);

    if (user && pathname.includes("/dashboard/")) {
      router.push(`/dashboard/${user.uid}/${businessId}/reviews`);
    }
  };

  if (loading) {
    return (
      <div className="px-3 py-3 border-b">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loading size="sm" text="טוען עסקים..." />
        </div>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="px-3 py-3 border-b">
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                אין עסקים מחוברים
              </p>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full text-xs h-7"
              >
                <Link href="/businesses/connect">חבר עסק ראשון</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-3 border-b">
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          עסק פעיל
        </label>
        <Select
          value={selectedBusinessId || undefined}
          onValueChange={handleBusinessChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="בחר עסק">
              {currentBusiness && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="truncate">{currentBusiness.name}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {businesses.map((business) => (
              <SelectItem key={business.id} value={business.id}>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{business.name}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {business.address}
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {currentBusiness && (
          <div className="text-xs text-muted-foreground">
            <span className="truncate block">{currentBusiness.address}</span>
          </div>
        )}
      </div>
    </div>
  );
}
