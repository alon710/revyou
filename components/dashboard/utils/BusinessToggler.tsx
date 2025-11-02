"use client";

import { useBusiness } from "@/contexts/BusinessContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/ui/icon-button";
import { Building2, Check } from "lucide-react";

export function BusinessToggler() {
  const { businesses, selectedBusinessId, selectBusiness, loading } =
    useBusiness();

  const handleBusinessChange = (businessId: string) => {
    selectBusiness(businessId);
  };

  if (loading || businesses.length <= 1) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          icon={Building2}
          aria-label="Switch business"
          variant="ghost"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {businesses.map((business) => (
          <DropdownMenuItem
            key={business.id}
            onClick={() => handleBusinessChange(business.id)}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-3 w-full">
              {selectedBusinessId === business.id && (
                <Check className="h-4 w-4 shrink-0 text-primary" />
              )}
              <span className="truncate">{business.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
