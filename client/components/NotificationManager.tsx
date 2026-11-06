"use client";

/**
 * NotificationManager — keeps web-push working for the signed-in user.
 *
 * WHAT: Renders nothing. If the user has ALREADY granted notification
 *      permission it silently re-syncs the push subscription with the server.
 *      It never prompts on its own: browsers suppress prompts that appear
 *      without a user gesture, which is why dealers ended up with no alerts.
 *      The prompt is shown by AlertStatusBanner, from a button click.
 * WHY: Inquiry alerts must reach dealers even when the tab is closed.
 */

import { useEffect } from "react";
import { useAppSession } from "@/lib/auth-client";
import type { WebPushSubscription } from "@autobazaar/shared";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export type PushEnableResult =
  | "enabled"
  | "denied"
  | "unsupported"
  | "error";

/**
 * Subscribe this browser to push and save it. With `prompt: true` it may ask
 * for permission, so call that only from a click handler.
 */
export async function enablePushNotifications(
  options: { prompt: boolean }
): Promise<PushEnableResult> {
  try {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (
      !vapidPublicKey ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      return "unsupported";
    }

    let permission = Notification.permission;
    if (permission === "default" && options.prompt) {
      permission = await Notification.requestPermission();
    }
    if (permission !== "granted") {
      return permission === "denied" ? "denied" : "unsupported";
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
    }

    const res = await fetch("/api/notifications/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        subscription: subscription.toJSON() as unknown as WebPushSubscription,
      }),
    });
    return res.ok ? "enabled" : "error";
  } catch {
    return "error";
  }
}

export default function NotificationManager() {
  const { data: session } = useAppSession();

  useEffect(() => {
    if (!session?.user) return;
    // Silent re-sync only; no permission prompt without a user gesture.
    void enablePushNotifications({ prompt: false });
  }, [session?.user]);

  return null;
}
