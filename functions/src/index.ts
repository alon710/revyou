import * as admin from "firebase-admin";

admin.initializeApp();

export * from "./functions/onReviewCreate";
export * from "./functions/onGoogleReviewNotification";
