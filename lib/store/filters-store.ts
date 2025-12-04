import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ReviewFilters } from "@/lib/types";
import type { ReplyStatus } from "@/lib/types/review.types";
import type { ReviewSortOptions } from "@/lib/types/sort.types";

interface SerializableReviewFilters {
  replyStatus?: ReplyStatus[];
  rating?: number[];
  dateFrom?: string;
  dateTo?: string;
  sort?: ReviewSortOptions;
}

interface FiltersState {
  businessFilters: Record<string, SerializableReviewFilters>;

  setFilters: (businessId: string, filters: ReviewFilters) => void;

  getFilters: (businessId: string) => ReviewFilters | null;

  clearFilters: (businessId: string) => void;

  clearAllFilters: () => void;
}

function serializeFilters(filters: ReviewFilters): SerializableReviewFilters {
  return {
    replyStatus: filters.replyStatus,
    rating: filters.rating,
    dateFrom: filters.dateFrom?.toISOString(),
    dateTo: filters.dateTo?.toISOString(),
    sort: filters.sort,
  };
}

function deserializeFilters(serialized: SerializableReviewFilters): ReviewFilters {
  return {
    replyStatus: serialized.replyStatus,
    rating: serialized.rating,
    dateFrom: serialized.dateFrom ? new Date(serialized.dateFrom) : undefined,
    dateTo: serialized.dateTo ? new Date(serialized.dateTo) : undefined,
    sort: serialized.sort,
  };
}

export const useFiltersStore = create<FiltersState>()(
  persist(
    (set, get) => ({
      businessFilters: {},

      setFilters: (businessId: string, filters: ReviewFilters) => {
        const serialized = serializeFilters(filters);
        set((state) => ({
          businessFilters: {
            ...state.businessFilters,
            [businessId]: serialized,
          },
        }));
      },

      getFilters: (businessId: string) => {
        const serialized = get().businessFilters[businessId];
        if (!serialized) return null;

        try {
          return deserializeFilters(serialized);
        } catch (error) {
          console.warn(`Failed to deserialize filters for business ${businessId}`, error);
          get().clearFilters(businessId);
          return null;
        }
      },

      clearFilters: (businessId: string) => {
        set((state) => {
          const { [businessId]: _removed, ...rest } = state.businessFilters;
          return { businessFilters: rest };
        });
      },

      clearAllFilters: () => {
        set({ businessFilters: {} });
      },
    }),
    {
      name: "bottie-filters-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
