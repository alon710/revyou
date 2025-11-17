import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { generateWithGemini } from "@/lib/ai/core/gemini-client";
import { buildReplyPrompt } from "@/lib/ai/prompts/builder";
import { postReplyToGoogle } from "@/lib/google/reviews";
import { decryptToken } from "@/lib/google/business-profile";
import { generateReviewNotificationEmail } from "@/lib/email/review-notification";
import { ReviewsRepository } from "@/lib/db/repositories/reviews.repository";
import { BusinessesRepository } from "@/lib/db/repositories/businesses.repository";
import { AccountsRepository } from "@/lib/db/repositories/accounts.repository";
import { SubscriptionsController } from "@/lib/controllers/subscriptions.controller";
import type { ReplyStatus, StarConfig } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // Max duration for serverless function

interface ProcessReviewRequest {
  userId: string;
  accountId: string;
  businessId: string;
  reviewId: string;
}

/**
 * Internal API route for processing reviews
 *
 * This endpoint is called after a review is created in the database.
 * It handles:
 * 1. Quota checking
 * 2. AI reply generation
 * 3. Auto-posting to Google (if enabled)
 * 4. Email notifications (if enabled)
 *
 * This is an internal endpoint and should not be publicly accessible.
 * It requires an INTERNAL_API_SECRET header for authentication.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify internal authentication
    const internalSecret = request.headers.get("X-Internal-Secret");
    const expectedSecret = process.env.INTERNAL_API_SECRET || "change-me-in-production";

    if (internalSecret !== expectedSecret) {
      console.error("Unauthorized internal API call");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as ProcessReviewRequest;
    const { userId, accountId, businessId, reviewId } = body;

    console.log("Processing review", {
      userId,
      accountId,
      businessId,
      reviewId,
    });

    // Get repositories
    const reviewsRepo = new ReviewsRepository(userId, accountId, businessId);
    const businessesRepo = new BusinessesRepository(userId, accountId);
    const accountsRepo = new AccountsRepository(userId);

    // Get review
    const review = await reviewsRepo.get(reviewId);
    if (!review) {
      console.error("Review not found", { reviewId });
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Get business with config
    const business = await businessesRepo.get(businessId);
    if (!business) {
      console.error("Business not found", { businessId });
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Check review quota
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

    // Get star-specific configuration
    const starConfig: StarConfig = business.config.starConfigs[review.rating as 1 | 2 | 3 | 4 | 5];

    // Generate AI reply
    console.log("Generating AI reply", { reviewId });
    let aiReply: string;
    try {
      const prompt = buildReplyPrompt(business.config, review, business.name, business.config.phoneNumber);

      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error("GEMINI_API_KEY not configured");
      }

      aiReply = await generateWithGemini(geminiApiKey, prompt);

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

    // Handle auto-posting if enabled
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
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
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

    // Send email notification if enabled
    if (business.emailOnNewReview) {
      try {
        console.log("Sending email notification", { reviewId, replyStatus });

        // Get user info from Supabase Auth
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
            const status = replyStatus === "pending" ? "pending" : "posted";

            const emailHtml = generateReviewNotificationEmail({
              recipientName: recipientName || recipientEmail,
              businessName: business.name,
              accountId,
              businessId: business.id,
              reviewerName: review.name,
              rating: review.rating,
              reviewText: review.text || "",
              aiReply,
              status,
              appBaseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
              reviewId,
            });

            const subject = `ביקורת חדשה התקבלה: ${review.rating} כוכבים - ${business.name}`;

            // Send email using Resend
            const resendApiKey = process.env.RESEND_API_KEY;
            const fromEmail = process.env.RESEND_FROM_EMAIL || "Bottie <noreply@bottie.ai>";

            if (!resendApiKey) {
              console.error("RESEND_API_KEY not configured");
            } else {
              const resend = new Resend(resendApiKey);
              await resend.emails.send({
                from: fromEmail,
                to: recipientEmail,
                subject,
                html: emailHtml,
              });

              console.log("Email sent successfully", { reviewId, replyStatus });
            }
          }
        }
      } catch (error) {
        console.error("Failed to send email notification", { reviewId, error });
        // Don't fail the request if email sending fails
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
