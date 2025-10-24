import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import {
  Business,
  BusinessConfig,
  ToneOfVoice,
  LanguageMode,
} from "@/types/database";
import { SUBSCRIPTION_LIMITS, DEFAULT_PROMPT_TEMPLATE } from "@/types/database";
import {
  businessSchema,
  businessCreateSchema,
  businessUpdateSchema,
  BusinessCreateInput,
  BusinessUpdateInput,
} from "@/lib/validation/database";
import { getUserSubscriptionTier } from "./users";

/**
 * Business Database Operations
 * All CRUD operations for the businesses collection
 */

/**
 * Get all businesses for a user
 * @param userId - User ID
 * @returns Array of businesses
 */
export async function getUserBusinesses(userId: string): Promise<Business[]> {
  if (!db) {
    console.error("Firestore not initialized");
    return [];
  }

  try {
    const businessesRef = collection(db, "businesses");
    const q = query(
      businessesRef,
      where("userId", "==", userId),
      orderBy("connectedAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const businesses: Business[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Validate and add
      try {
        const validated = businessSchema.parse({ id: doc.id, ...data });
        businesses.push(validated as Business);
      } catch (error) {
        console.error("Invalid business data:", doc.id, error);
      }
    });

    return businesses;
  } catch (error) {
    console.error("Error fetching businesses:", error);
    throw new Error("לא ניתן לטעון את העסקים");
  }
}

/**
 * Get a single business by ID
 * @param businessId - Business ID
 * @returns Business data or null if not found
 */
export async function getBusiness(
  businessId: string
): Promise<Business | null> {
  if (!db) {
    console.error("Firestore not initialized");
    return null;
  }

  try {
    const businessRef = doc(db, "businesses", businessId);
    const businessSnap = await getDoc(businessRef);

    if (businessSnap.exists()) {
      const data = businessSnap.data();
      const validated = businessSchema.parse({ id: businessSnap.id, ...data });
      return validated as Business;
    }

    return null;
  } catch (error) {
    console.error("Error fetching business:", error);
    throw new Error("לא ניתן לטעון את פרטי העסק");
  }
}

/**
 * Get default business configuration
 * @returns Default BusinessConfig
 */
export function getDefaultBusinessConfig(): BusinessConfig {
  return {
    businessDescription: "",
    toneOfVoice: "professional" as ToneOfVoice,
    useEmojis: false,
    languageMode: "hebrew" as LanguageMode,
    promptTemplate: DEFAULT_PROMPT_TEMPLATE,
    starConfigs: {
      1: { customInstructions: "", autoReply: true },
      2: { customInstructions: "", autoReply: true },
      3: { customInstructions: "", autoReply: true },
      4: { customInstructions: "", autoReply: true },
      5: { customInstructions: "", autoReply: true },
    },
  };
}

/**
 * Create a new business
 * @param data - Business data (without id)
 * @returns Created business with ID
 */
export async function createBusiness(
  data: Omit<BusinessCreateInput, "config" | "connectedAt" | "connected"> & {
    config?: Partial<BusinessConfig>;
  }
): Promise<Business> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    // Check business limit before creating
    const canCreate = await checkBusinessLimit(data.userId);
    if (!canCreate) {
      throw new Error("הגעת למגבלת העסקים עבור חבילת המינוי שלך");
    }

    // Merge with default config
    const defaultConfig = getDefaultBusinessConfig();
    const businessConfig = { ...defaultConfig, ...data.config };

    const businessData = {
      ...data,
      config: businessConfig,
      connected: true,
      connectedAt: serverTimestamp(),
    };

    // Validate before creating
    businessCreateSchema.parse(businessData);

    const businessesRef = collection(db, "businesses");
    const docRef = await addDoc(businessesRef, businessData);

    // Return the created business
    return (await getBusiness(docRef.id)) as Business;
  } catch (error) {
    console.error("Error creating business:", error);
    if (error instanceof Error && error.message.includes("מגבלת")) {
      throw error;
    }
    throw new Error("לא ניתן ליצור עסק חדש");
  }
}

/**
 * Update business configuration
 * @param businessId - Business ID
 * @param config - Partial business config to update
 * @returns Updated business
 */
