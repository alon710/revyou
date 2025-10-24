/**
 * Shared types and constants for business configuration components
 */

import { BusinessConfig, StarConfig } from "@/types/database";

// Tone of Voice labels (Hebrew)
export const TONE_LABELS: Record<string, string> = {
  friendly: "ידידותי",
  formal: "פורמלי",
  humorous: "הומוריסטי",
  professional: "מקצועי",
};

// Language labels (Hebrew)
export const LANGUAGE_LABELS: Record<string, string> = {
  hebrew: "עברית",
  english: "אנגלית",
  "auto-detect": "זיהוי אוטומטי",
  russian: "רוסית",
  arabic: "ערבית",
};

// Available template variables
export const AVAILABLE_VARIABLES = [
  { name: "{{BUSINESS_NAME}}", description: "שם העסק" },
  { name: "{{BUSINESS_DESCRIPTION}}", description: "תיאור העסק" },
  { name: "{{BUSINESS_PHONE}}", description: "טלפון העסק" },
  { name: "{{REVIEWER_NAME}}", description: "שם המבקר" },
  { name: "{{RATING}}", description: "דירוג (1-5)" },
  { name: "{{REVIEW_TEXT}}", description: "טקסט הביקורת" },
  { name: "{{TONE}}", description: "טון התגובה" },
  { name: "{{LANGUAGE_INSTRUCTION}}", description: "הנחיות שפה" },
  { name: "{{MAX_SENTENCES}}", description: "מספר משפטים מקסימלי" },
  { name: "{{SIGNATURE}}", description: "חתימה" },
  { name: "{{EMOJI_INSTRUCTIONS}}", description: "הנחיות אימוג'ים" },
  { name: "{{CUSTOM_INSTRUCTIONS}}", description: "הנחיות ספציפיות לדירוג" },
];

// Common props for section components
export interface SectionBaseProps {
  variant: "display" | "edit";
  loading?: boolean;
}

// Callback type for config updates
export type ConfigUpdateCallback = (updates: Partial<BusinessConfig>) => void;

// Callback type for star config updates
export type StarConfigUpdateCallback = (
  rating: 1 | 2 | 3 | 4 | 5,
  field: keyof StarConfig,
  value: string | boolean
) => void;
