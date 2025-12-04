"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ReviewFilters } from "@/lib/types";
import { parseFiltersFromSearchParams, buildSearchParams } from "@/lib/utils/filter-utils";
import { useFiltersStore } from "@/lib/store/filters-store";
import { ReviewFiltersForm } from "./ReviewFiltersForm";
import { ResponsiveFilterPanel } from "./ResponsiveFilterPanel";
import { ActiveFilters } from "./ActiveFilters";

export function ReviewsFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // Extract businessId from pathname: /[locale]/dashboard/accounts/[accountId]/businesses/[businessId]/reviews
  const businessId = pathname.split("/")[6];

  const { getFilters, setFilters: storeSetFilters, clearFilters } = useFiltersStore();

  // Build URL params object
  const paramsObj: { [key: string]: string | string[] | undefined } = {};
  searchParams.forEach((value, key) => {
    paramsObj[key] = value;
  });

  // Check if URL has any filter params
  const hasUrlParams = Object.keys(paramsObj).some((key) =>
    ["replyStatus", "rating", "dateFrom", "dateTo", "sortBy", "sortDir"].includes(key)
  );

  // Priority: URL > Store > Empty
  let filters: ReviewFilters;
  if (hasUrlParams) {
    filters = parseFiltersFromSearchParams(paramsObj); // Priority 1: URL
  } else {
    const storedFilters = getFilters(businessId);
    filters = storedFilters || {}; // Priority 2: Store, Priority 3: Empty
  }

  const activeCount =
    (filters.replyStatus?.length ?? 0) + (filters.rating?.length ?? 0) + (filters.dateFrom || filters.dateTo ? 1 : 0);

  const handleApply = (newFilters: ReviewFilters) => {
    storeSetFilters(businessId, newFilters); // Save to store
    const params = buildSearchParams(newFilters);
    router.push(`${pathname}?${params.toString()}`);
    setIsOpen(false);
  };

  const handleReset = () => {
    clearFilters(businessId); // Clear from store
    router.push(pathname); // Clear from URL
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
