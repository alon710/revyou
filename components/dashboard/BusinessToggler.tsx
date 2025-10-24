"use client";

import { useBusiness } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export function BusinessToggler() {
  const {
    currentBusiness,
    businesses,
    selectedBusinessId,
    selectBusiness,
    loading,
  } = useBusiness();

  const handleBusinessChange = (businessId: string) => {
    selectBusiness(businessId);
  };

  if (loading) {
    return <Skeleton className="w-full h-10" />;
  }

  if (businesses.length === 0) {
    return (
      <Button asChild variant="outline" size="sm" className="w-full">
        <Link href="/businesses/connect">חבר עסק ראשון</Link>
      </Button>
    );
  }

  if (businesses.length === 1) {
    return (
      <div className="flex items-center gap-2 w-full px-3 py-2 rounded-md border bg-background">
        <span className="truncate text-sm">{currentBusiness?.name}</span>
      </div>
    );
  }

  return (
    <Select
      value={selectedBusinessId || undefined}
      onValueChange={handleBusinessChange}
    >
      <SelectTrigger className="w-full" dir="rtl">
        <SelectValue placeholder="בחר עסק">
          {currentBusiness && (
            <div className="flex items-center gap-2">
              <span className="truncate">{currentBusiness.name}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent dir="rtl">
        {businesses.map((business) => (
          <SelectItem key={business.id} value={business.id}>
            <span>{business.name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
