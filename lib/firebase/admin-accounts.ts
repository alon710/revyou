import { adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * Create a new Google account for a user (Admin SDK version)
 */
export async function createAccount(
  userId: string,
  accountData: {
    email: string;
    accountName: string;
    googleRefreshToken: string;
  }
): Promise<string> {
  const accountsRef = adminDb
    .collection("users")
    .doc(userId)
    .collection("accounts");
  const newAccountRef = accountsRef.doc();

  const account = {
    ...accountData,
    connectedAt: Timestamp.now(),
  };

  await newAccountRef.set(account);
  return newAccountRef.id;
}

/**
 * Update an account (Admin SDK version)
 */
export async function updateAccount(
  userId: string,
  accountId: string,
  data: {
    googleRefreshToken?: string;
    lastSynced?: Timestamp;
  }
): Promise<void> {
  const accountRef = adminDb
    .collection("users")
    .doc(userId)
    .collection("accounts")
    .doc(accountId);

  await accountRef.update({
    ...data,
    lastSynced: Timestamp.now(),
  });
}

/**
 * Get account (Admin SDK version)
 */
export async function getAccount(
  userId: string,
  accountId: string
): Promise<any | null> {
  const accountRef = adminDb
    .collection("users")
    .doc(userId)
    .collection("accounts")
    .doc(accountId);

  const accountDoc = await accountRef.get();

  if (!accountDoc.exists) {
    return null;
  }

  return {
    id: accountDoc.id,
    ...accountDoc.data(),
  };
}

/**
 * Get account's Google refresh token (Admin SDK version)
 */
export async function getAccountGoogleRefreshToken(
  userId: string,
  accountId: string
): Promise<string | null> {
  const account = await getAccount(userId, accountId);
  return account?.googleRefreshToken || null;
}

/**
 * Get user's selected account ID
 */
export async function getUserSelectedAccountId(
  userId: string
): Promise<string | null> {
  const userRef = adminDb.collection("users").doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    return null;
  }

  const userData = userDoc.data();
  return userData?.selectedAccountId || null;
}
