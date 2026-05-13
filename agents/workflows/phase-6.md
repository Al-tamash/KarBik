# Phase 6: Deploy to Vercel + Render + MongoDB Atlas

> **Status:** 🔲 Not Started
> **Objective:** Deploy the full AutoBazaar stack — Next.js frontend on Vercel, Express API on Render, and MongoDB on MongoDB Atlas.

---

## 1. Pre-Deployment Audit

### 1.1 Verify current phase completion
- [ ] All Phase 1–5 features tested and working locally
- [ ] Git repo initialized and all files committed to `main`
- [ ] No hardcoded localhost URLs in committed code
- [ ] No secrets in committed code (only `.env` / `.env.local` references)

### 1.2 Local build verification
```bash
# Client
cd client && npm run build

# Server — verify it starts without errors
cd server && node index.js
```

### 1.3 Fix blocking issues before deploying
- Remove or fix any `localhost:3000` / `localhost:5000` references (except `.env` and `.env.local`)
- Ensure all `process.env` variables have fallbacks or startup validation
- Confirm `.gitignore` excludes `.env`, `.env.local`, `node_modules`, `.next`, `.vercel` (already done)

---

## 2. MongoDB Atlas Setup

### 2.1 Create Atlas account & cluster
1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free-tier cluster (`M0` sandbox) in a region close to your users
3. Set a secure database user password (save it — it cannot be viewed again)

### 2.2 Configure network access
- Allow connections from **any IP** (`0.0.0.0/0`) during initial setup
- Add IP allowlist entries for Production (Vercel IPs) and staging as needed

### 2.3 Create database and collection
1. Create database: `autobazaar`
2. Collections will be auto-created by Mongoose: `users`, `sessions`, `accounts`, `verifications`, `cars`, `inquiries`

### 2.4 Build the production MONGO_URI
```
mongodb+srv://<DB_USERNAME>:<DB_PASSWORD>@<CLUSTER_NAME>.mongodb.net/autobazaar?retryWrites=true&w=majority
```

### 2.5 Environment variable
**SERVER only** — store in Render env vars (not in `.env` file):
```
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/autobazaar
```

> ⚠️ **Critical:** Never commit this URI to git. The `<password>` must be URL-encoded if it contains special characters (`@` → `%40`, etc.).

---

## 3. Render Backend Deployment

### 3.1 Prepare the Express server for production

#### Add a startup script
`server/package.json` needs a `start` script:
```json
"scripts": {
  "start": "node index.js"
}
```

#### Add `engines` field to lock Node version
`server/package.json`:
```json
"engines": {
  "node": ">=20"
}
```

#### Create `server/render.yaml` (Render config)
```yaml
services:
  - type: web
    name: autobazar-api
    runtime: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGO_URI
        sync: false
      - key: BETTER_AUTH_SECRET
        sync: false
      - key: CLIENT_URL
        value: https://autobazaar.vercel.app
      - key: CLOUDINARY_CLOUD_NAME
        sync: false
      - key: CLOUDINARY_API_KEY
        sync: false
      - key: CLOUDINARY_API_SECRET
        sync: false
```

### 3.2 Deploy to Render
1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect GitHub repo (or push using Render CLI)
3. Select the `server/` directory as the root (or configure build to navigate into it)
4. Set:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Instance type:** Free (or Starter for reliability)
5. Add all environment variables in Render dashboard:
   - `MONGO_URI` — from MongoDB Atlas
   - `BETTER_AUTH_SECRET` — a secure 32+ char random string (must match `.env` value)
   - `CLIENT_URL` — `https://autobazaar.vercel.app` (or your Vercel URL)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
6. Deploy and verify: visit `https://<render-app-url>/api/health`

### 3.3 Verify backend on Render
```bash
curl https://<your-render-app>.onrender.com/api/health
# Expected: {"status":"ok"}
```

---

## 4. Vercel Frontend Deployment

### 4.1 Prepare Next.js config for production

#### Update `client/next.config.mjs`
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
```

#### Add preview/og image support (optional but recommended)
No code changes needed — just ensure RemotePatterns allows Cloudinary.

### 4.2 Configure environment variables for Vercel
In the Vercel dashboard for the project:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://<your-render-app>.onrender.com` |
| `NEXT_PUBLIC_APP_URL` | `https://autobazar.vercel.app` |

> These are **preview** (non-secret) variables since they're already in `NEXT_PUBLIC_*` scope. They are safe in the Vercel dashboard.

### 4.3 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import from GitHub (select the repo)
3. Configure:
   - **Framework:** Next.js
   - **Build command:** `cd client && npm run build`
   - **Output directory:** `client/.next` (Vercel auto-detects)
   - **Install command:** `cd client && npm install`
4. Add environment variables in Vercel dashboard
5. Deploy

