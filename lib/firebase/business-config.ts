import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  Business,
  BusinessConfig,
  ToneOfVoice,
  LanguageMode,
} from "@/types/database";
import { getBusiness } from "@/lib/firebase/businesses";

export function getDefaultBusinessConfig(): BusinessConfig {
  return {
    businessDescription: "",
    toneOfVoice: "professional" as ToneOfVoice,
    useEmojis: false,
    languageMode: "hebrew" as LanguageMode,
    starConfigs: {
      1: { customInstructions: "", autoReply: true },
      2: { customInstructions: "", autoReply: true },
      3: { customInstructions: "", autoReply: true },
      4: { customInstructions: "", autoReply: true },
      5: { customInstructions: "", autoReply: true },
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
      throw new Error("העסק לא נמצא");
    }

    const updatedConfig = { ...business.config, ...config };

    const businessRef = doc(db, "users", userId, "businesses", businessId);
    await updateDoc(businessRef, { config: updatedConfig });

    return (await getBusiness(userId, businessId)) as Business;
  } catch (error) {
    console.error("Error updating business config:", error);
    throw new Error("לא ניתן לעדכן את הגדרות העסק");
  }
}
