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

      // Clean up empty string URLs before validation
      const cleanedData = {
        ...data,
        websiteUrl: data?.websiteUrl === "" ? undefined : data?.websiteUrl,
        mapsUrl: data?.mapsUrl === "" ? undefined : data?.mapsUrl,
        photoUrl: data?.photoUrl === "" ? undefined : data?.photoUrl,
      };

      const validated = locationSchemaAdmin.parse({
        id: locationSnap.id,
        ...cleanedData,
      });
      return validated as Location;
    }

    return null;
  } catch (error) {
    console.error("Error fetching location (admin):", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      if (error.name === "ZodError") {
        console.error("Validation error:", JSON.stringify(error, null, 2));
      }
    }
    throw new Error("לא ניתן לטעון את פרטי המיקום");
  }
}
