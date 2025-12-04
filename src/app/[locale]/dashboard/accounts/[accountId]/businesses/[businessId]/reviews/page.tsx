import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { BackButton } from "@/components/ui/back-button";
import { EmptyState } from "@/components/ui/empty-state";
import { getTranslations } from "next-intl/server";
import { getBusiness } from "@/lib/actions/businesses.actions";
import { getReviews } from "@/lib/actions/reviews.actions";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { ReviewsList } from "@/components/dashboard/reviews/ReviewsList";
import { ReviewsFilterBar } from "@/components/dashboard/reviews/filters/ReviewsFilterBar";
import { parseFiltersFromSearchParams } from "@/lib/utils/filter-utils";

export const dynamic = "force-dynamic";

interface BusinessReviewsPageProps {
  params: Promise<{ locale: string; accountId: string; businessId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BusinessReviewsPage({ params, searchParams }: BusinessReviewsPageProps) {
  const { locale, accountId, businessId } = await params;
  const resolvedSearchParams = await searchParams;
  const filters = parseFiltersFromSearchParams(resolvedSearchParams);
  const { userId } = await getAuthenticatedUserId();
  const t = await getTranslations({ locale, namespace: "dashboard.reviews" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const [business, reviews] = await Promise.all([
    getBusiness(userId, accountId, businessId),
    getReviews({
      accountId,
      businessId,
      filters: {
        ...filters,
        limit: 10,
      },
    }),
  ]);

  return (
    <PageContainer>
      <div className="mb-6">
        <BackButton label={tCommon("back")} />
      </div>

      <PageHeader title={t("reviewsFor", { businessName: business.name })} description={t("allReviews")} />

      <div className="space-y-4 mt-6">
        <ReviewsFilterBar />
        {reviews.length === 0 ? (
          <EmptyState title={t("noReviews")} description={t("noReviewsDescription")} />
        ) : (
          <ReviewsList reviews={reviews} accountId={accountId} businessId={businessId} userId={userId} />
        )}
      </div>
    </PageContainer>
  );
}
