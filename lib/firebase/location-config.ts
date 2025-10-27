import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  Location,
  LocationConfig,
  ToneOfVoice,
  LanguageMode,
} from "@/types/database";
import { getLocation } from "@/lib/firebase/locations";

export function getDefaultLocationConfig(): LocationConfig {
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

    const updatedConfig = { ...location.config, ...config };

    const locationRef = doc(db, "users", userId, "locations", locationId);
    await updateDoc(locationRef, { config: updatedConfig });

    return (await getLocation(userId, locationId)) as Location;
  } catch (error) {
    console.error("Error updating location config:", error);
    throw new Error("לא ניתן לעדכן את הגדרות המיקום");
  }
}
