"use client";

import { useRouter } from "next/navigation";
import { Business } from "@/types/database";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/ui/icon-button";
import { Building2, Check } from "lucide-react";
import { useUIStore } from "@/lib/store/ui-store";

interface BusinessTogglerProps {
  businesses: Business[];
  currentBusinessId?: string;
}

export function BusinessToggler({
  businesses,
  currentBusinessId,
}: BusinessTogglerProps) {
  const router = useRouter();
  const setLastSelectedBusinessId = useUIStore(
    (state) => state.setLastSelectedBusinessId
  );

  const handleBusinessChange = (businessId: string) => {
    setLastSelectedBusinessId(businessId);
    router.push(`/dashboard/businesses/${businessId}`);
  };

  if (businesses.length === 0) {
    return null;
  }

  if (businesses.length === 1) {
    const business = businesses[0];
    return (
      <div className="flex items-center gap-3 w-full">
        <span className="truncate min-w-0">{business.name}</span>
      </div>
    );
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
              {currentBusinessId === business.id && (
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
