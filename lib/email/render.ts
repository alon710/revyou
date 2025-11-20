import { getTranslations } from "next-intl/server";
import { ReviewNotificationEmail, type ReviewNotificationEmailProps } from "./ReviewNotificationEmail";
import type { Locale } from "@/i18n/config";

interface ReviewNotificationData {
  recipientName: string;
  businessName: string;
  accountId: string;
  businessId: string;
  reviewerName: string;
  rating: number;
  reviewText: string;
  aiReply: string;
  status: "pending" | "posted";
  appBaseUrl: string;
  reviewId: string;
}

interface RenderReviewNotificationEmailResult {
  subject: string;
  html: string;
}

export async function renderReviewNotificationEmail(
  data: ReviewNotificationData,
  locale: Locale
): Promise<RenderReviewNotificationEmailResult> {
  const t = await getTranslations({ locale, namespace: "emails.reviewNotification" });

  const reviewPageUrl = `${data.appBaseUrl}/${locale}/dashboard/accounts/${data.accountId}/businesses/${data.businessId}/reviews/${data.reviewId}`;

  const emailProps: ReviewNotificationEmailProps = {
    title: t("title"),
    greeting: t("greeting", { name: data.recipientName }),
    body: t("body", { businessName: data.businessName }),
    businessName: data.businessName,
    noReviewText: t("noReviewText"),
    aiReplyHeader: t("aiReplyHeader"),
    statusText: data.status === "pending" ? t("statusPending") : t("statusPosted"),
    viewReviewButton: t("viewReviewButton"),
    footer: t("footer"),

    reviewerName: data.reviewerName,
    rating: data.rating,
    reviewText: data.reviewText,
    aiReply: data.aiReply,
    status: data.status,
    reviewPageUrl,

    locale,
  };

  const html = ReviewNotificationEmail(emailProps);

  const subject = t("subject", { rating: data.rating, businessName: data.businessName });

  return {
    subject,
    html,
  };
}
