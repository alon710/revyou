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
import { Building2 } from "lucide-react";

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
      <Button asChild className="w-full">
        <Link href="/businesses/connect">חבר עסק ראשון</Link>
      </Button>
    );
  }

  if (businesses.length === 1) {
    return (
      <div className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-border/40 bg-background shadow-sm">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="truncate text-sm font-medium">
          {currentBusiness?.name}
        </span>
      </div>
    );
  }

  return (
    <Select
      value={selectedBusinessId || undefined}
      onValueChange={handleBusinessChange}
    >
      <SelectTrigger className="w-full shadow-sm" dir="rtl">
        <SelectValue placeholder="בחר עסק">
          {currentBusiness && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="truncate font-medium">{currentBusiness.name}</span>
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
