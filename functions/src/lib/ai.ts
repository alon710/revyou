import { generateWithGemini } from "./core";
import { buildReplyPrompt } from "./prompts";
import type { Review, LocationConfig } from "../types";

export async function generateAIReply(
  review: Review,
  config: LocationConfig,
  geminiApiKey: string
): Promise<string> {
  if (!geminiApiKey) {
    throw new Error("Gemini API key is required");
  }

  console.log(`Generating AI reply`, {
    reviewId: review.id,
    rating: review.rating,
    content: review.reviewText,
  });

  const reviewData = {
    rating: review.rating,
    reviewerName: review.reviewerName,
    reviewText: review.reviewText,
    reviewDate: review.reviewDate ? review.reviewDate.toDate() : new Date(),
  };

  const prompt = buildReplyPrompt(
    config,
    reviewData,
    config.locationName ?? "",
    config.locationPhone
  );

  const reply = await generateWithGemini(geminiApiKey, prompt);

  return reply;
}
