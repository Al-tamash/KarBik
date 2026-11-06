/**
 * The server POSTs to whatever `endpoint` a push subscription carries, so an
 * arbitrary URL would let any signed-in user make our server call internal or
 * attacker-chosen addresses (SSRF). Browsers only ever hand out endpoints that
 * belong to their vendor's push service, so accept just those.
 */
const TRUSTED_PUSH_HOST_SUFFIXES = [
  "fcm.googleapis.com", // Chrome, Edge, Brave, Opera, Samsung Internet
  "push.services.mozilla.com", // Firefox
  "notify.windows.com", // legacy Edge / WNS
  "push.apple.com", // Safari (web.push.apple.com)
];

export function isTrustedPushEndpoint(endpoint: unknown): boolean {
  if (typeof endpoint !== "string" || endpoint.length > 2048) return false;

  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return false;
  }

  if (url.protocol !== "https:") return false;
  if (url.username || url.password) return false;
  if (url.port && url.port !== "443") return false;

  const host = url.hostname.toLowerCase();
  return TRUSTED_PUSH_HOST_SUFFIXES.some(
    (suffix) => host === suffix || host.endsWith(`.${suffix}`)
  );
}

/** A real subscription also carries the two encryption keys. */
export function hasPushKeys(subscription: {
  keys?: { p256dh?: unknown; auth?: unknown };
}): boolean {
  const keys = subscription.keys;
  return (
    typeof keys?.p256dh === "string" &&
    keys.p256dh.length > 0 &&
    keys.p256dh.length < 512 &&
    typeof keys?.auth === "string" &&
    keys.auth.length > 0 &&
    keys.auth.length < 512
  );
}
