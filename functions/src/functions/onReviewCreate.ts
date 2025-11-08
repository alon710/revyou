import * as admin from "firebase-admin";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret, defineString } from "firebase-functions/params";
import { render } from "@react-email/render";
import { generateWithGemini } from "../shared/ai/core/gemini-client";
import { buildReplyPrompt } from "../shared/ai/prompts/builder";
import { ReviewNotificationEmail } from "../email-templates/review-notification";
import { postReplyToGoogle } from "../shared/google/reviews";
import { decryptToken } from "../shared/google/business-profile";
import type {
  Review,
  BusinessConfig,
  Business,
  User,
  StarConfig,
  ReplyStatus,
} from "../shared/types";
import { BusinessesRepositoryAdmin } from "../shared/repositories/businesses.repository.admin";
import { UsersRepositoryAdmin } from "../shared/repositories/users.repository.admin";
import { AccountsRepositoryAdmin } from "../shared/repositories/accounts.repository.admin";
import { ReviewsRepositoryAdmin } from "../shared/repositories/reviews.repository.admin";

const db = admin.firestore();

const geminiApiKey = defineSecret("GEMINI_API_KEY");
const tokenEncryptionSecret = defineSecret("TOKEN_ENCRYPTION_SECRET");
const googleClientId = defineSecret("GOOGLE_CLIENT_ID");
const googleClientSecret = defineSecret("GOOGLE_CLIENT_SECRET");
const appBaseUrl = defineString("APP_BASE_URL");
const fromEmail = defineString("FROM_EMAIL");

async function getBusiness(
  userId: string,
  accountId: string,
  businessId: string
): Promise<Business | null> {
  const businessesRepo = new BusinessesRepositoryAdmin(userId, accountId);
  const business = await businessesRepo.get(businessId);

  if (!business) {
    console.error("Business not found", { accountId, businessId });
  }

  return business;
}

async function getUser(userId: string): Promise<User | null> {
  const usersRepo = new UsersRepositoryAdmin();
  const user = await usersRepo.get(userId);

  if (!user) {
    console.error("User not found", { userId });
  }

  return user;
}

async function getAccountRefreshToken(
  userId: string,
  accountId: string
): Promise<string | null> {
  try {
    const accountsRepo = new AccountsRepositoryAdmin(userId);
    const account = await accountsRepo.get(accountId);

    if (!account) {
      console.error("Account not found", { userId, accountId });
      return null;
    }

    return account.googleRefreshToken || null;
  } catch (error) {
    console.error("Error fetching account refresh token:", error);
    return null;
  }
}

async function handleAIReply(
  userId: string,
  accountId: string,
  businessId: string,
  reviewId: string,
  review: Review,
  config: BusinessConfig,
  apiKey: string,
  businessName: string,
  phoneNumber?: string
): Promise<string | null> {
  try {
    console.log("Generating AI reply", { reviewId });

    const prompt = buildReplyPrompt(config, review, businessName, phoneNumber);

    const aiReply = await generateWithGemini(apiKey, prompt);

    const reviewsRepo = new ReviewsRepositoryAdmin(
      userId,
      accountId,
      businessId
    );
    await reviewsRepo.update(reviewId, {
      aiReply,
      aiReplyGeneratedAt: admin.firestore.FieldValue.serverTimestamp() as any,
    });

    return aiReply;
  } catch (error) {
    console.error("Failed to generate AI reply", { error });
    const reviewsRepo = new ReviewsRepositoryAdmin(
      userId,
      accountId,
      businessId
    );
    await reviewsRepo.update(reviewId, {
      replyStatus: "failed" as ReplyStatus,
      aiReplyGeneratedAt: admin.firestore.FieldValue.serverTimestamp() as any,
    });
    return null;
  }
}

