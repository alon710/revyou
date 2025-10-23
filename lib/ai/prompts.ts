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
 * Get language instruction based on mode
 */
function getLanguageInstruction(languageMode: LanguageMode): string {
  const instructions: Record<LanguageMode, string> = {
    hebrew: "עברית בלבד. אין לשלב שפות אחרות בתשובה.",
    english: "English only. Do not mix other languages in the response.",
    "auto-detect": "זהה אוטומטית את שפת הביקורת והשב באותה שפה.",
    "match-reviewer": "התאם את שפת התגובה לשפה שבה כתב המבקר.",
  };
  return instructions[languageMode];
}

/**
 * Default prompt template
 * Uses {{VARIABLE}} syntax for replacement
 */
const DEFAULT_TEMPLATE = `אתה מודל AI שתפקידו לענות על ביקורות גוגל של {{BUSINESS_NAME}}.

הוראות כלליות (חייבים):
1. שפה: {{LANGUAGE_INSTRUCTION}}
2. אורך: תמיד קצר ותמציתי — **משפט אחד או שניים בלבד**. יעד אידיאלי: משפט אחד ברור. אין לחרוג מ־{{MAX_SENTENCES}} משפטים.
3. פתיחה אישית: כל תגובה **חייבת** להתחיל בפנייה אישית לשם המשתמש.
   - תרגם את שם המבקר לשפת התגובה באופן פונטי/מקובל (לדוגמא: John→ג'ון, Sarah→שרה בעברית)
   - התחלה דוגמה: \`תודה רבה, [שם]!\` — כל תגובה חייבת להתחיל בפנייה כזו.
4. טון: {{TONE_DESCRIPTION}}. השתמש תמיד בגוף ראשון רבים ("אנחנו", "אצלנו").
5. אימוג'ים: {{EMOJI_INSTRUCTIONS}}{{ALLOWED_EMOJIS_LIST}}
6. חתימה: כל תגובה צריכה להסתיים בחתימה: \`{{SIGNATURE}}\`
7. כללי שימוש בתוכן הביקורת:
   - דירוג 5־4 (חיובי): הבע תודה חמה וכללית בלבד. **אסור** להתייחס לפרטים ספציפיים מתוך הביקורת.
   - דירוג 3 (ניטרלי): הבע הערכה על המשוב, הראה רצון לשיפור ובקש בקצרה פרטים לשיפור.
   - דירוג 1־2 (שלילי): התנצלות כנה, הבע צער, והזמן ליצירת קשר טלפוני מיידי — **חובה לציין טלפון**: {{BUSINESS_PHONE}}.
8. סטייל: משפטים קצרים וברורים. הכתיבה חייבת להיות מגוונת — הימנע מחזרתיות מילולית.
9. מטרה: לשמור על תדמית חמה, מקצועית ונגישה.

על העסק:
{{BUSINESS_DESCRIPTION}}

{{STAR_INSTRUCTIONS}}

הביקורת לתשובה:
דירוג: {{STAR_RATING}}/5
שם המבקר: {{REVIEWER_NAME}}
טקסט הביקורת: {{REVIEW_TEXT}}

צור תגובה לפי ההוראות. התגובה חייבת להיות:
- קצרה ({{MAX_SENTENCES}} משפטים בלבד)
- להתחיל בפנייה לשם המבקר (מתורגם לשפת התגובה)
- טון: {{TONE_DESCRIPTION}}
- להסתיים ב: {{SIGNATURE}}

חשוב: אין צורך לכלול שם מלא בתגובה - שם פרטי זה מספיק. שים לב למספר המשפטים ולדקדוק (לדוגמא: "שמחנו לשמוע שהייתה לכם חוויה נהדרת" ולא "שמחנו לשמוע שהיה לכם חוויה נהדרת").`;

/**
 * Get tone description
 * @param tone - Tone of voice
 * @returns Description in Hebrew
 */
function getToneDescription(tone: ToneOfVoice): string {
  const toneMap: Record<ToneOfVoice, string> = {
    friendly: "חם, ידידותי ומכיל",
    formal: "רשמי, מקצועי ומנומס",
    professional: "מקצועי, ישיר ואמין",
    humorous: "קליל, עם הומור עדין וחיוכים",
  };
  return toneMap[tone];
}

/**
 * Get emoji instructions based on config
 * @param useEmojis - Whether to use emojis
 * @param allowedEmojis - List of allowed emojis
 * @returns Instruction string
 */
function getEmojiInstructions(
  useEmojis: boolean,
  allowedEmojis?: string[]
): string {
  if (!useEmojis) {
    return "אסור להשתמש באימוג'ים.";
  }

  let instruction =
    "מותרים אך מושתתים על הטון. השתמש רק אם הם מוסיפים חום או נימוס.";

  if (allowedEmojis && allowedEmojis.length > 0) {
    instruction += ` רשימת אימוג'ים מותרת (מועדפים): ${allowedEmojis.join(" ")}`;
  }

  return instruction;
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
  // Get star-specific instructions
  const starConfig =
    businessConfig.starConfigs[review.rating as 1 | 2 | 3 | 4 | 5];
  const starInstructions = starConfig?.customInstructions
    ? `הנחיות נוספות לדירוג ${review.rating}:\n${starConfig.customInstructions}`
    : "";

  // Build emoji instructions
  const emojiInstructions = getEmojiInstructions(
    businessConfig.useEmojis,
    businessConfig.allowedEmojis
  );

  const allowedEmojisList = businessConfig.allowedEmojis?.length
    ? ` רשימה מותרת: ${businessConfig.allowedEmojis.join(" ")}`
    : "";

  // Get tone description
  const toneDescription = getToneDescription(businessConfig.toneOfVoice);

  // Get language instruction
  const languageInstruction = getLanguageInstruction(
    businessConfig.languageMode
  );

  // Default values
  const maxSentences = businessConfig.maxSentences || 2;
  const signature = businessConfig.signature || `צוות ${businessName}`;
  const phone = businessPhone || businessConfig.businessPhone || "";

  // Use custom template if provided, otherwise use default
  const template = businessConfig.promptTemplate || DEFAULT_TEMPLATE;

  // Replace all variables
  const prompt = template
    .replace(/\{\{BUSINESS_NAME\}\}/g, businessName)
    .replace(
      /\{\{BUSINESS_DESCRIPTION\}\}/g,
      businessConfig.businessDescription
    )
    .replace(/\{\{BUSINESS_PHONE\}\}/g, phone)
    .replace(/\{\{LANGUAGE_INSTRUCTION\}\}/g, languageInstruction)
    .replace(/\{\{TONE_DESCRIPTION\}\}/g, toneDescription)
    .replace(/\{\{EMOJI_INSTRUCTIONS\}\}/g, emojiInstructions)
    .replace(/\{\{ALLOWED_EMOJIS_LIST\}\}/g, allowedEmojisList)
    .replace(/\{\{MAX_SENTENCES\}\}/g, maxSentences.toString())
    .replace(/\{\{STAR_RATING\}\}/g, review.rating.toString())
    .replace(/\{\{STAR_INSTRUCTIONS\}\}/g, starInstructions)
    .replace(/\{\{REVIEWER_NAME\}\}/g, review.reviewerName)
    .replace(/\{\{REVIEW_TEXT\}\}/g, review.reviewText || "(אין טקסט)")
    .replace(/\{\{SIGNATURE\}\}/g, signature);

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
