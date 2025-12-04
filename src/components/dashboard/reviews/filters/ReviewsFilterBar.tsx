"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ReviewFilters } from "@/lib/types";
import { parseFiltersFromSearchParams, buildSearchParams } from "@/lib/utils/filter-utils";
import { ReviewFiltersForm } from "./ReviewFiltersForm";
import { ResponsiveFilterPanel } from "./ResponsiveFilterPanel";
import { ActiveFilters } from "./ActiveFilters";

export function ReviewsFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const paramsObj: { [key: string]: string | string[] | undefined } = {};
  searchParams.forEach((value, key) => {
    paramsObj[key] = value;
  });

  const filters = parseFiltersFromSearchParams(paramsObj);

  const activeCount =
    (filters.replyStatus?.length ?? 0) + (filters.rating?.length ?? 0) + (filters.dateFrom || filters.dateTo ? 1 : 0);

  const handleApply = (newFilters: ReviewFilters) => {
    const params = buildSearchParams(newFilters);
    router.push(`${pathname}?${params.toString()}`);
    setIsOpen(false);
  };

  const handleReset = () => {
    router.push(pathname);
    setIsOpen(false);
  };

  const handleRemoveFilter = (key: keyof ReviewFilters, value?: string | number) => {
    const newFilters = { ...filters };

    if (key === "replyStatus" && newFilters.replyStatus) {
      newFilters.replyStatus = newFilters.replyStatus.filter((s) => s !== value);
    } else if (key === "rating" && newFilters.rating) {
      newFilters.rating = newFilters.rating.filter((r) => r !== value);
    } else if (key === "dateFrom" || key === "dateTo") {
      delete newFilters.dateFrom;
      delete newFilters.dateTo;
    }

    handleApply(newFilters);
  };

  return (
    <div className="mb-6">
      <ResponsiveFilterPanel activeCount={activeCount} open={isOpen} onOpenChange={setIsOpen}>
        <ReviewFiltersForm filters={filters} onApply={handleApply} onReset={handleReset} />
      </ResponsiveFilterPanel>
      <ActiveFilters filters={filters} onRemove={handleRemoveFilter} onClearAll={handleReset} />
    </div>
  );
}
