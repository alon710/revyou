import {
  LocationConfig,
  DEFAULT_LOCATION_PROMPT_TEMPLATE,
} from "@/types/database";
import Mustache from "mustache";
import { TONE_LABELS } from "@/components/dashboard/location-config/types";

interface ReviewData {
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
  const languageMode = locationConfig.languageMode;
  const isAutoDetect = languageMode === "auto-detect";
  const targetLanguage = isAutoDetect ? undefined : languageMode;

  const templateData = {
    LOCATION_NAME: businessName || "",
    LOCATION_DESCRIPTION: locationConfig.businessDescription || "",
    LOCATION_PHONE: businessPhone || locationConfig.businessPhone || "",
    IS_AUTO_DETECT: isAutoDetect,
    TARGET_LANGUAGE: targetLanguage,
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

  const template = DEFAULT_LOCATION_PROMPT_TEMPLATE;
  return Mustache.render(template, templateData);
}
