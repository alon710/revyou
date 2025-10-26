import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import {
  Business,
  BusinessConfig,
  ToneOfVoice,
  LanguageMode,
} from "@/types/database";
import {
  enrichProduct,
  getPlanLimits,
  type PlanLimits,
} from "@/lib/stripe/entitlements";
import {
  businessSchema,
  businessCreateSchema,
  businessUpdateSchema,
  BusinessCreateInput,
  BusinessUpdateInput,
} from "@/lib/validation/database";

async function getUserPlanLimits(userId: string): Promise<PlanLimits> {
  if (!db) {
    console.error("Firestore not initialized");
    return {
      businesses: 1,
      reviewsPerMonth: 5,
      autoPost: false,
      requireApproval: true,
    };
  }

  try {
    const subscriptionsRef = collection(db, "users", userId, "subscriptions");
    const activeSubQuery = query(
      subscriptionsRef,
      where("status", "in", ["active", "trialing"])
    );
    const subSnapshot = await getDocs(activeSubQuery);

    if (subSnapshot.empty) {
      const productsRef = collection(db, "products");
      const freeProductQuery = query(
        productsRef,
        where("active", "==", true),
        where("metadata.plan_id", "==", "free")
      );
      const freeProductSnapshot = await getDocs(freeProductQuery);

      if (!freeProductSnapshot.empty) {
        const productData = freeProductSnapshot.docs[0].data();
        const enriched = enrichProduct({
          ...productData,
          id: freeProductSnapshot.docs[0].id,
        } as any);
        return getPlanLimits(enriched);
      }

      return {
        businesses: 1,
        reviewsPerMonth: 5,
        autoPost: false,
        requireApproval: true,
      };
    }

    const subData = subSnapshot.docs[0].data();
    const productId = subData.product;

    const productRef = doc(db, "products", productId);
    const productSnapshot = await getDoc(productRef);

    if (!productSnapshot.exists()) {
      console.error("Product not found:", productId);
      return {
        businesses: 1,
        reviewsPerMonth: 5,
        autoPost: false,
        requireApproval: true,
      };
    }

    const productData = productSnapshot.data();
    const enriched = enrichProduct({
      ...productData,
      id: productSnapshot.id,
    } as any);

    return getPlanLimits(enriched);
  } catch (error) {
    console.error("Error fetching user plan limits:", error);
    return {
      businesses: 1,
      reviewsPerMonth: 5,
      autoPost: false,
      requireApproval: true,
    };
  }
}

export async function getUserBusinesses(userId: string): Promise<Business[]> {
  if (!db) {
    console.error("Firestore not initialized");
    return [];
  }

  try {
    const businessesRef = collection(db, "users", userId, "businesses");
    const q = query(businessesRef, orderBy("connectedAt", "desc"));

    const querySnapshot = await getDocs(q);
    const businesses: Business[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
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

export async function getBusiness(
  userId: string,
  businessId: string
): Promise<Business | null> {
  if (!db) {
    console.error("Firestore not initialized");
    return null;
  }

  try {
    const businessRef = doc(db, "users", userId, "businesses", businessId);
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

export async function createBusiness(
  data: Omit<BusinessCreateInput, "config" | "connectedAt" | "connected"> & {
    userId: string;
    config?: Partial<BusinessConfig>;
  }
): Promise<Business> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const canCreate = await checkBusinessLimit(data.userId);
    if (!canCreate) {
      throw new Error("הגעת למגבלת העסקים עבור חבילת המינוי שלך");
    }

    const defaultConfig = getDefaultBusinessConfig();
    const businessConfig = { ...defaultConfig, ...data.config };

    const { userId, ...businessDataWithoutUserId } = data;

    const businessData = {
      ...businessDataWithoutUserId,
      config: businessConfig,
      connected: true,
      connectedAt: serverTimestamp(),
    };

    businessCreateSchema.parse(businessData);

    const businessesRef = collection(db, "users", userId, "businesses");
    const docRef = await addDoc(businessesRef, businessData);

    return (await getBusiness(userId, docRef.id)) as Business;
  } catch (error) {
    console.error("Error creating business:", error);
    if (error instanceof Error && error.message.includes("מגבלת")) {
      throw error;
    }
    throw new Error("לא ניתן ליצור עסק חדש");
  }
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

export async function updateBusiness(
  userId: string,
  businessId: string,
  data: BusinessUpdateInput
): Promise<Business> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const validatedData = businessUpdateSchema.parse(data);

    const businessRef = doc(db, "users", userId, "businesses", businessId);
    await updateDoc(businessRef, validatedData);

    return (await getBusiness(userId, businessId)) as Business;
  } catch (error) {
    console.error("Error updating business:", error);
    throw new Error("לא ניתן לעדכן את העסק");
  }
}

export async function deleteBusiness(
  userId: string,
  businessId: string
): Promise<void> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const businessRef = doc(db, "users", userId, "businesses", businessId);
    await deleteDoc(businessRef);
  } catch (error) {
    console.error("Error deleting business:", error);
    throw new Error("לא ניתן למחוק את העסק");
  }
}

export async function checkBusinessLimit(userId: string): Promise<boolean> {
  try {
    const limits = await getUserPlanLimits(userId);
    const businesses = await getUserBusinesses(userId);
    return businesses.length < limits.businesses;
  } catch (error) {
    console.error("Error checking business limit:", error);
    return false;
  }
}

export async function getRemainingBusinessSlots(
  userId: string
): Promise<number> {
  try {
    const limits = await getUserPlanLimits(userId);
    const businesses = await getUserBusinesses(userId);
    return Math.max(0, limits.businesses - businesses.length);
  } catch (error) {
    console.error("Error getting remaining business slots:", error);
    return 0;
  }
}

export async function disconnectBusiness(
  userId: string,
  businessId: string
): Promise<void> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const businessRef = doc(db, "users", userId, "businesses", businessId);
    await updateDoc(businessRef, { connected: false });
  } catch (error) {
    console.error("Error disconnecting business:", error);
    throw new Error("לא ניתן לנתק את העסק");
  }
}

export async function reconnectBusiness(
  userId: string,
  businessId: string
): Promise<void> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const businessRef = doc(db, "users", userId, "businesses", businessId);
    await updateDoc(businessRef, {
      connected: true,
      connectedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error reconnecting business:", error);
    throw new Error("לא ניתן לחבר מחדש את העסק");
  }
}

export async function getConnectedBusinesses(
  userId: string
): Promise<Business[]> {
  const businesses = await getUserBusinesses(userId);
  return businesses.filter((b) => b.connected);
}

export async function countUserBusinesses(userId: string): Promise<number> {
  const businesses = await getUserBusinesses(userId);
  return businesses.length;
}
