import { BusinessConfig, DEFAULT_PROMPT_TEMPLATE } from "@/types/database";
import Mustache from "mustache";
import {
  TONE_LABELS,
  LANGUAGE_LABELS,
} from "@/components/dashboard/business-config/types";

export interface ReviewData {
  rating: number;
  reviewerName: string;
  reviewText: string;
}

export function buildReplyPrompt(
  businessConfig: BusinessConfig,
  review: ReviewData,
  businessName: string,
  businessPhone?: string
): string {
  const templateData = {
    BUSINESS_NAME: businessName || "",
    BUSINESS_DESCRIPTION: businessConfig.businessDescription || "",
    BUSINESS_PHONE: businessPhone || businessConfig.businessPhone || "",
    LANGUAGE: LANGUAGE_LABELS[businessConfig.languageMode],
    TONE: TONE_LABELS[businessConfig.toneOfVoice],
    ALLOWED_EMOJIS: businessConfig.allowedEmojis?.join(" ") || "",
    MAX_SENTENCES: businessConfig.maxSentences || 2,
    SIGNATURE: businessConfig.signature || `צוות ${businessName}`,
    CUSTOM_INSTRUCTIONS_1:
      businessConfig.starConfigs?.[1]?.customInstructions || "",
    CUSTOM_INSTRUCTIONS_2:
      businessConfig.starConfigs?.[2]?.customInstructions || "",
    CUSTOM_INSTRUCTIONS_3:
      businessConfig.starConfigs?.[3]?.customInstructions || "",
    CUSTOM_INSTRUCTIONS_4:
      businessConfig.starConfigs?.[4]?.customInstructions || "",
    CUSTOM_INSTRUCTIONS_5:
      businessConfig.starConfigs?.[5]?.customInstructions || "",
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
