import { BusinessConfig, DEFAULT_PROMPT_TEMPLATE } from "@/types/database";
import Mustache from "mustache";
import {
  TONE_LABELS,
  LANGUAGE_LABELS,
} from "@/components/dashboard/business-config/types";
import { SIMPLE_TEST_PROMPT_TEMPLATE } from "./prompt-templates";

/**
 * Prompt Template Builder
 * Builds context-aware prompts for Gemini AI based on business configuration
 */

export interface ReviewData {
  rating: number; // 1-5
  reviewerName: string;
  reviewText: string;
}

/**
 * Build complete prompt from template and data
 * @param businessConfig - Business configuration
 * @param review - Review data
 * @param businessName - Business name
 * @returns Complete prompt string
 */
export function buildReplyPrompt(
  businessConfig: BusinessConfig,
  review: ReviewData,
  businessName: string,
  businessPhone?: string
): string {
  // Build template data object
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

  // Always use the default prompt template
  const template = DEFAULT_PROMPT_TEMPLATE;

  // Render template with Mustache
  return Mustache.render(template, templateData);
}

/**
 * Build simple prompt for testing
 * @param businessName - Business name
 * @param reviewerName - Reviewer name
 * @param rating - Star rating
 * @param reviewText - Review text
 * @returns Simple prompt
 */
export function buildSimplePrompt(
  businessName: string,
  reviewerName: string,
  rating: number,
  reviewText: string
): string {
  return Mustache.render(SIMPLE_TEST_PROMPT_TEMPLATE, {
    businessName,
    reviewerName,
    rating,
    reviewText,
  });
}

/**
 * Validate prompt before sending
 * @param prompt - Prompt to validate
 * @returns True if valid
 */
export function validatePrompt(prompt: string): boolean {
  if (!prompt || prompt.trim().length === 0) {
    return false;
  }

  // Check minimum length
  if (prompt.length < 50) {
    console.warn("Prompt is too short");
    return false;
  }

  // Check maximum length (Gemini has token limits)
  if (prompt.length > 30000) {
    console.warn("Prompt is too long");
    return false;
  }

  return true;
}
