import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { Account } from "@/types/database";

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

export async function getAccountByEmail(
  userId: string,
  email: string
): Promise<Account | null> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  const accountsRef = collection(db, "users", userId, "accounts");
  const q = query(accountsRef, where("email", "==", email));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as Account;
}

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

export async function getAccountGoogleRefreshToken(
  userId: string,
  accountId: string
): Promise<string | null> {
  const account = await getAccount(userId, accountId);
  return account?.googleRefreshToken || null;
}

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
