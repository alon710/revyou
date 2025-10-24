import { BusinessConfig, ToneOfVoice, LanguageMode } from "@/types/database";

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
  const language = languageLabels[businessConfig.languageMode];

  // Get tone label (Hebrew name)
  const toneLabels: Record<ToneOfVoice, string> = {
    friendly: "ידידותי",
    formal: "פורמלי",
    humorous: "הומוריסטי",
    professional: "מקצועי",
  };
  const tone = toneLabels[businessConfig.toneOfVoice];

  // Get allowed emojis as string
  const allowedEmojis = businessConfig.allowedEmojis?.join(" ") || "";

  // Default values
  const maxSentences = businessConfig.maxSentences || 2;
  const signature = businessConfig.signature || `צוות ${businessName}`;
  const phone = businessPhone || businessConfig.businessPhone || "";

  // Get star-specific custom instructions
  const customInstructions1 =
    businessConfig.starConfigs[1]?.customInstructions || "";
  const customInstructions2 =
    businessConfig.starConfigs[2]?.customInstructions || "";
  const customInstructions3 =
    businessConfig.starConfigs[3]?.customInstructions || "";
  const customInstructions4 =
    businessConfig.starConfigs[4]?.customInstructions || "";
  const customInstructions5 =
    businessConfig.starConfigs[5]?.customInstructions || "";

  // Use the prompt template from business config
  const template = businessConfig.promptTemplate;

  // Replace all variables
  const prompt = template
    .replace(/\{\{BUSINESS_NAME\}\}/g, businessName)
    .replace(
      /\{\{BUSINESS_DESCRIPTION\}\}/g,
      businessConfig.businessDescription
    )
    .replace(/\{\{BUSINESS_PHONE\}\}/g, phone)
    .replace(/\{\{LANGUAGE\}\}/g, language)
    .replace(/\{\{TONE\}\}/g, tone)
    .replace(/\{\{ALLOWED_EMOJIS\}\}/g, allowedEmojis)
    .replace(/\{\{MAX_SENTENCES\}\}/g, maxSentences.toString())
    .replace(/\{\{SIGNATURE\}\}/g, signature)
    .replace(/\{\{CUSTOM_INSTRUCTIONS_1\}\}/g, customInstructions1)
    .replace(/\{\{CUSTOM_INSTRUCTIONS_2\}\}/g, customInstructions2)
    .replace(/\{\{CUSTOM_INSTRUCTIONS_3\}\}/g, customInstructions3)
    .replace(/\{\{CUSTOM_INSTRUCTIONS_4\}\}/g, customInstructions4)
    .replace(/\{\{CUSTOM_INSTRUCTIONS_5\}\}/g, customInstructions5)
    .replace(/\{\{RATING\}\}/g, review.rating.toString())
    .replace(/\{\{REVIEWER_NAME\}\}/g, review.reviewerName)
    .replace(/\{\{REVIEW_TEXT\}\}/g, review.reviewText || "(אין טקסט)");

  return prompt;
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
  return `אתה עוזר לבעל עסק לענות על ביקורת גוגל.

שם העסק: ${businessName}
דירוג: ${rating}/5
שם המבקר: ${reviewerName}
ביקורת: ${reviewText}

צור תגובה קצרה (1-2 משפטים) בעברית שמתחילה בפנייה אישית לשם המבקר (תרגם את השם לעברית באופן פונטי אם נדרש) ומסתיימת בחתימה: "צוות ${businessName}".

הנחיות:
- דירוג 4-5: תודה חמה וכללית
- דירוג 3: בקש פרטים לשיפור
- דירוג 1-2: התנצלות והזמנה ליצור קשר

תגובה:`;
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
