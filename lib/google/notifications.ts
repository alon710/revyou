import { google } from "googleapis";
import { getAuthenticatedClient } from "./oauth";

/**
 * Google Business Profile Notifications API
 * Manages Pub/Sub notification settings for review notifications
 */

const mybusinessnotifications = google.mybusinessnotifications("v1");

export interface NotificationSetting {
  name: string; // Resource name
  notificationTypes: string[]; // e.g., ["NEW_REVIEW", "UPDATED_REVIEW"]
  pubsubTopic: string; // Pub/Sub topic name
}

/**
 * Enable Pub/Sub notifications for a business account
 * @param refreshToken - User's Google refresh token
 * @param accountName - Account resource name (e.g., "accounts/12345")
 * @param pubsubTopicName - Full Pub/Sub topic name (e.g., "projects/project-id/topics/topic-name")
 * @returns Notification settings
 */
export async function enableNotifications(
  refreshToken: string,
  accountName: string,
  pubsubTopicName: string
): Promise<NotificationSetting> {
  try {
    const auth = await getAuthenticatedClient(refreshToken);

    const response =
      await mybusinessnotifications.accounts.updateNotificationSetting({
        name: `${accountName}/notificationSetting`,
        updateMask: "notificationTypes,pubsubTopic",
        auth,
        requestBody: {
          notificationTypes: ["NEW_REVIEW", "UPDATED_REVIEW"],
          pubsubTopic: pubsubTopicName,
        },
      });

    return response.data as NotificationSetting;
  } catch (error) {
    console.error("Error enabling notifications:", error);
    throw new Error("לא ניתן להפעיל התראות עבור העסק");
  }
}

/**
 * Disable Pub/Sub notifications for a business account
 * @param refreshToken - User's Google refresh token
 * @param accountName - Account resource name
 * @returns Success status
 */
export async function disableNotifications(
  refreshToken: string,
  accountName: string
): Promise<void> {
  try {
    const auth = await getAuthenticatedClient(refreshToken);

    // Setting empty pubsubTopic disables notifications
    await mybusinessnotifications.accounts.updateNotificationSetting({
      name: `${accountName}/notificationSetting`,
      updateMask: "pubsubTopic",
      auth,
      requestBody: {
        pubsubTopic: "",
      },
    });
  } catch (error) {
    console.error("Error disabling notifications:", error);
    throw new Error("לא ניתן לכבות התראות עבור העסק");
  }
}

/**
 * Get current notification settings for an account
 * @param refreshToken - User's Google refresh token
 * @param accountName - Account resource name
 * @returns Current notification settings
 */
export async function getNotificationSettings(
  refreshToken: string,
  accountName: string
): Promise<NotificationSetting | null> {
  try {
    const auth = await getAuthenticatedClient(refreshToken);

    const response =
      await mybusinessnotifications.accounts.getNotificationSetting({
        name: `${accountName}/notificationSetting`,
        auth,
      });

    return response.data as NotificationSetting;
  } catch (error) {
    console.error("Error getting notification settings:", error);
    return null;
  }
}

/**
 * Get Pub/Sub topic name from environment
 * @returns Full topic name
 */
export function getPubSubTopicName(): string {
  const projectId =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_ADMIN_PROJECT_ID;
  const topicName = process.env.PUBSUB_TOPIC_NAME || "google-business-reviews";

  if (!projectId) {
    throw new Error("Firebase project ID not configured");
  }

  return `projects/${projectId}/topics/${topicName}`;
}
