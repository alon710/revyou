import { DEFAULT_BUSINESS_PROMPT_TEMPLATE } from "./template";
import type { BusinessConfig, Review } from "@/types/database";
import Mustache from "mustache";

export function buildReplyPrompt(
  BusinessConfig: BusinessConfig,
  review: Review,
  businessName: string,
  businessPhone?: string
): string {
  const languageMode = BusinessConfig.languageMode;
  const isAutoDetect = languageMode === "auto-detect";
  const targetLanguage = isAutoDetect ? undefined : languageMode;

  const templateData = {
    BUSINESS_NAME: businessName || "",
    BUSINESS_DESCRIPTION: BusinessConfig.description || "",
    BUSINESS_PHONE: businessPhone || BusinessConfig.phoneNumber || "",
    IS_AUTO_DETECT: isAutoDetect,
    TARGET_LANGUAGE: targetLanguage,
    TONE: BusinessConfig.toneOfVoice,
    ALLOWED_EMOJIS: BusinessConfig.allowedEmojis?.join(" ") || "",
    MAX_SENTENCES: BusinessConfig.maxSentences || 2,
    SIGNATURE: BusinessConfig.signature || `צוות ${businessName}`,
    CUSTOM_INSTRUCTIONS_1:
      BusinessConfig.starConfigs?.[1]?.customInstructions || "",
    CUSTOM_INSTRUCTIONS_2:
      BusinessConfig.starConfigs?.[2]?.customInstructions || "",
    CUSTOM_INSTRUCTIONS_3:
      BusinessConfig.starConfigs?.[3]?.customInstructions || "",
    CUSTOM_INSTRUCTIONS_4:
      BusinessConfig.starConfigs?.[4]?.customInstructions || "",
    CUSTOM_INSTRUCTIONS_5:
      BusinessConfig.starConfigs?.[5]?.customInstructions || "",
    RATING: review.rating,
    REVIEWER_NAME: review.name || "",
    REVIEW_TEXT: review.text || "(אין טקסט)",
  };

  const template = DEFAULT_BUSINESS_PROMPT_TEMPLATE;
  return Mustache.render(template, templateData);
}
