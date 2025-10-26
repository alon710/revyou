import { google } from "googleapis";
import { getAuthenticatedClient } from "./oauth";

const mybusinessnotifications = google.mybusinessnotifications("v1");

export interface NotificationSetting {
  name: string;
  notificationTypes: string[];
  pubsubTopic: string;
}

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

export async function disableNotifications(
  refreshToken: string,
  accountName: string
): Promise<void> {
  try {
    const auth = await getAuthenticatedClient(refreshToken);

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
