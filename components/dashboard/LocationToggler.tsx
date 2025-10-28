"use client";

import { useLocation } from "@/contexts/LocationContext";
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

export function LocationToggler() {
  const {
    currentLocation,
    locations,
    selectedLocationId,
    selectLocation,
    loading,
  } = useLocation();

  const handleLocationChange = (locationId: string) => {
    selectLocation(locationId);
  };

  if (loading) {
    return <Skeleton className="w-full h-10" />;
  }

  if (locations.length === 0) {
    return (
      <Button asChild className="w-full">
        <Link href="/locations/connect">חבר עסק ראשון</Link>
      </Button>
    );
  }

  if (locations.length === 1) {
    return (
      <div className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-border/40 bg-background shadow-sm">
        <span className="truncate text-sm">{locations[0].name}</span>
      </div>
    );
  }

  return (
    <Select
      value={selectedLocationId || undefined}
      onValueChange={handleLocationChange}
    >
      <SelectTrigger dir="rtl">
        <SelectValue placeholder="בחר עסק">
          {currentLocation && (
            <div className="flex items-center gap-2">
              <span className="mx-2">{currentLocation.name}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent dir="rtl">
        {locations.map((location) => (
          <SelectItem key={location.id} value={location.id}>
            <span>{location.name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
