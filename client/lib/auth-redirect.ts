/**
 * Where to send a visitor after they sign in or register.
 *
 * `?next=/some/path` lets a page that asked for sign-in (the wishlist, say) bring the
 * visitor back to it. Only a path on this site is accepted: anything that could leave it
 * ("//evil.com", "https://evil.com", "/\evil.com") is dropped, or the sign-in page would be
 * an open redirect.
 */
export function safeNext(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/")) return null;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return null;
  // Control characters and backslashes are how redirect filters get tricked.
  if (/[\u0000-\u001f\\]/.test(raw)) return null;
  // Signing in again from the sign-in pages would loop.
  if (/^\/(login|register|forgot-password|reset-password)(\/|\?|$)/.test(raw)) return null;
  return raw;
}

/** The page a signed-in visitor lands on when no `next` was given. */
export function homeFor(role: string | undefined): string {
  return role === "admin" ? "/admin" : "/dashboard";
}

/** Keeps ?next= when moving between login and register. */
export function withNext(path: string, next: string | null): string {
  return next ? `${path}?next=${encodeURIComponent(next)}` : path;
}
