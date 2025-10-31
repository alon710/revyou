import Mustache from "mustache";
import { DEFAULT_LOCATION_PROMPT_TEMPLATE } from "./prompt-templates";
import type { LocationConfig } from "../types";

interface ReviewData {
  rating: number;
  name: string;
  text?: string;
  date?: Date;
}

export function buildReplyPrompt(
  locationConfig: LocationConfig,
  review: ReviewData,
  locationName: string,
  locationPhone?: string
): string {
  const languageMode = locationConfig.languageMode;
  const isAutoDetect = languageMode === "auto-detect";
  const targetLanguage = isAutoDetect ? undefined : languageMode;

  const templateData = {
    LOCATION_NAME: locationName || "",
    LOCATION_DESCRIPTION: locationConfig.locationDescription || "",
    LOCATION_PHONE: locationPhone || locationConfig.locationPhone || "",
    IS_AUTO_DETECT: isAutoDetect,
    TARGET_LANGUAGE: targetLanguage,
    TONE: locationConfig.toneOfVoice,
    ALLOWED_EMOJIS: locationConfig.allowedEmojis?.join(" ") || "",
    MAX_SENTENCES: locationConfig.maxSentences || 2,
    SIGNATURE: locationConfig.signature || `צוות ${locationName}`,
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
    REVIEWER_NAME: review.name || "",
    REVIEW_TEXT: review.text || "(אין טקסט)",
  };

  const template = DEFAULT_LOCATION_PROMPT_TEMPLATE;
  return Mustache.render(template, templateData);
}
