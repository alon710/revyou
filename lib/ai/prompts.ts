import {
  BusinessConfig,
  ToneOfVoice,
  LanguageMode,
  DEFAULT_PROMPT_TEMPLATE,
} from "@/types/database";
import Mustache from "mustache";

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
  // Get language label (Hebrew or English name)
  const languageLabels: Record<LanguageMode, string> = {
    hebrew: "עברית",
    english: "אנגלית",
    "auto-detect": "זיהוי אוטומטי",
    "match-reviewer": "התאמה למבקר",
  };

  // Get tone label (Hebrew name)
  const toneLabels: Record<ToneOfVoice, string> = {
    friendly: "ידידותי",
    formal: "פורמלי",
    humorous: "הומוריסטי",
    professional: "מקצועי",
  };

  // Build template data object
  const templateData = {
    BUSINESS_NAME: businessName || "",
    BUSINESS_DESCRIPTION: businessConfig.businessDescription || "",
    BUSINESS_PHONE: businessPhone || businessConfig.businessPhone || "",
    LANGUAGE: languageLabels[businessConfig.languageMode],
    TONE: toneLabels[businessConfig.toneOfVoice],
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

  // Use the prompt template from business config, fallback to default
  const template = businessConfig.promptTemplate || DEFAULT_PROMPT_TEMPLATE;

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
  const template = `אתה עוזר לבעל עסק לענות על ביקורת גוגל.

שם העסק: {{businessName}}
דירוג: {{rating}}/5
שם המבקר: {{reviewerName}}
ביקורת: {{reviewText}}

צור תגובה קצרה (1-2 משפטים) בעברית שמתחילה בפנייה אישית לשם המבקר (תרגם את השם לעברית באופן פונטי אם נדרש) ומסתיימת בחתימה: "צוות {{businessName}}".

הנחיות:
- דירוג 4-5: תודה חמה וכללית
- דירוג 3: בקש פרטים לשיפור
- דירוג 1-2: התנצלות והזמנה ליצור קשר

תגובה:`;

  return Mustache.render(template, {
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
