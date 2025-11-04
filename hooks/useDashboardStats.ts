import { useMemo } from "react";
import { useReviews } from "./useReviews";
import { ReplyStatus } from "@/types/database";

export interface StatusDistribution {
  status: string;
  count: number;
  label: string;
}

export interface StarDistribution {
  stars: number;
  count: number;
  label: string;
}

export interface DashboardStats {
  totalReviews: number;
  averageRating: number;
  statusDistribution: StatusDistribution[];
  starDistribution: StarDistribution[];
}

interface UseDashboardStatsReturn {
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const STATUS_LABELS: Record<ReplyStatus, string> = {
  pending: "ממתין",
  posted: "פורסם",
  rejected: "נדחה",
  failed: "נכשל",
};

const STAR_LABELS: Record<number, string> = {
  1: "★",
  2: "★★",
  3: "★★★",
  4: "★★★★",
  5: "★★★★★",
};

export function useDashboardStats(): UseDashboardStatsReturn {
  const { reviews, loading, error, refetch } = useReviews();

  const stats = useMemo<DashboardStats>(() => {
    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        statusDistribution: [],
        starDistribution: [],
      };
    }

    const statusCounts: Record<string, number> = {
      pending: 0,
      posted: 0,
      rejected: 0,
      failed: 0,
    };

    const starCounts: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    let totalRating = 0;

    reviews.forEach((review) => {
      if (review.replyStatus in statusCounts) {
        statusCounts[review.replyStatus]++;
      }

      const rating = Math.round(review.rating);
      if (rating >= 1 && rating <= 5) {
        starCounts[rating]++;
        totalRating += review.rating;
      }
    });

    const statusDistribution: StatusDistribution[] = Object.entries(
      statusCounts
    ).map(([status, count]) => ({
      status,
      count,
      label: STATUS_LABELS[status as ReplyStatus] || status,
    }));

    const starDistribution: StarDistribution[] = Object.entries(starCounts).map(
      ([stars, count]) => ({
        stars: Number(stars),
        count,
        label: STAR_LABELS[Number(stars)],
      })
    );

    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    return {
      totalReviews: reviews.length,
      averageRating,
      statusDistribution,
      starDistribution,
    };
  }, [reviews]);

  return {
    stats,
    loading,
    error,
    refetch,
  };
}
