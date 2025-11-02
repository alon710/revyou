import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  Business,
  BusinessConfig,
  ToneOfVoice,
  LanguageMode,
} from "@/types/database";
import { getBusiness } from "@/lib/firebase/business";
import { BusinessConfigSchema } from "@/lib/validation/database";

export function getDefaultBusinessConfig(): BusinessConfig {
  return {
    name: "",
    description: "",
    phoneNumber: "",
    toneOfVoice: "professional" as ToneOfVoice,
    useEmojis: true,
    languageMode: "auto-detect" as LanguageMode,
    maxSentences: 2,
    allowedEmojis: ["✨", "🙏", "❤️"],
    signature: "",
    starConfigs: {
      1: {
        customInstructions:
          "התנצל בכנות, הבע צער והזמן ליצירת קשר טלפוני מיידי. תוסיף את מספר הטלפון של העסק בצורה קריאה.",
        autoReply: false,
      },
      2: {
        customInstructions:
          "התנצל בכנות, הבע צער והזמן ליצירת קשר טלפוני מיידי. תוסיף את מספר הטלפון של העסק בצורה קריאה.",
        autoReply: false,
      },
      3: {
        customInstructions:
          "הבע הערכה על המשוב והראה רצון לשיפור. בקש בקצרה פרטים נוספים.",
        autoReply: false,
      },
      4: {
        customInstructions:
          "הבע תודה חמה וכללית. אסור להתייחס לפרטים ספציפיים מהביקורת.",
        autoReply: false,
      },
      5: {
        customInstructions:
          "הבע תודה חמה וכללית. אסור להתייחס לפרטים ספציפיים מהביקורת.",
        autoReply: false,
      },
    },
  };
}

export async function updateBusinessConfig(
  userId: string,
  businessId: string,
  config: Partial<BusinessConfig>
): Promise<Business> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const business = await getBusiness(userId, businessId);
    if (!business) {
      throw new Error("המיקום לא נמצא");
    }

    const partialSchema = BusinessConfigSchema.partial();
    const validationResult = partialSchema.safeParse(config);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");
      console.error("Config validation failed:", errorMessages);
      throw new Error(`נתונים לא תקינים: ${errorMessages}`);
    }

    const updatedConfig = { ...business.config, ...validationResult.data };

    const businessRef = doc(db, "users", userId, "businesses", businessId);
    await updateDoc(businessRef, { config: updatedConfig });

    return (await getBusiness(userId, businessId)) as Business;
  } catch (error) {
    console.error("Error updating business config:", error);
    throw new Error("לא ניתן לעדכן את הגדרות המיקום");
  }
}
