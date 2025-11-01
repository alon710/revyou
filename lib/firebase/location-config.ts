import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  Location,
  LocationConfig,
  ToneOfVoice,
  LanguageMode,
} from "@/types/database";
import { getLocation } from "@/lib/firebase/locations";
import { locationConfigSchema } from "@/lib/validation/database";

export function getDefaultLocationConfig(): LocationConfig {
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

export async function updateLocationConfig(
  userId: string,
  locationId: string,
  config: Partial<LocationConfig>
): Promise<Location> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const location = await getLocation(userId, locationId);
    if (!location) {
      throw new Error("המיקום לא נמצא");
    }

    const partialSchema = locationConfigSchema.partial();
    const validationResult = partialSchema.safeParse(config);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");
      console.error("Config validation failed:", errorMessages);
      throw new Error(`נתונים לא תקינים: ${errorMessages}`);
    }

    const updatedConfig = { ...location.config, ...validationResult.data };

    const locationRef = doc(db, "users", userId, "locations", locationId);
    await updateDoc(locationRef, { config: updatedConfig });

    return (await getLocation(userId, locationId)) as Location;
  } catch (error) {
    console.error("Error updating location config:", error);
    throw new Error("לא ניתן לעדכן את הגדרות המיקום");
  }
}
