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
import { Building2 } from "lucide-react";
import Link from "next/link";
import { Loading } from "@/components/ui/loading";

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
    // Context change will automatically update the display
  };

  if (loading) {
    return (
      <div className="p-4 border-b">
        <Loading size="sm" text="טוען עסקים..." />
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="p-4 border-b">
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href="/businesses/connect">חבר עסק ראשון</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 border-b">
      <Select
        value={selectedBusinessId || undefined}
        onValueChange={handleBusinessChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="בחר עסק">
            {currentBusiness && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="truncate">{currentBusiness.name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {businesses.map((business) => (
            <SelectItem key={business.id} value={business.id}>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>{business.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
