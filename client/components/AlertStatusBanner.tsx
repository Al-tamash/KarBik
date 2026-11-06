"use client";

/**
 * AlertStatusBanner — tells a dealer when new-lead alerts are OFF.
 *
 * Without a push subscription a dealer only learns about a lead by opening the
 * dashboard (or from the email fallback, when configured). The button runs from
 * a real click, so the browser will actually show its permission prompt.
 */

import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { enablePushNotifications, type PushEnableResult } from "./NotificationManager";

export default function AlertStatusBanner() {
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PushEnableResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/notifications/status", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { subscribed?: boolean } | null) => {
        if (!cancelled) setSubscribed(data ? Boolean(data.subscribed) : null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Unknown (request failed) or already subscribed: stay out of the way.
  if (subscribed !== false || result === "enabled") return null;

  async function handleEnable() {
    setBusy(true);
    const outcome = await enablePushNotifications({ prompt: true });
    setResult(outcome);
    setBusy(false);
    if (outcome === "enabled") setSubscribed(true);
  }

  const hint =
    result === "denied"
      ? "Notifications are blocked for this site. Allow them in your browser's site settings, then try again."
      : result === "unsupported"
        ? "This browser can't receive push alerts. Check your leads on the dashboard regularly."
        : result === "error"
          ? "Couldn't turn alerts on. Please try again."
          : "Get an instant alert the moment a buyer sends an inquiry, even when this tab is closed.";

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-warning-200 bg-warning-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 rounded-lg bg-warning-100 p-1.5 text-warning-700">
          <BellRing className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-warning-800">New-lead alerts are off</p>
          <p className="mt-0.5 text-xs text-warning-700">{hint}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleEnable}
        disabled={busy}
        className="btn btn-primary btn-md shrink-0 disabled:opacity-50"
      >
        {busy ? "Enabling..." : "Turn on alerts"}
      </button>
    </div>
  );
}
