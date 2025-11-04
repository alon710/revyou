"use client";

import { useBusiness } from "@/contexts/BusinessContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Building2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function SidebarBusinessSelector() {
  const { businesses, currentBusiness, selectBusiness, loading } =
    useBusiness();

  if (loading) {
    return (
      <Button variant="outline" className="w-full justify-center" disabled>
        <Loader2 className="h-4 w-4 animate-spin ml-2" />
        <span>טוען עסקים...</span>
      </Button>
    );
  }

  if (businesses.length === 0) {
    return (
      <Button
        variant="outline"
        className="w-full justify-center text-muted-foreground cursor-default"
        disabled
      >
        <Building2 className="h-4 w-4 ml-2" />
        <span>אין עסקים מחוברים</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-right [direction:rtl]"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="font-medium truncate text-sm flex-1 text-right">
              {currentBusiness?.name || "בחר עסק"}
            </span>
            <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50 mr-2" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[240px] [direction:rtl]"
        sideOffset={5}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal text-right">
          העסקים שלי
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {businesses.map((business) => {
          const isSelected = currentBusiness?.id === business.id;

          return (
            <DropdownMenuItem
              key={business.id}
              onClick={() => selectBusiness(business.id)}
              className={cn("cursor-pointer", isSelected && "bg-accent")}
            >
              <div className="flex items-center gap-2 w-full flex-row-reverse">
                <span className="truncate text-right flex-1">
                  {business.name}
                </span>
                {isSelected && (
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
