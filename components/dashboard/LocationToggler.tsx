"use client";

import { useLocation } from "@/contexts/LocationContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/ui/icon-button";
import { Building2, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function LocationToggler() {
  const router = useRouter();
  const { locations, selectedLocationId, selectLocation, loading } =
    useLocation();

  const handleLocationChange = (locationId: string) => {
    selectLocation(locationId);
  };

  useEffect(() => {
    if (!loading && locations.length === 0) {
      router.push("/locations/connect");
    }
  }, [loading, locations.length, router]);

  if (loading || locations.length <= 1) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          icon={Building2}
          aria-label="Switch location"
          variant="ghost"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locations.map((location) => (
          <DropdownMenuItem
            key={location.id}
            onClick={() => handleLocationChange(location.id)}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 shrink-0" />
                <span className="truncate">{location.name}</span>
              </div>
              {selectedLocationId === location.id && (
                <Check className="h-4 w-4 shrink-0 text-primary" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
