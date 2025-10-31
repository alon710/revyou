import * as admin from "firebase-admin";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret, defineString } from "firebase-functions/params";
import { render } from "@react-email/render";
import { generateAIReply } from "../lib/ai";
import { ReviewNotificationEmail } from "../email-templates/review-notification";
import type { Review, Location, User, StarConfig } from "../shared/types/database";

const db = admin.firestore();

const geminiApiKey = defineSecret("GEMINI_API_KEY");
const appBaseUrl = defineString("APP_BASE_URL");
const fromEmail = defineString("FROM_EMAIL");

type ReplyStatus = "pending" | "posted" | "failed";

async function getLocation(
  userId: string,
  locationId: string
): Promise<Location | null> {
  const locationDoc = await db
    .collection("users")
    .doc(userId)
    .collection("locations")
    .doc(locationId)
    .get();

  if (!locationDoc.exists) {
    console.error("Location not found", { locationId });
    return null;
  }

  return locationDoc.data() as Location;
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
  config: any,
  apiKey: string
): Promise<string | null> {
  try {
    console.log("Generating AI reply", { reviewId: eventData.id });
    const aiReply = await generateAIReply(review, config, apiKey);

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

function shouldSendEmail(location: Location): boolean {
  const enabled = !!location.emailOnNewReview;
  console.log("Email notification setting checked", {
    locationId: location.id,
    emailEnabled: enabled,
  });
  return enabled;
}

async function sendEmailNotification(
  location: Location,
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
        businessName: location.name,
        reviewerName: review.name,
        rating: review.rating,
        reviewText: review.text || "",
        aiReply,
        status,
        appBaseUrl,
        reviewId,
      })
    );

    const subject = `ביקורת חדשה התקבלה: ${review.rating} כוכבים - ${location.name}`;

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
    document: "users/{userId}/locations/{locationId}/reviews/{reviewId}",
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

    const { userId, locationId, reviewId } = event.params;
    console.log("Processing new review", { userId, locationId, reviewId });

    try {
      const review = eventData.data() as Review;
      const location = await getLocation(userId, locationId);
      if (!location) return;

      const starConfig: StarConfig =
        location.config.starConfigs[review.rating as 1 | 2 | 3 | 4 | 5];

      const aiReply = await handleAIReply(
        eventData,
        review,
        location.config,
        geminiApiKey.value()
      );

      if (!aiReply) return;

      const replyStatus = await updateReplyStatus(
        eventData,
        aiReply,
        starConfig.autoReply
      );

      const user = await getUser(userId);

      if (!user) return;

      if (shouldSendEmail(location)) {
        await sendEmailNotification(
          location,
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
        locationId,
        reviewId,
      });
      throw error;
    }
  }
);
