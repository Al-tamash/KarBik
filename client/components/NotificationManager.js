"use client";

import { useCallback, useEffect } from "react";
import { authClient } from "@/lib/auth-client";

const PUBLIC_VAPID_KEY = "BNHlM2TJkvVYElTRIjlvS_-Gyq6zXxq53j13OKgt4jTqVSGeHZLkWyAdVIcZB1TNQDZZ4O0mY9Kjf0CDFKWyXOY";
const API = process.env.NEXT_PUBLIC_API_URL;

/**
 * NotificationManager — Handles PWA Service Worker & Push registration
 */
export default function NotificationManager() {
  const { data: session } = authClient.useSession();

  const registerServiceWorker = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;

      // 1. Request Permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Permission denied. Please enable notifications in site settings.");
        return;
      }

      // 2. Subscribe to Push
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
        });
      }

      // 3. Send to Backend
      const res = await fetch(`${API}/api/notifications/subscribe`, {
        method: "POST",
        body: JSON.stringify({ subscription }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
        alert("Notifications enabled successfully! 🚀");
        return true;
      }
    } catch (err) {
      console.error("Subscription error:", err);
      alert("Failed to enable notifications. Try again.");
    }
    return false;
  }, []);

  useEffect(() => {
    if (!session) return;

    // Attach to window so we can trigger from a button click
    window.subscribeToNotifications = registerServiceWorker;

    // Initial check (might fail due to lack of user gesture, hence the manual button)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }
  }, [session, registerServiceWorker]);

  return null;
}

// Utility to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