export async function updateBusinessConfig(
  businessId: string,
  config: Partial<BusinessConfig>
): Promise<Business> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const business = await getBusiness(businessId);
    if (!business) {
      throw new Error("העסק לא נמצא");
    }

    // Merge with existing config
    const updatedConfig = { ...business.config, ...config };

    const businessRef = doc(db, "businesses", businessId);
    await updateDoc(businessRef, { config: updatedConfig });

    // Return the updated business
    return (await getBusiness(businessId)) as Business;
  } catch (error) {
    console.error("Error updating business config:", error);
    throw new Error("לא ניתן לעדכן את הגדרות העסק");
  }
}

/**
 * Update business data
 * @param businessId - Business ID
 * @param data - Partial business data to update
 * @returns Updated business
 */
export async function updateBusiness(
  businessId: string,
  data: BusinessUpdateInput
): Promise<Business> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    // Validate update data
    const validatedData = businessUpdateSchema.parse(data);

    const businessRef = doc(db, "businesses", businessId);
    await updateDoc(businessRef, validatedData);

    // Return the updated business
    return (await getBusiness(businessId)) as Business;
  } catch (error) {
    console.error("Error updating business:", error);
    throw new Error("לא ניתן לעדכן את העסק");
  }
}

/**
 * Delete a business
 * @param businessId - Business ID
 */
export async function deleteBusiness(businessId: string): Promise<void> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const businessRef = doc(db, "businesses", businessId);
    await deleteDoc(businessRef);
  } catch (error) {
    console.error("Error deleting business:", error);
    throw new Error("לא ניתן למחוק את העסק");
  }
}

/**
 * Check if user can add more businesses based on subscription
 * @param userId - User ID
 * @returns True if user can add more businesses
 */
export async function checkBusinessLimit(userId: string): Promise<boolean> {
  try {
    const tier = await getUserSubscriptionTier(userId);
    const limit = SUBSCRIPTION_LIMITS[tier].businesses;

    if (limit === Infinity) {
      return true;
    }

    const businesses = await getUserBusinesses(userId);
    return businesses.length < limit;
  } catch (error) {
    console.error("Error checking business limit:", error);
    return false;
  }
}

/**
 * Get the number of businesses a user can still add
 * @param userId - User ID
 * @returns Number of businesses available
 */
export async function getRemainingBusinessSlots(
  userId: string
): Promise<number> {
  try {
    const tier = await getUserSubscriptionTier(userId);
    const limit = SUBSCRIPTION_LIMITS[tier].businesses;

    if (limit === Infinity) {
      return Infinity;
    }

    const businesses = await getUserBusinesses(userId);
    return Math.max(0, limit - businesses.length);
  } catch (error) {
    console.error("Error getting remaining business slots:", error);
    return 0;
  }
}

/**
 * Disconnect a business (mark as disconnected without deleting)
 * @param businessId - Business ID
 */
export async function disconnectBusiness(businessId: string): Promise<void> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const businessRef = doc(db, "businesses", businessId);
    await updateDoc(businessRef, { connected: false });
  } catch (error) {
    console.error("Error disconnecting business:", error);
    throw new Error("לא ניתן לנתק את העסק");
  }
}

/**
 * Reconnect a business (mark as connected)
 * @param businessId - Business ID
 */
export async function reconnectBusiness(businessId: string): Promise<void> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const businessRef = doc(db, "businesses", businessId);
    await updateDoc(businessRef, {
      connected: true,
      connectedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error reconnecting business:", error);
    throw new Error("לא ניתן לחבר מחדש את העסק");
  }
}

/**
 * Get connected businesses only
 * @param userId - User ID
 * @returns Array of connected businesses
 */
export async function getConnectedBusinesses(
  userId: string
): Promise<Business[]> {
  const businesses = await getUserBusinesses(userId);
  return businesses.filter((b) => b.connected);
}

/**
 * Count total businesses for a user
 * @param userId - User ID
 * @returns Number of businesses
 */
export async function countUserBusinesses(userId: string): Promise<number> {
  const businesses = await getUserBusinesses(userId);
  return businesses.length;
}
