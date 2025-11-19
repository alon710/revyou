import type { ToneOfVoice, LanguageMode } from "@/lib/types";

export function getDefaultBusinessConfig() {
  return {
    toneOfVoice: "professional" as ToneOfVoice,
    languageMode: "auto-detect" as LanguageMode,
    maxSentences: 2,
    allowedEmojis: ["✨", "🙏", "❤️"],
    signature: "",
    starConfigs: {
      1: {
        customInstructions:
          "התנצל בכנות, הבע צער והזמן ליצירת קשר טלפוני מיידי. תוסיף את מספר הטלפון של העסק בצורה קריאה.",
        autoReply: true,
      },
      2: {
        customInstructions:
          "התנצל בכנות, הבע צער והזמן ליצירת קשר טלפוני מיידי. תוסיף את מספר הטלפון של העסק בצורה קריאה.",
        autoReply: true,
      },
      3: {
        customInstructions: "הבע הערכה על המשוב והראה רצון לשיפור. בקש בקצרה פרטים נוספים.",
        autoReply: true,
      },
      4: {
        customInstructions: "הבע תודה חמה וכללית. אסור להתייחס לפרטים ספציפיים מהביקורת.",
        autoReply: true,
      },
      5: {
        customInstructions: "הבע תודה חמה וכללית. אסור להתייחס לפרטים ספציפיים מהביקורת.",
        autoReply: true,
      },
    },
  };
}
