import { LocationConfig, StarConfig } from "@/types/database";

export const TONE_LABELS: Record<string, string> = {
  friendly: "ידידותי",
  formal: "פורמלי",
  humorous: "הומוריסטי",
  professional: "מקצועי",
};

export const LANGUAGE_LABELS: Record<string, string> = {
  hebrew: "עברית",
  english: "אנגלית",
  "auto-detect": "זיהוי אוטומטי",
};

export const AVAILABLE_VARIABLES = [
  { name: "{{LOCATION_NAME}}", description: "שם העסק" },
  { name: "{{LOCATION_DESCRIPTION}}", description: "תיאור העסק" },
  { name: "{{LOCATION_PHONE}}", description: "טלפון העסק" },
  { name: "{{REVIEWER_NAME}}", description: "שם המבקר" },
  { name: "{{RATING}}", description: "דירוג (1-5)" },
  { name: "{{REVIEW_TEXT}}", description: "טקסט הביקורת" },
  { name: "{{TONE}}", description: "טון התגובה" },
  { name: "{{LANGUAGE}}", description: "שפת התגובה" },
  { name: "{{MAX_SENTENCES}}", description: "מספר משפטים מקסימלי" },
  { name: "{{SIGNATURE}}", description: "חתימה" },
  { name: "{{ALLOWED_EMOJIS}}", description: "אימוג'ים מותרים" },
  {
    name: "{{CUSTOM_INSTRUCTIONS_1}}",
    description: "הנחיות מיוחדות לכוכב אחד",
  },
  {
    name: "{{CUSTOM_INSTRUCTIONS_2}}",
    description: "הנחיות מיוחדות לשני כוכבים",
  },
  {
    name: "{{CUSTOM_INSTRUCTIONS_3}}",
    description: "הנחיות מיוחדות לשלושה כוכבים",
  },
  {
    name: "{{CUSTOM_INSTRUCTIONS_4}}",
    description: "הנחיות מיוחדות לארבעה כוכבים",
  },
  {
    name: "{{CUSTOM_INSTRUCTIONS_5}}",
    description: "הנחיות מיוחדות לחמישה כוכבים",
  },
];

export interface SectionBaseProps {
  variant: "display" | "edit";
  loading?: boolean;
}

export type ConfigUpdateCallback = (updates: Partial<LocationConfig>) => void;

export type StarConfigUpdateCallback = (
  rating: 1 | 2 | 3 | 4 | 5,
  field: keyof StarConfig,
  value: string | boolean
) => void;
