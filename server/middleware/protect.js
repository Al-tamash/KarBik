/**
 * Authentication & Authorization Middleware
 *
 * Middleware is code that runs BETWEEN the request arriving and your
 * route handler executing. Think of it like security checkpoints:
 *
 * Request → [CORS] → [protect] → [dealerOnly] → Route Handler → Response
 *
 * - protect: "Are you logged in?" (checks session cookie)
 * - dealerOnly: "Are you a dealer?" (checks user role)
 */

/**
 * protect(auth) — Verifies the user is logged in
 *
 * How it works:
 * 1. Reads the session cookie from the request headers
 * 2. Asks Better Auth: "Is this cookie valid? Who does it belong to?"
 * 3. If valid → attaches user info to req.user and calls next()
 * 4. If invalid → sends 401 Unauthorized
 *
 * We pass `auth` as a parameter because the auth instance is created
 * after the database connects (inside start() in index.js).
 * We can't import it at the top of the file — it doesn't exist yet.
 */
export function protect(auth) {
  return async (req, res, next) => {
    try {
      // auth.api.getSession reads the cookie from headers and returns
      // { session: {...}, user: {...} } if valid, or null if not
      const session = await auth.api.getSession({
        headers: req.headers,
      });

      if (!session) {
        return res.status(401).json({ message: "Unauthorized — please log in" });
      }

      // Attach user to the request so route handlers can access it
      // Example: req.user.id, req.user.role, req.user.name
      req.user = session.user;
      next();
    } catch (error) {
      return res.status(500).json({ message: "Authentication error" });
    }
  };
}

/**
 * dealerOnly — Blocks anyone who isn't a dealer
 *
 * Must be used AFTER protect(), because it relies on req.user
 * being set by the protect middleware.
 *
 * Usage in routes: router.post("/", protect(auth), dealerOnly, createCar)
 *
 * HTTP 403 means "Forbidden" — you ARE logged in, but you don't have
 * permission. Different from 401 which means "not logged in at all."
 */
export function dealerOnly(req, res, next) {
  if (req.user.role !== "dealer") {
    return res.status(403).json({ message: "Forbidden — dealers only" });
  }
  next();
}
