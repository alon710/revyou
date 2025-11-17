"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Business, Review } from "@/lib/types";
import { ReviewCard } from "@/components/dashboard/reviews/ReviewCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { BackButton } from "@/components/ui/back-button";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { getBusiness } from "@/lib/actions/businesses.actions";
import { getReviews } from "@/lib/actions/reviews.actions";

interface BusinessReviewsPageProps {
  params: Promise<{ accountId: string; businessId: string }>;
}

export default function BusinessReviewsPage({ params }: BusinessReviewsPageProps) {
  const { accountId, businessId } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations("dashboard.reviews");
  const tCommon = useTranslations("common");
  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user || !businessId || !accountId) return;

    try {
      setLoading(true);
      setError(null);

      const [biz, fetchedReviews] = await Promise.all([
        getBusiness(user.id, accountId, businessId),
        getReviews(user.id, accountId, businessId, { sort: { orderBy: "receivedAt", orderDirection: "desc" } }),
      ]);

      setBusiness(biz);
      setReviews(fetchedReviews);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("errorLoading");
      console.error("Error loading data:", err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, businessId, accountId, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user || loading) {
    return (
      <PageContainer>
        <Loading fullScreen text={t("loadingReviews")} />
      </PageContainer>
    );
  }

  if (error || !business) {
    return (
      <PageContainer>
        <div className="mb-6">
          <BackButton label={tCommon("back")} />
        </div>
        <PageHeader title={t("title")} description={t("description")} />
        <EmptyState
          title={t("errorLoading")}
          description={error || t("businessNotFound")}
          buttonText={t("backToBusinesses")}
          buttonLink={`/dashboard/accounts/${accountId}/businesses`}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <BackButton label={tCommon("back")} />
      </div>

      <PageHeader title={t("reviewsFor", { businessName: business.name })} description={t("allReviews")} />

      <div className="space-y-4 mt-6">
        {reviews.length === 0 ? (
          <EmptyState
            title={t("noReviews")}
            description={t("noReviewsDescription")}
            buttonText={t("backToBusinesses")}
            buttonLink={`/dashboard/accounts/${accountId}/businesses`}
          />
        ) : (
          reviews.map((review) => (
            <div key={review.id}>
              <ReviewCard
                review={review}
                accountId={accountId}
                businessId={businessId}
                userId={user.id}
                onUpdate={fetchData}
                onClick={() =>
                  router.push(`/dashboard/accounts/${accountId}/businesses/${businessId}/reviews/${review.id}`)
                }
              />
            </div>
          ))
        )}
      </div>
    </PageContainer>
  );
}
