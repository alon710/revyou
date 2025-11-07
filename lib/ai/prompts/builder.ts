import { DEFAULT_BUSINESS_PROMPT_TEMPLATE } from "./template";
import type { BusinessConfig, Review } from "@/lib/types";
import Mustache from "mustache";

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
    REVIEWER_NAME: review.name || "",
    REVIEW_TEXT: review.text || "(אין טקסט)",
  };

  const template = DEFAULT_BUSINESS_PROMPT_TEMPLATE;
  return Mustache.render(template, templateData);
}
