import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { BackButton } from "@/components/ui/back-button";
import { getTranslations } from "next-intl/server";
import { getBusiness } from "@/lib/actions/businesses.actions";
import { getReview } from "@/lib/actions/reviews.actions";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { ReviewCardWrapper } from "./ReviewCardWrapper";

export const dynamic = "force-dynamic";

interface ReviewPageProps {
  params: Promise<{ accountId: string; businessId: string; reviewId: string }>;
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { accountId, businessId, reviewId } = await params;
  const { userId } = await getAuthenticatedUserId();
  const t = await getTranslations("dashboard.reviewDetail");
  const tCommon = await getTranslations("common");

  const [business, review] = await Promise.all([
    getBusiness(userId, accountId, businessId),
    getReview(userId, accountId, businessId, reviewId),
  ]);

  return (
    <PageContainer>
      <div className="mb-6">
        <BackButton label={tCommon("back")} />
      </div>
      <PageHeader title={t("reviewFrom", { reviewerName: review.name })} description={business.name} />

      <div className="mt-6">
        <ReviewCardWrapper review={review} accountId={accountId} businessId={businessId} userId={userId} />
      </div>
    </PageContainer>
  );
}
