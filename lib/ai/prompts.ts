import { LocationConfig, DEFAULT_PROMPT_TEMPLATE } from "@/types/database";
import Mustache from "mustache";
import {
  TONE_LABELS,
  LANGUAGE_LABELS,
} from "@/components/dashboard/location-config/types";

export interface ReviewData {
  rating: number;
  reviewerName: string;
  reviewText: string;
}

export function buildReplyPrompt(
  locationConfig: LocationConfig,
  review: ReviewData,
  businessName: string,
  businessPhone?: string
): string {
  const templateData = {
    BUSINESS_NAME: businessName || "",
    BUSINESS_DESCRIPTION: locationConfig.businessDescription || "",
    BUSINESS_PHONE: businessPhone || locationConfig.businessPhone || "",
    LANGUAGE: LANGUAGE_LABELS[locationConfig.languageMode],
    TONE: TONE_LABELS[locationConfig.toneOfVoice],
    ALLOWED_EMOJIS: locationConfig.allowedEmojis?.join(" ") || "",
    MAX_SENTENCES: locationConfig.maxSentences || 2,
    SIGNATURE: locationConfig.signature || `צוות ${businessName}`,
    CUSTOM_INSTRUCTIONS_1:
      locationConfig.starConfigs?.[1]?.customInstructions || "",
    CUSTOM_INSTRUCTIONS_2:
      locationConfig.starConfigs?.[2]?.customInstructions || "",
    CUSTOM_INSTRUCTIONS_3:
      locationConfig.starConfigs?.[3]?.customInstructions || "",
    CUSTOM_INSTRUCTIONS_4:
      locationConfig.starConfigs?.[4]?.customInstructions || "",
    CUSTOM_INSTRUCTIONS_5:
      locationConfig.starConfigs?.[5]?.customInstructions || "",
    RATING: review.rating,
    REVIEWER_NAME: review.reviewerName || "",
    REVIEW_TEXT: review.reviewText || "(אין טקסט)",
  };

  const template = DEFAULT_PROMPT_TEMPLATE;
  return Mustache.render(template, templateData);
}

export function validatePrompt(prompt: string): boolean {
  if (!prompt || prompt.trim().length === 0) {
    return false;
  }

  if (prompt.length > 30000) {
    console.warn("Prompt is too long");
    return false;
  }

  return true;
}
