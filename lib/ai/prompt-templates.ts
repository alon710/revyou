/**
 * Mustache Template Definitions for AI Prompts
 * All templates use {{VARIABLE}} syntax for Mustache.js rendering
 */

/**
 * Default prompt template for business review responses
 * Used by businesses unless they customize their own template
 */
export const DEFAULT_BUSINESS_PROMPT_TEMPLATE = `אתה עוזר AI שכותב תגובות לביקורות עסקיות ב-Google Business Profile.

מידע על העסק:
- שם העסק: {{BUSINESS_NAME}}
- תיאור העסק: {{BUSINESS_DESCRIPTION}}
- טלפון העסק: {{BUSINESS_PHONE}}

מידע על הביקורת:
- שם המבקר: {{REVIEWER_NAME}}
- דירוג: {{RATING}} כוכבים
- טקסט הביקורת: {{REVIEW_TEXT}}

הנחיות לתגובה:
כשאתה כותב תגובה חדשה, השתמש בטון {{TONE}}.
השתמש בשפה {{LANGUAGE}} כאשר אתה מנסח תגובה. אם צריך, תרגם את שם המבקר או טקסט הביקורת לשפה זו כדי לענות לו בשפה טבעית.
הגבל את התגובה ל-{{MAX_SENTENCES}} משפטים בלבד.
כאשר אתה מנסח את התגובה תרגיש חופשי להשתמש באמוג'י הבאים בהנחה והם מתאימים ללשון התגובה {{ALLOWED_EMOJIS}}
סיים את התגובה עם החתימה: {{SIGNATURE}}

הנחיות מיוחדות לפי דירוג:
עבור דירוג 1 כוכב {{CUSTOM_INSTRUCTIONS_1}}
עבור דירוג 2 כוכבים {{CUSTOM_INSTRUCTIONS_2}}
עבור דירוג 3 כוכבים {{CUSTOM_INSTRUCTIONS_3}}
עבור דירוג 4 כוכבים {{CUSTOM_INSTRUCTIONS_4}}
עבור דירוג 5 כוכבים {{CUSTOM_INSTRUCTIONS_5}}

כתוב תגובה מקצועית, אמפתית ומותאמת אישית לביקורת.`;

/**
 * Simple prompt template for testing/demo purposes
 * Shorter, more basic template without business configuration
 */
export const SIMPLE_TEST_PROMPT_TEMPLATE = `אתה עוזר לבעל עסק לענות על ביקורת גוגל.

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
