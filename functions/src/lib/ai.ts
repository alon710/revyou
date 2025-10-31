import { generateWithGemini } from "./core/gemini-client";
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
    content: review.text,
  });

  const reviewData = {
    rating: review.rating,
    name: review.name,
    text: review.text,
    date: review.date ? review.date.toDate() : new Date(),
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
