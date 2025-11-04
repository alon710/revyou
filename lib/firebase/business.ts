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
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Business, BusinessConfig } from "@/types/database";
import {
  businessSchema,
  businessCreateSchema,
  businessUpdateSchema,
  BusinessCreateInput,
  BusinessUpdateInput,
} from "@/lib/validation/database";
import { checkBusinessLimit } from "@/lib/firebase/business-limits";
import { getDefaultBusinessConfig } from "@/lib/firebase/business-config";

export async function getAccountBusinesses(
  userId: string,
  accountId: string
): Promise<Business[]> {
  if (!db) {
    console.error("Firestore not initialized");
    return [];
  }

  try {
    const businessesRef = collection(
      db,
      "users",
      userId,
      "accounts",
      accountId,
      "businesses"
    );
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

export async function getAllUserBusinesses(
  userId: string
): Promise<Business[]> {
  if (!db) {
    console.error("Firestore not initialized");
    return [];
  }

  try {
    const accountsRef = collection(db, "users", userId, "accounts");
    const accountsSnapshot = await getDocs(accountsRef);

    const allBusinesses: Business[] = [];

    for (const accountDoc of accountsSnapshot.docs) {
      const businesses = await getAccountBusinesses(userId, accountDoc.id);
      allBusinesses.push(...businesses);
    }

    return allBusinesses;
  } catch (error) {
    console.error("Error fetching all businesses:", error);
    throw new Error("לא ניתן לטעון את העסקים");
  }
}

export async function getBusiness(
  userId: string,
  accountId: string,
  businessId: string
): Promise<Business | null> {
  if (!db) {
    console.error("Firestore not initialized");
    return null;
  }

  try {
    const businessRef = doc(
      db,
      "users",
      userId,
      "accounts",
      accountId,
      "businesses",
      businessId
    );
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

export async function createBusiness(
  data: Omit<
    BusinessCreateInput,
    "config" | "connectedAt" | "connected" | "emailOnNewReview"
  > & {
    userId: string;
    accountId: string;
    config?: Partial<BusinessConfig>;
    emailOnNewReview?: boolean;
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
    const BusinessConfig = {
      ...defaultConfig,
      ...data.config,
      name: data.config?.name || data.name,
      description: data.config?.description || data.description,
      phoneNumber: data.config?.phoneNumber || data.phoneNumber,
    };

    const { userId, accountId, ...businessDataWithoutUserIdAndAccountId } =
      data;

    const businessData = {
      ...businessDataWithoutUserIdAndAccountId,
      config: BusinessConfig,
      connected: true,
      connectedAt: serverTimestamp(),
      emailOnNewReview: data.emailOnNewReview ?? true,
    };

    // eslint-disable-next-line unused-imports/no-unused-vars
    const { connectedAt, ...validationData } = businessData;
    businessCreateSchema.omit({ connectedAt: true }).parse(validationData);

    const businessesRef = collection(
      db,
      "users",
      userId,
      "accounts",
      accountId,
      "businesses"
    );
    const docRef = await addDoc(businessesRef, businessData);

    return (await getBusiness(userId, accountId, docRef.id)) as Business;
  } catch (error) {
    console.error("Error creating business:", error);
    if (error instanceof Error && error.message.includes("מגבלת")) {
      throw error;
    }
    throw new Error("לא ניתן ליצור עסק חדש");
  }
}

export async function updateBusiness(
  userId: string,
  accountId: string,
  businessId: string,
  data: BusinessUpdateInput
): Promise<Business> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const validatedData = businessUpdateSchema.parse(data);

    const businessRef = doc(
      db,
      "users",
      userId,
      "accounts",
      accountId,
      "businesses",
      businessId
    );
    await updateDoc(businessRef, validatedData);

    return (await getBusiness(userId, accountId, businessId)) as Business;
  } catch (error) {
    console.error("Error updating business:", error);
    throw new Error("לא ניתן לעדכן את העסק");
  }
}

export async function deleteBusiness(
  userId: string,
  accountId: string,
  businessId: string
): Promise<void> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const businessRef = doc(
      db,
      "users",
      userId,
      "accounts",
      accountId,
      "businesses",
      businessId
    );
    await deleteDoc(businessRef);
  } catch (error) {
    console.error("Error deleting business:", error);
    throw new Error("לא ניתן למחוק את העסק");
  }
}
