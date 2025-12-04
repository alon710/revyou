"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { FilterSection } from "./FilterSection";
import { ReviewFilters, ReviewSortField, ReplyStatus } from "@/lib/types";
import { ArrowDown, ArrowUp } from "lucide-react";
import { he, enUS } from "date-fns/locale";
import { Locale } from "date-fns";

const localeMap: Record<string, Locale> = {
  he,
  en: enUS,
};

interface ReviewFiltersFormProps {
  filters: ReviewFilters;
  onApply: (filters: ReviewFilters) => void;
  onReset: () => void;
}

export function ReviewFiltersForm({ filters: initialFilters, onApply, onReset }: ReviewFiltersFormProps) {
  const t = useTranslations("dashboard.reviews.filters");
  const locale = useLocale();
  const dateLocale = localeMap[locale] || enUS;
  const [filters, setFilters] = useState<ReviewFilters>(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleReplyStatusChange = (status: string, checked: boolean) => {
    const currentStatuses = filters.replyStatus || [];
    let newStatuses;
    if (checked) {
      newStatuses = [...currentStatuses, status];
    } else {
      newStatuses = currentStatuses.filter((s) => s !== status);
    }
    setFilters({ ...filters, replyStatus: newStatuses as ReplyStatus[] });
  };

  const handleRatingChange = (rating: number, checked: boolean) => {
    const currentRatings = filters.rating || [];
    let newRatings;
    if (checked) {
      newRatings = [...currentRatings, rating];
    } else {
      newRatings = currentRatings.filter((r) => r !== rating);
    }
    setFilters({ ...filters, rating: newRatings });
  };

  const handleSortFieldChange = (value: string) => {
    setFilters({
      ...filters,
      sort: {
        orderBy: value as ReviewSortField,
        orderDirection: filters.sort?.orderDirection || "desc",
      },
    });
  };

  const toggleSortDirection = () => {
    setFilters({
      ...filters,
      sort: {
        orderBy: filters.sort?.orderBy || "receivedAt",
        orderDirection: filters.sort?.orderDirection === "asc" ? "desc" : "asc",
      },
    });
  };

  return (
    <div className="space-y-6">
      <FilterSection title={t("replyStatus")}>
        {["pending", "posted", "rejected", "failed", "quota_exceeded"].map((status) => (
          <div key={status} className="flex items-center space-x-2">
            <Checkbox
              id={`status-${status}`}
              checked={filters.replyStatus?.includes(status as ReplyStatus)}
              onCheckedChange={(checked) => handleReplyStatusChange(status, checked as boolean)}
            />
            <Label htmlFor={`status-${status}`} className="capitalize">
              {t(`status.${status}`)}
            </Label>
          </div>
        ))}
      </FilterSection>

      <FilterSection title={t("rating")}>
        <div className="flex flex-wrap gap-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={filters.rating?.includes(rating)}
                onCheckedChange={(checked) => handleRatingChange(rating, checked as boolean)}
              />
              <Label htmlFor={`rating-${rating}`}>{rating} ★</Label>
            </div>
          ))}
        </div>
      </FilterSection>

      <FilterSection title={t("dateRange")}>
        <DateRangePicker
          date={{ from: filters.dateFrom, to: filters.dateTo }}
          setDate={(range) => setFilters({ ...filters, dateFrom: range?.from, dateTo: range?.to })}
          locale={dateLocale}
          placeholder={t("pickDate")}
        />
      </FilterSection>

      <FilterSection title={t("sortBy")}>
        <div className="flex gap-2">
          <Select value={filters.sort?.orderBy || "receivedAt"} onValueChange={handleSortFieldChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="receivedAt">{t("sort.receivedAt")}</SelectItem>
              <SelectItem value="rating">{t("sort.rating")}</SelectItem>
              <SelectItem value="date">{t("sort.date")}</SelectItem>
              <SelectItem value="replyStatus">{t("sort.replyStatus")}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={toggleSortDirection} title={t("sort.direction")}>
            {filters.sort?.orderDirection === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </FilterSection>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onReset}>
          {t("reset")}
        </Button>
        <Button onClick={() => onApply(filters)}>{t("apply")}</Button>
      </div>
    </div>
  );
}
