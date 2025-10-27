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
import { Location, LocationConfig } from "@/types/database";
import {
  locationSchema,
  locationCreateSchema,
  locationUpdateSchema,
  LocationCreateInput,
  LocationUpdateInput,
} from "@/lib/validation/database";
import { checkLocationLimit } from "@/lib/firebase/location-limits";
import { getDefaultLocationConfig } from "@/lib/firebase/location-config";

export async function getUserLocations(userId: string): Promise<Location[]> {
  if (!db) {
    console.error("Firestore not initialized");
    return [];
  }

  try {
    const locationsRef = collection(db, "users", userId, "locations");
    const q = query(locationsRef, orderBy("connectedAt", "desc"));

    const querySnapshot = await getDocs(q);
    const locations: Location[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      try {
        const validated = locationSchema.parse({ id: doc.id, ...data });
        locations.push(validated as Location);
      } catch (error) {
        console.error("Invalid location data:", doc.id, error);
      }
    });

    return locations;
  } catch (error) {
    console.error("Error fetching locations:", error);
    throw new Error("לא ניתן לטעון את המיקומים");
  }
}

export async function getLocation(
  userId: string,
  locationId: string
): Promise<Location | null> {
  if (!db) {
    console.error("Firestore not initialized");
    return null;
  }

  try {
    const locationRef = doc(db, "users", userId, "locations", locationId);
    const locationSnap = await getDoc(locationRef);

    if (locationSnap.exists()) {
      const data = locationSnap.data();
      const validated = locationSchema.parse({ id: locationSnap.id, ...data });
      return validated as Location;
    }

    return null;
  } catch (error) {
    console.error("Error fetching location:", error);
    throw new Error("לא ניתן לטעון את פרטי המיקום");
  }
}

export async function createLocation(
  data: Omit<
    LocationCreateInput,
    "config" | "connectedAt" | "connected" | "emailOnNewReview"
  > & {
    userId: string;
    config?: Partial<LocationConfig>;
    emailOnNewReview?: boolean;
  }
): Promise<Location> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const canCreate = await checkLocationLimit(data.userId);
    if (!canCreate) {
      throw new Error("הגעת למגבלת המיקומים עבור חבילת המינוי שלך");
    }

    const defaultConfig = getDefaultLocationConfig();
    const locationConfig = { ...defaultConfig, ...data.config };

    const { userId, ...locationDataWithoutUserId } = data;

    const locationData = {
      ...locationDataWithoutUserId,
      config: locationConfig,
      connected: true,
      connectedAt: serverTimestamp(),
      emailOnNewReview: data.emailOnNewReview ?? true,
    };

    locationCreateSchema.parse(locationData);

    const locationsRef = collection(db, "users", userId, "locations");
    const docRef = await addDoc(locationsRef, locationData);

    return (await getLocation(userId, docRef.id)) as Location;
  } catch (error) {
    console.error("Error creating location:", error);
    if (error instanceof Error && error.message.includes("מגבלת")) {
      throw error;
    }
    throw new Error("לא ניתן ליצור מיקום חדש");
  }
}

export async function updateLocation(
  userId: string,
  locationId: string,
  data: LocationUpdateInput
): Promise<Location> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const validatedData = locationUpdateSchema.parse(data);

    const locationRef = doc(db, "users", userId, "locations", locationId);
    await updateDoc(locationRef, validatedData);

    return (await getLocation(userId, locationId)) as Location;
  } catch (error) {
    console.error("Error updating location:", error);
    throw new Error("לא ניתן לעדכן את המיקום");
  }
}

export async function deleteLocation(
  userId: string,
  locationId: string
): Promise<void> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const locationRef = doc(db, "users", userId, "locations", locationId);
    await deleteDoc(locationRef);
  } catch (error) {
    console.error("Error deleting location:", error);
    throw new Error("לא ניתן למחוק את המיקום");
  }
}

