"use client";

import { Business, ReplyStatus } from "@/types/database";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ReviewFiltersState {
  businessId?: string;
  statuses: ReplyStatus[];
  rating?: number;
}

interface ReviewFiltersProps {
  businesses: Business[];
  filters: ReviewFiltersState;
  onFiltersChange: (filters: ReviewFiltersState) => void;
}

/**
 * Review Filters Component
 * Provides filtering controls for the reviews list
 */
export function ReviewFilters({
  businesses,
  filters,
  onFiltersChange,
}: ReviewFiltersProps) {
  const statusOptions: { value: ReplyStatus; label: string }[] = [
    { value: "pending", label: "ממתין לאישור" },
    { value: "approved", label: "מאושר" },
    { value: "posted", label: "פורסם" },
    { value: "rejected", label: "נדחה" },
    { value: "failed", label: "נכשל" },
  ];

  const toggleStatus = (status: ReplyStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];

    onFiltersChange({ ...filters, statuses: newStatuses });
  };

  const setRating = (rating: number) => {
    onFiltersChange({
      ...filters,
      rating: filters.rating === rating ? undefined : rating,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      statuses: [],
    });
  };

  const hasActiveFilters =
    filters.businessId ||
    filters.statuses.length > 0 ||
    filters.rating !== undefined;

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">סינון ביקורות</h3>
        {hasActiveFilters && (
          <Button
            onClick={clearFilters}
            variant="ghost"
            size="sm"
            className="h-8"
          >
            <X className="ml-2 h-4 w-4" />
            נקה הכל
          </Button>
        )}
      </div>

      {/* Business Filter */}
      {businesses.length > 1 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">עסק</label>
          <Select
            value={filters.businessId || "all"}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                businessId: value === "all" ? undefined : value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="כל העסקים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל העסקים</SelectItem>
              {businesses.map((business) => (
                <SelectItem key={business.id} value={business.id}>
                  {business.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Status Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">סטטוס</label>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <Badge
              key={option.value}
              variant={
                filters.statuses.includes(option.value) ? "default" : "outline"
              }
              className="cursor-pointer"
              onClick={() => toggleStatus(option.value)}
            >
              {option.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Star Rating Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">דירוג</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <Button
              key={rating}
              variant={filters.rating === rating ? "default" : "outline"}
              size="sm"
              onClick={() => setRating(rating)}
              className="w-10 h-10 p-0"
            >
              <Star
                size={16}
                className={
                  filters.rating === rating ? "fill-current" : ""
                }
              />
              <span className="sr-only">{rating} כוכבים</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground">
            {filters.statuses.length > 0 && (
              <span>{filters.statuses.length} סטטוסים נבחרו</span>
            )}
            {filters.rating && <span> • דירוג {filters.rating} כוכבים</span>}
          </p>
        </div>
      )}
    </div>
  );
}
