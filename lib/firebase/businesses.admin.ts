import { adminDb } from "@/lib/firebase/admin";
import { Business } from "@/types/database";
import { businessSchemaAdmin } from "@/lib/validation/database.admin";
import { Timestamp as ClientTimestamp } from "firebase/firestore";

export async function getBusinessAdmin(
  userId: string,
  accountId: string,
  businessId: string
): Promise<Business | null> {
  try {
    const businessRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("accounts")
      .doc(accountId)
      .collection("businesses")
      .doc(businessId);
    const businessSnap = await businessRef.get();

    if (businessSnap.exists) {
      const data = businessSnap.data();

      const cleanedData = {
        ...data,
        phoneNumber:
          data?.phoneNumber === "" ? null : (data?.phoneNumber ?? null),
        websiteUrl: data?.websiteUrl === "" ? null : (data?.websiteUrl ?? null),
        mapsUrl: data?.mapsUrl === "" ? null : (data?.mapsUrl ?? null),
        description:
          data?.description === "" ? null : (data?.description ?? null),
        photoUrl: data?.photoUrl === "" ? null : (data?.photoUrl ?? null),
      };

      const validated = businessSchemaAdmin.parse({
        id: businessSnap.id,
        ...cleanedData,
      });

      const connectedAtDate =
        validated.connectedAt instanceof Date
          ? validated.connectedAt
          : validated.connectedAt.toDate();

      const business: Business = {
        ...validated,
        accountId: accountId,
        connectedAt: ClientTimestamp.fromDate(connectedAtDate),
      };

      return business;
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
    throw new Error("לא ניתן לטעון את פרטי העסק");
  }
}
