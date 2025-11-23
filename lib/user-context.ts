import { headers } from "next/headers";

export async function getUserIdFromHeaders(): Promise<string | undefined> {
  const headersList = await headers();
  return headersList.get("x-user-id") || undefined;
}
