import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { generateWithGemini } from "@/lib/ai/core/gemini-client";
import { buildReplyPrompt } from "@/lib/ai/prompts/builder";
import { postReplyToGoogle } from "@/lib/google/reviews";
import { decryptToken } from "@/lib/google/business-profile";
import { renderReviewNotificationEmail } from "@/lib/email/render";
import { ReviewsRepository } from "@/lib/db/repositories/reviews.repository";
import { BusinessesRepository } from "@/lib/db/repositories/businesses.repository";
import { AccountsRepository } from "@/lib/db/repositories/accounts.repository";
import { UsersConfigsRepository } from "@/lib/db/repositories/users-configs.repository";
import { SubscriptionsController } from "@/lib/controllers/subscriptions.controller";
import type { ReplyStatus, StarConfig } from "@/lib/types";
import type { Locale } from "@/i18n/config";
import { clientEnv, serverEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface ProcessReviewRequest {
  userId: string;
  accountId: string;
  businessId: string;
  reviewId: string;
}

export async function POST(request: NextRequest) {
  try {
    const isTestMode = serverEnv.NODE_ENV === "test";

    if (!isTestMode) {
      const internalSecret = request.headers.get("X-Internal-Secret");

      if (!internalSecret) {
        console.error("Unauthorized internal API call: X-Internal-Secret header missing");
        return NextResponse.json({ error: "Unauthorized: Missing authentication header" }, { status: 401 });
      }

      if (internalSecret !== serverEnv.INTERNAL_API_SECRET) {
        console.error("Forbidden internal API call: X-Internal-Secret header invalid");
        return NextResponse.json({ error: "Forbidden: Invalid authentication credentials" }, { status: 403 });
      }
    }

    const body = (await request.json()) as ProcessReviewRequest;
    const { userId, accountId, businessId, reviewId } = body;

    console.log("Processing review", {
      userId,
      accountId,
      businessId,
      reviewId,
    });

    const reviewsRepo = new ReviewsRepository(userId, accountId, businessId);
    const businessesRepo = new BusinessesRepository(userId, accountId);
    const accountsRepo = new AccountsRepository(userId);

    const review = await reviewsRepo.get(reviewId);
    if (!review) {
      console.error("Review not found", { reviewId });
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const business = await businessesRepo.get(businessId);
    if (!business) {
      console.error("Business not found", { businessId });
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const subscriptionsController = new SubscriptionsController();
    const quotaCheck = await subscriptionsController.checkReviewQuota(userId);

    if (!quotaCheck.allowed) {
      console.log("User has exceeded review quota", {
        userId,
        reviewId,
        currentCount: quotaCheck.currentCount,
        limit: quotaCheck.limit,
      });

      await reviewsRepo.update(reviewId, {
        replyStatus: "quota_exceeded" as ReplyStatus,
        aiReplyGeneratedAt: new Date(),
      });

      console.log("Review saved without AI reply due to quota limit", { reviewId });
      return NextResponse.json(
        {
          message: "Review saved but quota exceeded",
          quotaExceeded: true,
        },
        { status: 200 }
      );
    }

    console.log("Quota check passed", {
      userId,
      reviewId,
      currentCount: quotaCheck.currentCount,
      limit: quotaCheck.limit,
    });

    const starConfig: StarConfig = business.starConfigs[review.rating as 1 | 2 | 3 | 4 | 5];

    console.log("Generating AI reply", { reviewId });
    let aiReply: string;
    try {
      const prompt = buildReplyPrompt(business, review);

      aiReply = await generateWithGemini(serverEnv.GEMINI_API_KEY, prompt);

      await reviewsRepo.update(reviewId, {
        aiReply,
        aiReplyGeneratedAt: new Date(),
      });

      console.log("AI reply generated successfully", { reviewId });
    } catch (error) {
      console.error("Failed to generate AI reply", { error });
      await reviewsRepo.update(reviewId, {
        replyStatus: "failed" as ReplyStatus,
        aiReplyGeneratedAt: new Date(),
      });
      return NextResponse.json(
        {
          error: "Failed to generate AI reply",
        },
        { status: 500 }
      );
    }

    let replyStatus: ReplyStatus = "pending";

    if (starConfig.autoReply) {
      const account = await accountsRepo.get(accountId);
      const encryptedToken = account?.googleRefreshToken;

      if (!encryptedToken) {
        console.error("Cannot auto-post: no refresh token available");
        await reviewsRepo.update(reviewId, {
          replyStatus: "failed" as ReplyStatus,
        });
        replyStatus = "failed";
      } else {
        try {
          const reviewName = review.googleReviewName;
          if (!reviewName) {
            throw new Error("Google review name not found - review may not be from Google My Business");
          }

          const decryptedToken = await decryptToken(encryptedToken);

          await postReplyToGoogle(
            reviewName,
            aiReply,
            decryptedToken,
            serverEnv.GOOGLE_CLIENT_ID,
            serverEnv.GOOGLE_CLIENT_SECRET
          );

          await reviewsRepo.update(reviewId, {
            replyStatus: "posted" as ReplyStatus,
            postedReply: aiReply,
            postedAt: new Date(),
            postedBy: "system",
          });

          console.log("AI reply auto-posted to Google", { reviewId });
          replyStatus = "posted";
        } catch (error) {
          console.error("Failed to post reply to Google:", {
            reviewId,
            error,
          });

          await reviewsRepo.update(reviewId, {
            replyStatus: "failed" as ReplyStatus,
          });

          replyStatus = "failed";
        }
      }
    } else {
      await reviewsRepo.update(reviewId, {
        replyStatus: "pending" as ReplyStatus,
      });
      console.log("AI reply awaiting approval", { reviewId });
    }

    const usersConfigsRepo = new UsersConfigsRepository();
    const userConfig = await usersConfigsRepo.getOrCreate(userId);

    if (userConfig.configs.EMAIL_ON_NEW_REVIEW) {
      try {
        console.log("Sending email notification", { reviewId, replyStatus });

        const supabase = await createClient();
        const { data: userData } = await supabase.auth.admin.getUserById(userId);

        if (!userData.user) {
          console.error("User not found in Supabase Auth", { userId });
        } else {
          const recipientEmail = userData.user.email;
          const recipientName = userData.user.user_metadata?.display_name || userData.user.email;

          if (!recipientEmail) {
            console.error("User email not found", { userId });
          } else {
            const locale = (userConfig.configs.LOCALE || "en") as Locale;

            const status = replyStatus === "pending" ? "pending" : "posted";

            const { subject, html } = await renderReviewNotificationEmail(
              {
                recipientName: recipientName || recipientEmail,
                businessName: business.name,
                accountId,
                businessId: business.id,
                reviewerName: review.name,
                rating: review.rating,
                reviewText: review.text || "",
                aiReply,
                status,
                appBaseUrl: clientEnv.NEXT_PUBLIC_APP_URL,
                reviewId,
              },
              locale
            );

            const resend = new Resend(serverEnv.RESEND_API_KEY);
            await resend.emails.send({
              from: serverEnv.RESEND_FROM_EMAIL,
              to: recipientEmail,
              subject,
              html,
            });

            console.log("Email sent successfully", { reviewId, replyStatus, locale });
          }
        }
      } catch (error) {
        console.error("Failed to send email notification", { reviewId, error });
      }
    }

    console.log("Review processed successfully", { reviewId, replyStatus });

    return NextResponse.json(
      {
        message: "Review processed successfully",
        reviewId,
        replyStatus,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing review", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
