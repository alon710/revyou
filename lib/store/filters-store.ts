import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ReviewFilters } from "@/lib/types";
import type { ReplyStatus } from "@/lib/types/review.types";
import type { ReviewSortOptions } from "@/lib/types/sort.types";

// Serializable version of ReviewFilters (Date objects converted to strings)
interface SerializableReviewFilters {
  replyStatus?: ReplyStatus[];
  rating?: number[];
  dateFrom?: string; // ISO date string
  dateTo?: string; // ISO date string
  sort?: ReviewSortOptions;
}

// Store state structure - keyed by businessId
interface FiltersState {
  businessFilters: Record<string, SerializableReviewFilters>;

  // Set filters for a specific business
  setFilters: (businessId: string, filters: ReviewFilters) => void;

  // Get filters for a specific business (returns ReviewFilters with Date objects)
  getFilters: (businessId: string) => ReviewFilters | null;

  // Clear filters for a specific business
  clearFilters: (businessId: string) => void;

  // Clear all stored filters (for cleanup/reset)
  clearAllFilters: () => void;
}

// Helper to convert ReviewFilters to serializable format
function serializeFilters(filters: ReviewFilters): SerializableReviewFilters {
  return {
    replyStatus: filters.replyStatus,
    rating: filters.rating,
    dateFrom: filters.dateFrom?.toISOString(),
    dateTo: filters.dateTo?.toISOString(),
    sort: filters.sort,
  };
}

// Helper to convert serializable format back to ReviewFilters
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
          // Clear corrupted data
          get().clearFilters(businessId);
          return null;
        }
      },

      clearFilters: (businessId: string) => {
        set((state) => {
          const { [businessId]: removed, ...rest } = state.businessFilters;
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
