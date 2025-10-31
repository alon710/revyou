import { generateWithGemini } from "../shared/ai/core/gemini-client";
import { buildReplyPrompt } from "../shared/ai/prompts/builder";
import type { Review, LocationConfig } from "../shared/types/database";

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
    rating: review.rating as 1 | 2 | 3 | 4 | 5,
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
