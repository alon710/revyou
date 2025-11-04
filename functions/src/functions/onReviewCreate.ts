import * as admin from "firebase-admin";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret, defineString } from "firebase-functions/params";
import { render } from "@react-email/render";
import { generateWithGemini } from "../shared/ai/core/gemini-client";
import { buildReplyPrompt } from "../shared/ai/prompts/builder";
import { ReviewNotificationEmail } from "../email-templates/review-notification";
import type {
  Review,
  BusinessConfig,
  Business,
  User,
  StarConfig,
  ReplyStatus,
} from "../shared/types/database";

const db = admin.firestore();

const geminiApiKey = defineSecret("GEMINI_API_KEY");
const appBaseUrl = defineString("APP_BASE_URL");
const fromEmail = defineString("FROM_EMAIL");

async function getBusiness(
  userId: string,
  accountId: string,
  businessId: string
): Promise<Business | null> {
  const businessDoc = await db
    .collection("users")
    .doc(userId)
    .collection("accounts")
    .doc(accountId)
    .collection("businesses")
    .doc(businessId)
    .get();

  if (!businessDoc.exists) {
    console.error("Business not found", { accountId, businessId });
    return null;
  }

  return businessDoc.data() as Business;
}

async function getUser(userId: string): Promise<User | null> {
  const userDoc = await db.collection("users").doc(userId).get();

  if (!userDoc.exists) {
    console.error("User not found", { userId });
    return null;
  }

  return userDoc.data() as User;
}

async function handleAIReply(
  eventData: FirebaseFirestore.DocumentSnapshot,
  review: Review,
  config: BusinessConfig,
  apiKey: string,
  businessName: string,
  phoneNumber?: string
): Promise<string | null> {
  try {
    console.log("Generating AI reply", { reviewId: eventData.id });

    const prompt = buildReplyPrompt(config, review, businessName, phoneNumber);

    const aiReply = await generateWithGemini(apiKey, prompt);

    await eventData.ref.update({
      aiReply,
      aiReplyGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return aiReply;
  } catch (error) {
    console.error("Failed to generate AI reply", { error });
    await eventData.ref.update({
      replyStatus: "failed" as ReplyStatus,
      aiReplyGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return null;
  }
}

async function updateReplyStatus(
  eventData: FirebaseFirestore.DocumentSnapshot,
  aiReply: string,
  shouldAutoPost: boolean
): Promise<ReplyStatus> {
  const timestamp = admin.firestore.FieldValue.serverTimestamp();

  if (shouldAutoPost) {
    await eventData.ref.update({
      aiReply,
      aiReplyGeneratedAt: timestamp,
      replyStatus: "posted" as ReplyStatus,
      postedReply: aiReply,
      postedAt: timestamp,
      postedBy: "system",
    });

    console.log("AI reply auto-posted", { reviewId: eventData.id });
    return "posted";
  }

  await eventData.ref.update({
    aiReply,
    aiReplyGeneratedAt: timestamp,
    replyStatus: "pending" as ReplyStatus,
  });

  console.log("AI reply awaiting approval", { reviewId: eventData.id });
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
    secrets: [geminiApiKey],
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
        eventData,
        review,
        business.config,
        geminiApiKey.value(),
        business.name,
        business.config.phoneNumber
      );

      if (!aiReply) return;

      const replyStatus = await updateReplyStatus(
        eventData,
        aiReply,
        starConfig.autoReply
      );

      const user = await getUser(userId);

      if (!user) return;

      if (shouldSendEmail(business)) {
        await sendEmailNotification(
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
