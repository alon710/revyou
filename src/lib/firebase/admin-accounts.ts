import { adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

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

export async function getAccountByEmail(
  userId: string,
  email: string
): Promise<any | null> {
  const accountsRef = adminDb
    .collection("users")
    .doc(userId)
    .collection("accounts");

  const snapshot = await accountsRef.where("email", "==", email).get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  };
}

export async function getAccountGoogleRefreshToken(
  userId: string,
  accountId: string
): Promise<string | null> {
  const account = await getAccount(userId, accountId);
  return account?.googleRefreshToken || null;
}

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
