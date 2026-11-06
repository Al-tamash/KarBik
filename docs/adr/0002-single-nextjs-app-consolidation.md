# Consolidate Express backend into a single Next.js app

AutoBazaar ran as two deployables: an Express API on Render (port 5000) and a Next.js frontend on Vercel, talking cross-origin with `credentials: "include"` and `sameSite: "none"` cookies. During the Postgres + TypeScript rewrite we decided to fold the API into the Next.js app as App Router route handlers under `/api/**`, making it a single deployable on Vercel.

Why: one deployment, no CORS or third-party-cookie fragility, one env file, and the route-handler model maps cleanly onto the existing controller-per-domain structure.

Decisions that follow:

- **Better Auth** mounts via `toNextJsHandler` at `app/api/auth/[...all]/route.ts`; cookies relax to `sameSite: "lax"` (same-origin now).
- **Auth guards** become per-route helper functions (`requireUser()`, `requireDealer()`, `requireActiveSubscription()`) called inside handlers using `auth.api.getSession({ headers })` — not `middleware.ts`, whose edge runtime makes DB-backed guards painful.
- **Uploads** switch from multer streaming to `request.formData()` in route handlers; Cloudinary stays as the storage provider unchanged.
- **Client fetches** drop `NEXT_PUBLIC_API_URL` and use relative `/api/...` paths.
- The old `server/` folder survives only as a reference copy while routes are ported; it is deleted once every route group has been ported and smoke-tested.
- Deployment is Vercel-only; Render configuration is retired.

Considered and rejected: keeping the split architecture (its costs motivated this change), moving the API into middleware/edge (DB access constraints).

## Consequences

- Express-specific code (multer, `toNodeHandler`, custom middleware chain) does not survive the port; each route group is rewritten, not copied.
- The REST path structure stays the same wherever possible so client-side call sites change minimally.
