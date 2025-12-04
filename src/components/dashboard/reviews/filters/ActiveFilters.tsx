"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReviewFilters } from "@/lib/types";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";

interface ActiveFiltersProps {
  filters: ReviewFilters;
  onRemove: (key: keyof ReviewFilters, value?: string | number) => void;
  onClearAll: () => void;
}

export function ActiveFilters({ filters, onRemove, onClearAll }: ActiveFiltersProps) {
  const t = useTranslations("dashboard.reviews.filters");

  const hasFilters =
    (filters.replyStatus?.length ?? 0) > 0 || (filters.rating?.length ?? 0) > 0 || filters.dateFrom || filters.dateTo;

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center mt-4">
      {filters.replyStatus?.map((status) => (
        <Badge key={status} variant="secondary" className="gap-1">
          {t(`status.${status}`)}
          <X className="h-3 w-3 cursor-pointer" onClick={() => onRemove("replyStatus", status)} />
        </Badge>
      ))}

      {filters.rating?.map((rating) => (
        <Badge key={rating} variant="secondary" className="gap-1">
          {rating} ★
          <X className="h-3 w-3 cursor-pointer" onClick={() => onRemove("rating", rating)} />
        </Badge>
      ))}

      {(filters.dateFrom || filters.dateTo) && (
        <Badge variant="secondary" className="gap-1">
          {filters.dateFrom ? format(filters.dateFrom, "LLL dd") : "..."} -{" "}
          {filters.dateTo ? format(filters.dateTo, "LLL dd") : "..."}
          <X className="h-3 w-3 cursor-pointer" onClick={() => onRemove("dateFrom")} />
        </Badge>
      )}

      <Button variant="ghost" size="sm" onClick={onClearAll} className="h-6 px-2 text-xs">
        {t("clearAll")}
      </Button>
    </div>
  );
}
