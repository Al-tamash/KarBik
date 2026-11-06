import webpush from "web-push";
import type { WebPushSubscription } from "@autobazaar/shared";

const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

if (publicVapidKey && privateVapidKey) {
  webpush.setVapidDetails(
    "mailto:admin@karbik.com",
    publicVapidKey,
    privateVapidKey
  );
}

export async function sendPushNotification(
  subscription: WebPushSubscription,
  payload: object
): Promise<"SENT" | "EXPIRED" | "FAILED"> {
  if (!publicVapidKey || !privateVapidKey) {
    console.warn("VAPID keys not set. Skipping notification.");
    return "FAILED";
  }

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return "SENT";
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode === 410 || statusCode === 404) {
      return "EXPIRED";
    }
    console.error("Error sending push notification:", error);
    return "FAILED";
  }
}
