import { adminDb } from "@/lib/firebase/admin";
import { Location } from "@/types/database";
import { locationSchemaAdmin } from "@/lib/validation/database.admin";

export async function getLocationAdmin(
  userId: string,
  locationId: string
): Promise<Location | null> {
  try {
    const locationRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("locations")
      .doc(locationId);
    const locationSnap = await locationRef.get();

    if (locationSnap.exists) {
      const data = locationSnap.data();
      const validated = locationSchemaAdmin.parse({
        id: locationSnap.id,
        ...data,
      });
      return validated as Location;
    }

    return null;
  } catch (error) {
    console.error("Error fetching location (admin):", error);
    throw new Error("לא ניתן לטעון את פרטי המיקום");
  }
}
