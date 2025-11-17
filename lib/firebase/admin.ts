import * as admin from "firebase-admin";
import "server-only";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    throw new Error("Failed to initialize Firebase Admin SDK");
  }
}

/**
 * Get the Firestore database instance
 * @returns Firestore database instance
 */
export function getAdminDb() {
  return admin.firestore();
}

/**
 * Get the Firebase Admin instance
 * @returns Firebase Admin instance
 */
export function getAdminApp() {
  return admin.app();
}
