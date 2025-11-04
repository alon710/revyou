import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { Account } from "@/types/database";

/**
 * Create a new Google account for a user
 */
export async function createAccount(
  userId: string,
  accountData: {
    email: string;
    accountName: string;
    googleRefreshToken: string;
  }
): Promise<string> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  const accountsRef = collection(db, "users", userId, "accounts");
  const newAccountRef = doc(accountsRef);

  const account: Omit<Account, "id"> = {
    ...accountData,
    connectedAt: Timestamp.now(),
  };

  await setDoc(newAccountRef, account);
  return newAccountRef.id;
}

/**
 * Get all accounts for a user
 */
export async function getUserAccounts(userId: string): Promise<Account[]> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  const accountsRef = collection(db, "users", userId, "accounts");
  const q = query(accountsRef, orderBy("connectedAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Account[];
}

/**
 * Get a specific account
 */
export async function getAccount(
  userId: string,
  accountId: string
): Promise<Account | null> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  const accountRef = doc(db, "users", userId, "accounts", accountId);
  const snapshot = await getDoc(accountRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as Account;
}

/**
 * Update an account
 */
export async function updateAccount(
  userId: string,
  accountId: string,
  data: Partial<Omit<Account, "id" | "connectedAt">>
): Promise<void> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  const accountRef = doc(db, "users", userId, "accounts", accountId);
  await updateDoc(accountRef, {
    ...data,
    lastSynced: Timestamp.now(),
  });
}

/**
 * Delete an account and all its businesses and reviews
 */
export async function deleteAccount(
  userId: string,
  accountId: string
): Promise<void> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  // Get all businesses under this account
  const businessesRef = collection(
    db,
    "users",
    userId,
    "accounts",
    accountId,
    "businesses"
  );
  const businessesSnapshot = await getDocs(businessesRef);

  const batch = writeBatch(db);

  // Delete all reviews for each business
  for (const businessDoc of businessesSnapshot.docs) {
    const reviewsRef = collection(
      db,
      "users",
      userId,
      "accounts",
      accountId,
      "businesses",
      businessDoc.id,
      "reviews"
    );
    const reviewsSnapshot = await getDocs(reviewsRef);

    // Delete all reviews
    reviewsSnapshot.docs.forEach((reviewDoc) => {
      batch.delete(reviewDoc.ref);
    });

    // Delete business
    batch.delete(businessDoc.ref);
  }

  // Delete the account itself
  const accountRef = doc(db, "users", userId, "accounts", accountId);
  batch.delete(accountRef);

  await batch.commit();
}

/**
 * Get the Google refresh token for an account
 */
export async function getAccountGoogleRefreshToken(
  userId: string,
  accountId: string
): Promise<string | null> {
  const account = await getAccount(userId, accountId);
  return account?.googleRefreshToken || null;
}

/**
 * Update the Google refresh token for an account
 */
export async function updateAccountGoogleRefreshToken(
  userId: string,
  accountId: string,
  googleRefreshToken: string
): Promise<void> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  const accountRef = doc(db, "users", userId, "accounts", accountId);
  await updateDoc(accountRef, {
    googleRefreshToken,
    lastSynced: Timestamp.now(),
  });
}
