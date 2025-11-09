import { DEFAULT_BUSINESS_PROMPT_TEMPLATE } from "./template";
import type { BusinessConfig, Review } from "@/lib/types";
import Mustache from "mustache";

function getStarCustomInstructions(star: 1 | 2 | 3 | 4 | 5, businessConfig: BusinessConfig): string {
  return businessConfig.starConfigs?.[star]?.customInstructions || "";
}

export function buildReplyPrompt(
  businessConfig: BusinessConfig,
  review: Review,
  businessName: string,
  businessPhone?: string
): string {
  const languageMode = businessConfig.languageMode;
  const isAutoDetect = languageMode === "auto-detect";
  const targetLanguage = isAutoDetect ? undefined : languageMode;

  const templateData = {
    BUSINESS_NAME: businessName || "",
    BUSINESS_DESCRIPTION: businessConfig.description || "",
    BUSINESS_PHONE: businessPhone || businessConfig.phoneNumber || "",
    IS_AUTO_DETECT: isAutoDetect,
    TARGET_LANGUAGE: targetLanguage,
    TONE: businessConfig.toneOfVoice,
    ALLOWED_EMOJIS: businessConfig.allowedEmojis?.join(" ") || "",
    MAX_SENTENCES: businessConfig.maxSentences || 2,
    SIGNATURE: businessConfig.signature || "",
    CUSTOM_INSTRUCTIONS_1: getStarCustomInstructions(1, businessConfig),
    CUSTOM_INSTRUCTIONS_2: getStarCustomInstructions(2, businessConfig),
    CUSTOM_INSTRUCTIONS_3: getStarCustomInstructions(3, businessConfig),
    CUSTOM_INSTRUCTIONS_4: getStarCustomInstructions(4, businessConfig),
    CUSTOM_INSTRUCTIONS_5: getStarCustomInstructions(5, businessConfig),
    RATING: review.rating,
    REVIEWER_NAME: review.name || "",
    REVIEW_TEXT: review.text || "(no text)",
  };

  const template = DEFAULT_BUSINESS_PROMPT_TEMPLATE;
  return Mustache.render(template, templateData);
}
