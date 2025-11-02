import { adminDb } from "@/lib/firebase/admin";
import { Business } from "@/types/database";
import { businessSchemaAdmin } from "@/lib/validation/database.admin";

export async function getBusinessAdmin(
  userId: string,
  businessId: string
): Promise<Business | null> {
  try {
    const businessRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("businesses")
      .doc(businessId);
    const businessSnap = await businessRef.get();

    if (businessSnap.exists) {
      const data = businessSnap.data();

      const cleanedData = {
        ...data,
        websiteUrl: data?.websiteUrl === "" ? undefined : data?.websiteUrl,
        mapsUrl: data?.mapsUrl === "" ? undefined : data?.mapsUrl,
        photoUrl: data?.photoUrl === "" ? undefined : data?.photoUrl,
      };

      const validated = businessSchemaAdmin.parse({
        id: businessSnap.id,
        ...cleanedData,
      });
      return validated as Business;
    }

    return null;
  } catch (error) {
    console.error("Error fetching business (admin):", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      if (error.name === "ZodError") {
        console.error("Validation error:", JSON.stringify(error, null, 2));
      }
    }
    throw new Error("לא ניתן לטעון את פרטי המיקום");
  }
}
