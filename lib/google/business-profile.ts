import { google } from "googleapis";
import { getAuthenticatedClient } from "@/lib/google/oauth";

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null) {
    if ("status" in error && typeof error.status === "number") {
      return error.status;
    }
    if ("code" in error && typeof error.code === "number") {
      return error.code;
    }
  }
  return undefined;
}

const mybusinessbusinessinformation =
  google.mybusinessbusinessinformation("v1");
const mybusinessaccountmanagement = google.mybusinessaccountmanagement("v1");

export interface GoogleLocation {
  name: string;
  title: string;
  address: {
    addressLines?: string[];
    locality?: string;
    administrativeArea?: string;
    postalCode?: string;
    regionCode?: string;
  };
  primaryPhone?: string;
  websiteUri?: string;
  profile?: {
    description?: string;
  };
  metadata?: {
    mapsUri?: string;
    newReviewUri?: string;
  };
}

export interface GoogleAccount {
  name: string;
  accountName: string;
  type: string;
  role?: string;
}

export interface GoogleReview {
  name: string;
  reviewer: {
    profilePhotoUrl?: string;
    displayName?: string;
    isAnonymous?: boolean;
  };
  starRating: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
  comment?: string;
  createTime: string;
  updateTime: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
}

export async function getAccounts(
  refreshToken: string
): Promise<GoogleAccount[]> {
  try {
    const auth = await getAuthenticatedClient(refreshToken);

    const response = await mybusinessaccountmanagement.accounts.list({
      auth,
    });

    return (response.data.accounts as GoogleAccount[]) || [];
  } catch (error) {
    console.error("Error fetching Google accounts:", error);

    const status = getErrorStatus(error);
    if (status === 429) {
      throw new Error("Google מגביל את מספר הבקשות. נא להמתין דקה ולנסות שוב.");
    } else if (status === 403) {
      throw new Error(
        "חסרות הרשאות לגשת ל-Google Business. נא לבדוק הגדרות API."
      );
    }

    throw new Error("לא ניתן לטעון את חשבונות Google Business");
  }
}

export async function getLocations(
  refreshToken: string,
  accountName: string
): Promise<GoogleLocation[]> {
  try {
    const auth = await getAuthenticatedClient(refreshToken);

    const response =
      await mybusinessbusinessinformation.accounts.locations.list({
        parent: accountName,
        readMask:
          "name,title,storefrontAddress,phoneNumbers,websiteUri,profile,metadata",
        auth,
      });

    return (response.data.locations as GoogleLocation[]) || [];
  } catch (error) {
    console.error("Error fetching locations:", error);

    const status = getErrorStatus(error);
    if (status === 429) {
      throw new Error("Google מגביל את מספר הבקשות. נא להמתין דקה ולנסות שוב.");
    } else if (status === 403) {
      throw new Error(
        "חסרות הרשאות לגשת ל-Google Business. נא לבדוק הגדרות API."
      );
    }

    throw new Error("לא ניתן לטעון את המיקומים");
  }
}

export async function getAllLocations(
  refreshToken: string
): Promise<Array<GoogleLocation & { accountId: string; accountName: string }>> {
  try {
    const accounts = await getAccounts(refreshToken);
    const allLocations: Array<
      GoogleLocation & { accountId: string; accountName: string }
    > = [];

    for (const account of accounts) {
      const locations = await getLocations(refreshToken, account.name);
      const locationsWithAccount = locations.map((loc) => ({
        ...loc,
        accountId: account.name,
        accountName: account.accountName,
      }));
      allLocations.push(...locationsWithAccount);
    }

    return allLocations;
  } catch (error) {
    console.error("Error fetching all locations:", error);
    throw new Error("לא ניתן לטעון את כל המיקומים");
  }
}

export async function getLocation(
  refreshToken: string,
  locationName: string
): Promise<GoogleLocation> {
  try {
    const auth = await getAuthenticatedClient(refreshToken);

    const response = await mybusinessbusinessinformation.locations.get({
      name: locationName,
      readMask:
        "name,title,storefrontAddress,phoneNumbers,websiteUri,profile,metadata",
      auth,
    });

    return response.data as GoogleLocation;
  } catch (error) {
    console.error("Error fetching location:", error);
    throw new Error("לא ניתן לטעון את פרטי המיקום");
  }
}

export function formatAddress(location: GoogleLocation): string {
  const addr = location.address;
  if (!addr) return "";

  const parts = [
    ...(addr.addressLines || []),
    addr.locality,
    addr.administrativeArea,
    addr.postalCode,
  ].filter(Boolean);

  return parts.join(", ");
}

export function extractLocationId(resourceName: string): string {
  return resourceName.split("/").pop() || "";
}

export function extractAccountId(resourceName: string): string {
  return resourceName.split("/").pop() || "";
}

export async function postReviewReply(
  refreshToken: string,
  reviewName: string,
  replyText: string
): Promise<void> {
  try {
    const auth = await getAuthenticatedClient(refreshToken);

    await auth.request({
      url: `https://mybusiness.googleapis.com/v4/${reviewName}/reply`,
      method: "PUT",
      data: {
        comment: replyText,
      },
    });
  } catch (error) {
    console.error("Error posting review reply:", error);

    const status = getErrorStatus(error);
    if (status === 403) {
      throw new Error("אין הרשאות לפרסם תגובות. נא לבדוק הגדרות API.");
    } else if (status === 404) {
      throw new Error("הביקורת לא נמצאה.");
    }

    throw new Error("לא ניתן לפרסם את התגובה");
  }
}

export async function deleteReviewReply(
  refreshToken: string,
  reviewName: string
): Promise<void> {
  try {
    const auth = await getAuthenticatedClient(refreshToken);

    await auth.request({
      url: `https://mybusiness.googleapis.com/v4/${reviewName}/reply`,
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error deleting review reply:", error);
    throw new Error("לא ניתן למחוק את התגובה");
  }
}
