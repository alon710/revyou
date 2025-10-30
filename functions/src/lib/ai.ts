import { generateWithGemini, buildReplyPrompt } from "./ai/core";
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
    reviewDate: review.reviewDate,
  };

  const configData = {
    locationName: config.locationName,
    locationDescription: config.locationDescription,
    locationPhone: config.locationPhone,
    toneOfVoice: config.toneOfVoice,
    languageMode: config.languageMode,
    maxSentences: config.maxSentences,
    allowedEmojis: config.allowedEmojis,
    signature: config.signature,
    starConfigs: config.starConfigs,
  };

  const prompt = buildReplyPrompt(reviewData, configData);

  const reply = await generateWithGemini(geminiApiKey, prompt, {
    modelName: "gemini-2.5-flash",
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 500,
  });

  console.log("AI reply generated successfully");
  return reply;
}
