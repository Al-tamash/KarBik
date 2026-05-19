import webpush from "web-push";
import dotenv from "dotenv";

dotenv.config();

// VAPID keys should be in .env
// If not found, notifications will fail but server won't crash
const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

if (publicVapidKey && privateVapidKey) {
  webpush.setVapidDetails(
    "mailto:admin@autobazaar.com",
    publicVapidKey,
    privateVapidKey
  );
}

/**
 * sendPushNotification
 * 
 * Sends a notification to a specific subscription.
 */
export async function sendPushNotification(subscription, payload) {
  if (!publicVapidKey || !privateVapidKey) {
    console.warn("VAPID keys not set. Skipping notification.");
    return;
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );
  } catch (error) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Subscription has expired or is no longer valid
      return "EXPIRED";
    }
    console.error("Error sending push notification:", error);
  }
}
