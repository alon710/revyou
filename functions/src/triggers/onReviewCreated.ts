import * as functions from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildReplyPrompt } from "@/lib/ai/prompts";
import type { LocationConfig } from "@/types/database";

const db = admin.firestore();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Firestore trigger: Generate AI reply when new review is created
 */
export const onReviewCreated = functions.onDocumentCreated(
  "users/{userId}/locations/{businessId}/reviews/{reviewId}",
  async (event) => {
    try {
      const reviewData = event.data?.data();
      const reviewId = event.params.reviewId;
      const businessId = event.params.businessId;
      const userId = event.params.userId;

      if (!reviewData) {
        logger.warn("No review data");
        return;
      }

      logger.info(
        `Processing new review: ${reviewId} for location ${businessId} user ${userId}`
      );

      const businessDoc = await db
        .collection("users")
        .doc(userId)
        .collection("locations")
        .doc(businessId)
        .get();

      if (!businessDoc.exists) {
        logger.error(`Business ${businessId} not found for user ${userId}`);
        return;
      }

      const location = businessDoc.data();
      const config = location?.config as LocationConfig;

      if (!config) {
        logger.error("Business config not found");
        return;
      }

      const starConfig = config.starConfigs?.[reviewData.rating as 1 | 2 | 3 | 4 | 5];
      if (!starConfig || !starConfig.autoReply) {
        logger.info(`Auto-reply disabled for ${reviewData.rating} stars`);
        await db
          .collection("users")
          .doc(userId)
          .collection("locations")
          .doc(businessId)
          .collection("reviews")
          .doc(reviewId)
          .update({
            replyStatus: "skipped",
          });
        return;
      }

      const prompt = buildReplyPrompt(
        config,
        {
          rating: reviewData.rating,
          reviewerName: reviewData.reviewerName,
          reviewText: reviewData.reviewText,
        },
        location?.name || "",
        config.businessPhone
      );

      logger.info("Generated prompt for Gemini");

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const generationConfig = {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 500,
      };

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
      });

      const aiReply = result.response.text().trim();

      logger.info(`Generated AI reply: ${aiReply}`);

      const replyStatus = "approved" as const;
      logger.info(
        `Auto-reply enabled for ${reviewData.rating} stars, marking as approved`
      );

      await db
        .collection("users")
        .doc(userId)
        .collection("locations")
        .doc(businessId)
        .collection("reviews")
        .doc(reviewId)
        .update({
          aiReply,
          aiReplyGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
          replyStatus,
        });

      logger.info(`Updated review ${reviewId} with AI reply`);
    } catch (error) {
      logger.error("Error generating AI reply:", error);

      try {
        await db
          .collection("users")
          .doc(event.params.userId)
          .collection("locations")
          .doc(event.params.businessId)
          .collection("reviews")
          .doc(event.params.reviewId)
          .update({
            replyStatus: "failed",
          });
      } catch (updateError) {
        logger.error("Error updating review status to failed:", updateError);
      }
    }
  }
);
