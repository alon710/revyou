"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Plus, Loader2, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarSelectorProps<T> {
  items: T[];
  currentItem: T | null;
  onSelect: (item: T) => void;
  onAdd: () => void;
  loading?: boolean;
  emptyMessage: string;
  label: string;
  addButtonLabel: string;
  icon: LucideIcon;
  getItemId: (item: T) => string;
  getItemLabel: (item: T) => string;
  getItemSecondaryLabel?: (item: T) => string | null;
  loadingMessage?: string;
}

export function SidebarSelector<T>({
  items,
  currentItem,
  onSelect,
  onAdd,
  loading = false,
  emptyMessage,
  label,
  addButtonLabel,
  icon: Icon,
  getItemId,
  getItemLabel,
  getItemSecondaryLabel,
  loadingMessage = "טוען...",
}: SidebarSelectorProps<T>) {
  if (loading) {
    return (
      <Button variant="outline" disabled dir="rtl">
        <span className="text-right">{loadingMessage}</span>
      </Button>
    );
  }

  if (items.length === 0) {
    return (
      <Button
        variant="outline"
        className="w-full justify-center text-muted-foreground cursor-default"
        disabled
      >
        <Icon className="h-4 w-4 ml-2" />
        <span>{emptyMessage}</span>
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
          <div className="flex flex-col items-end flex-1 min-w-0">
            <span className="font-medium truncate text-sm">
              {currentItem ? getItemLabel(currentItem) : `בחר ${label}`}
            </span>
            {currentItem && getItemSecondaryLabel && (
              <span className="text-xs text-muted-foreground truncate">
                {getItemSecondaryLabel(currentItem)}
              </span>
            )}
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
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {items.map((item) => {
          const isSelected =
            currentItem && getItemId(currentItem) === getItemId(item);

          return (
            <DropdownMenuItem
              key={getItemId(item)}
              onClick={() => onSelect(item)}
              className={cn("cursor-pointer", isSelected && "bg-accent")}
            >
              <div className="flex items-center gap-2 w-full flex-row-reverse">
                <div className="flex flex-col flex-1 min-w-0 items-end">
                  <span className="font-medium truncate text-right w-full">
                    {getItemLabel(item)}
                  </span>
                  {getItemSecondaryLabel && (
                    <span className="text-xs text-muted-foreground truncate">
                      {getItemSecondaryLabel(item)}
                    </span>
                  )}
                </div>
                {isSelected && (
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                )}
              </div>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onAdd} className="cursor-pointer">
          <div className="flex items-center gap-2 w-full flex-row-reverse text-primary">
            <span className="font-medium">{addButtonLabel}</span>
            <Plus className="h-4 w-4" />
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