async function updateReplyStatus(
  userId: string,
  accountId: string,
  businessId: string,
  reviewId: string,
  review: Review,
  aiReply: string,
  shouldAutoPost: boolean,
  refreshToken: string | null
): Promise<ReplyStatus> {
  const reviewsRepo = new ReviewsRepositoryAdmin(userId, accountId, businessId);
  const timestamp = admin.firestore.FieldValue.serverTimestamp();

  if (shouldAutoPost) {
    if (!refreshToken) {
      console.error("Cannot auto-post: no refresh token available");
      await reviewsRepo.update(reviewId, {
        aiReply,
        aiReplyGeneratedAt: timestamp as any,
        replyStatus: "failed" as ReplyStatus,
      });
      return "failed";
    }

    try {
      const reviewName = review.googleReviewName;
      if (!reviewName) {
        throw new Error(
          "Google review name not found - review may not be from Google My Business"
        );
      }

      const decryptedToken = await decryptToken(
        refreshToken,
        tokenEncryptionSecret.value()
      );

      await postReplyToGoogle(
        reviewName,
        aiReply,
        decryptedToken,
        googleClientId.value(),
        googleClientSecret.value()
      );

      await reviewsRepo.update(reviewId, {
        aiReply,
        aiReplyGeneratedAt: timestamp as any,
        replyStatus: "posted" as ReplyStatus,
        postedReply: aiReply,
        postedAt: timestamp as any,
        postedBy: "system",
      });

      console.log("AI reply auto-posted to Google", { reviewId });
      return "posted";
    } catch (error) {
      console.error("Failed to post reply to Google:", {
        reviewId,
        error,
      });

      await reviewsRepo.update(reviewId, {
        aiReply,
        aiReplyGeneratedAt: timestamp as any,
        replyStatus: "failed" as ReplyStatus,
      });

      return "failed";
    }
  }

  await reviewsRepo.update(reviewId, {
    aiReply,
    aiReplyGeneratedAt: timestamp as any,
    replyStatus: "pending" as ReplyStatus,
  });

  console.log("AI reply awaiting approval", { reviewId });
  return "pending";
}

function shouldSendEmail(business: Business): boolean {
  const enabled = !!business.emailOnNewReview;
  console.log("Email notification setting checked", {
    businessId: business.id,
    emailEnabled: enabled,
  });
  return enabled;
}

async function sendEmailNotification(
  accountId: string,
  business: Business,
  review: Review,
  user: User,
  aiReply: string,
  replyStatus: ReplyStatus,
  reviewId: string,
  appBaseUrl: string,
  fromEmailVal: string
) {
  console.log("Sending email notification", { reviewId, replyStatus });

  try {
    const recipientEmail = user.email;
    const recipientName = user.displayName || user.email;
    const status = replyStatus === "pending" ? "pending" : "posted";

    const emailHtml = render(
      ReviewNotificationEmail({
        recipientName,
        businessName: business.name,
        accountId,
        businessId: business.id,
        reviewerName: review.name,
        rating: review.rating,
        reviewText: review.text || "",
        aiReply,
        status,
        appBaseUrl,
        reviewId,
      })
    );

    const subject = `ביקורת חדשה התקבלה: ${review.rating} כוכבים - ${business.name}`;

    await db.collection("emails").add({
      to: recipientEmail,
      from: fromEmailVal,
      message: {
        subject,
        html: emailHtml,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("Email queued for sending", { reviewId, replyStatus });
  } catch (error) {
    console.error("Failed to queue email notification", { reviewId, error });
  }
}

export const onReviewCreate = onDocumentCreated(
  {
    document:
      "users/{userId}/accounts/{accountId}/businesses/{businessId}/reviews/{reviewId}",
    secrets: [
      geminiApiKey,
      tokenEncryptionSecret,
      googleClientId,
      googleClientSecret,
    ],
    timeoutSeconds: 300,
    minInstances: 0,
    maxInstances: 3,
  },
  async (event) => {
    const eventData = event.data;

    if (!eventData) {
      console.log("No data associated with event");
      return;
    }

    const { userId, accountId, businessId, reviewId } = event.params;
    console.log("Processing new review", {
      userId,
      accountId,
      businessId,
      reviewId,
    });

    try {
      const review = eventData.data() as Review;
      const business = await getBusiness(userId, accountId, businessId);
      if (!business) return;

      const starConfig: StarConfig =
        business.config.starConfigs[review.rating as 1 | 2 | 3 | 4 | 5];

      const aiReply = await handleAIReply(
        userId,
        accountId,
        businessId,
        reviewId,
        review,
        business.config,
        geminiApiKey.value(),
        business.name,
        business.config.phoneNumber
      );

      if (!aiReply) return;

      let refreshToken: string | null = null;
      if (starConfig.autoReply) {
        const encryptedToken = await getAccountRefreshToken(userId, accountId);
        refreshToken = encryptedToken;
      }

      const replyStatus = await updateReplyStatus(
        userId,
        accountId,
        businessId,
        reviewId,
        review,
        aiReply,
        starConfig.autoReply,
        refreshToken
      );

      const user = await getUser(userId);

      if (!user) return;

      if (shouldSendEmail(business)) {
        await sendEmailNotification(
          accountId,
          business,
          review,
          user,
          aiReply,
          replyStatus,
          reviewId,
          appBaseUrl.value(),
          fromEmail.value()
        );
      }

      console.log("Review processed successfully", { reviewId, replyStatus });
    } catch (error) {
      console.error("Error processing review", {
        error,
        userId,
        businessId,
        reviewId,
      });
      throw error;
    }
  }
);
