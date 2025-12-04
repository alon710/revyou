"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReviewFilters } from "@/lib/types";
import { X } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import { he, enUS } from "date-fns/locale";
import { Locale } from "date-fns";

const localeMap: Record<string, Locale> = {
  he,
  en: enUS,
};

interface ActiveFiltersProps {
  filters: ReviewFilters;
  onRemove: (key: keyof ReviewFilters, value?: string | number) => void;
  onClearAll: () => void;
}

export function ActiveFilters({ filters, onRemove, onClearAll }: ActiveFiltersProps) {
  const t = useTranslations("dashboard.reviews.filters");
  const locale = useLocale();
  const dateLocale = localeMap[locale] || enUS;

  const hasFilters =
    (filters.replyStatus?.length ?? 0) > 0 || (filters.rating?.length ?? 0) > 0 || filters.dateFrom || filters.dateTo;

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center mt-4">
      {filters.replyStatus?.map((status) => (
        <Badge key={status} variant="secondary" className="gap-1">
          {t(`status.${status}`)}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 rounded-full p-0 hover:bg-muted"
            onClick={() => onRemove("replyStatus", status)}
            aria-label={t("removeFilter")}
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </Button>
        </Badge>
      ))}

      {filters.rating?.map((rating) => (
        <Badge key={rating} variant="secondary" className="gap-1">
          {rating} ★
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 rounded-full p-0 hover:bg-muted"
            onClick={() => onRemove("rating", rating)}
            aria-label={t("removeFilter")}
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </Button>
        </Badge>
      ))}

      {(filters.dateFrom || filters.dateTo) && (
        <Badge variant="secondary" className="gap-1">
          {filters.dateFrom ? format(filters.dateFrom, "LLL dd", { locale: dateLocale }) : "..."} -{" "}
          {filters.dateTo ? format(filters.dateTo, "LLL dd", { locale: dateLocale }) : "..."}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 rounded-full p-0 hover:bg-muted"
            onClick={() => onRemove("dateFrom")}
            aria-label={t("removeFilter")}
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </Button>
        </Badge>
      )}

      <Button variant="ghost" size="sm" onClick={onClearAll} className="h-6 px-2 text-xs">
        {t("clearAll")}
      </Button>
    </div>
  );
}
