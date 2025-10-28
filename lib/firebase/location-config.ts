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
    locationDescription: "",
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
