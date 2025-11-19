import { DEFAULT_BUSINESS_PROMPT_TEMPLATE } from "./template";
import type { Business, Review } from "@/lib/types";
import Mustache from "mustache";

function getStarCustomInstructions(star: 1 | 2 | 3 | 4 | 5, business: Business): string {
  return business.starConfigs?.[star]?.customInstructions || "";
}

export function buildReplyPrompt(business: Business, review: Review): string {
  const languageMode = business.languageMode;
  const isAutoDetect = languageMode === "auto-detect";
  const targetLanguage = isAutoDetect ? undefined : languageMode;

  const templateData = {
    BUSINESS_NAME: business.name || "",
    BUSINESS_DESCRIPTION: business.description || "",
    BUSINESS_PHONE: business.phoneNumber || "",
    IS_AUTO_DETECT: isAutoDetect,
    TARGET_LANGUAGE: targetLanguage,
    TONE: business.toneOfVoice,
    ALLOWED_EMOJIS: business.allowedEmojis?.join(" ") || "",
    MAX_SENTENCES: business.maxSentences || 2,
    SIGNATURE: business.signature || "",
    CUSTOM_INSTRUCTIONS_1: getStarCustomInstructions(1, business),
    CUSTOM_INSTRUCTIONS_2: getStarCustomInstructions(2, business),
    CUSTOM_INSTRUCTIONS_3: getStarCustomInstructions(3, business),
    CUSTOM_INSTRUCTIONS_4: getStarCustomInstructions(4, business),
    CUSTOM_INSTRUCTIONS_5: getStarCustomInstructions(5, business),
    RATING: review.rating,
    REVIEWER_NAME: review.name || "",
    REVIEW_TEXT: review.text || "(no text)",
  };

  const template = DEFAULT_BUSINESS_PROMPT_TEMPLATE;
  return Mustache.render(template, templateData);
}