### 4.4 Verify frontend on Vercel
- Visit the deployed URL
- Test: browse listings, log in, create listing, send inquiry
- Check browser DevTools → Network tab — all API calls should go to the Render backend with no CORS errors

---

## 5. Production Environment Variables Reference

### Server (Render)
```
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/autobazaar
BETTER_AUTH_SECRET=<your-32-char-secret>
CLIENT_URL=https://autobazar.vercel.app
PORT=5000
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
```

### Client (Vercel)
```
NEXT_PUBLIC_API_URL=https://<your-render-app>.onrender.com
NEXT_PUBLIC_APP_URL=https://autobazar.vercel.app
```

---

## 6. Post-Deployment Validation Checklist

### 6.1 Core functionality tests
- [ ] **Browse listings** — landing page loads images from Cloudinary
- [ ] **Search & filters** — search by keyword, filter by brand/year/price
- [ ] **Registration** — new user can sign up as buyer or dealer
- [ ] **Login/Logout** — session persists across page refreshes
- [ ] **Dealer dashboard** — dealer sees their own listings
- [ ] **Create listing** — dealer can add a car with images (Cloudinary upload)
- [ ] **Update listing** — dealer edits title/price/images
- [ ] **Delete listing** — dealer removes listing + Cloudinary images cleaned up
- [ ] **Send inquiry** — buyer sends inquiry on a car listing
- [ ] **View inquiries** — dealer sees received inquiries on dashboard
- [ ] **View sent inquiries** — buyer sees their sent inquiries

### 6.2 Health checks
- [ ] `GET /api/health` returns `{"status":"ok"}`
- [ ] MongoDB Atlas shows active connections
- [ ] Cloudinary dashboard shows uploaded images
- [ ] No errors in Render logs or Vercel logs

### 6.3 Security checks
- [ ] CORS only allows `CLIENT_URL` (not `*`)
- [ ] No secrets exposed in client bundle (inspect Network/Source)
- [ ] Auth routes return 401 for unauthenticated requests
- [ ] Protected routes (POST/PUT/DELETE cars, POST inquiries) enforce authentication
- [ ] `BETTER_AUTH_SECRET` is random and unique (not default/example value)

---

## 7. Monitoring & Observability

### 7.1 Render monitoring
- Enable Render metrics (request count, latency, error rate)
- Set up email alerts for downtime

### 7.2 Vercel analytics
- Enable Vercel Analytics for page load times, Core Web Vitals
- Use `@vercel/analytics` package if deeper tracking needed

### 7.3 MongoDB Atlas monitoring
- Enable Atlas alerts for slow queries, replication lag, storage limits
- Set up index suggestions monitoring

### 7.4 Cloudinary
- Monitor storage usage and bandwidth in Cloudinary dashboard
- Set up fetch/upload notification URLs if needed

---

## 8. Custom Domain (Optional — Post-Deploy)

### 8.1 Frontend custom domain
1. Buy domain (e.g., `autobazar.com`)
2. In Vercel dashboard → Settings → Domains → Add domain
3. Configure DNS records as instructed by Vercel
4. Verify and set as primary

### 8.2 Backend custom domain (Render)
1. In Render dashboard → Custom Domains → Add domain
2. Point CNAME to `<app>.onrender.com`
3. Update `CLIENT_URL` env var to use the custom domain

---

## 9. Phase 6 Completion Criteria

| Criteria | Done? |
|----------|-------|
| MongoDB Atlas cluster created and connected | 🔲 |
| Express API deployed on Render with all env vars | 🔲 |
| Next.js frontend deployed on Vercel with all env vars | 🔲 |
| Cloudinary uploads working in production | 🔲 |
| Better Auth sessions working (login + registration) | 🔲 |
| All 13 API endpoints functional and returning correct data | 🔲 |
| CORS configured correctly (no wildcard, only client URL) | 🔲 |
| All core user flows tested end-to-end | 🔲 |
| Monitoring enabled for all three services | 🔲 |
| Custom domains configured (optional) | 🔲 |

---

## 10. Estimated Timeline

| Task | Duration |
|------|----------|
| MongoDB Atlas setup | 30 min |
| Render backend deployment | 45 min |
| Vercel frontend deployment | 30 min |
| Environment variable configuration | 20 min |
| E2E testing all flows | 1–2 hours |
| Monitoring & alerts setup | 30 min |
| Custom domain (optional) | 30 min |
| **Total** | **4–5 hours** |

---

## 11. Rollback Plan

- **Vercel:** Built-in deployment history — rollback to any previous deployment with one click
- **Render:** Git-based deploys — revert the commit and redeploy to roll back
- **MongoDB Atlas:** Use Atlas backups (snapshot-based) to restore data if needed

---

*Created as part of AutoBazaar Phase 6 deployment plan.*