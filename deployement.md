# Implementation Plan — Production Deployment & Dynamic Secrets Configuration

This plan details the configurations, architecture checks, and automated setup processes needed to deploy the **AutoBazaar Full-Stack Platform** safely to production hosting services (Next.js on Vercel, Express on Render/Railway, and MongoDB Atlas clustering).

---

## User Review Required

> [!IMPORTANT]
> **Production Better Auth URL Mapping**: Better Auth requires a strict `BETTER_AUTH_URL` environment variable configured on the Express backend pointing exactly to your server root (e.g., `https://api.autobazaar.com`). If missing, cross-origin cookie syncing will fail.
>
> **MongoDB Atlas Network Whitelisting**: Ensure your MongoDB Atlas cluster has "Allow Access From Anywhere" (`0.0.0.0/0`) enabled or configured with static outbound IPs from your web host, otherwise, Express will fail to connect.

---

## Proposed Actions & Architecture

### 1. Production Secrets Architecture
We will map out the complete environment variable contract for both services to ensure total alignment during deployment.

#### A. Express Backend (Render/Railway/VPS)
| Variable | Description | Value Type | Verification Role |
| :--- | :--- | :--- | :--- |
| `MONGO_URI` | MongoDB Atlas cluster path | Connection string | central database connection |
| `PORT` | Active hosting port | integer | loaded dynamically by platform |
| `CLIENT_URL` | Frontend URL | URL | CORS validation origin matching |
| `BETTER_AUTH_SECRET` | 32-character crypto key | Hex/Base64 string | signing session cookies |
| `BETTER_AUTH_URL` | Live server address | URL | routing auth flow callbacks |
| `CLOUDINARY_URL` | Cloudinary credentials | Secret URL | media listing uploads |
| `RAZORPAY_KEY_ID` | Razorpay public ID | Key ID | checkout orders creation |
| `RAZORPAY_KEY_SECRET` | Razorpay private secret | Cryptic secret | cryptographically verifying webhooks |

#### B. Next.js Frontend (Vercel)
| Variable | Description | Value Type | Verification Role |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Backend URL address | URL | dispatching standard fetch actions |
| `NEXT_PUBLIC_APP_URL` | Frontend URL address | URL | sitemap.xml resolving base address |

---

### 2. Proposed Changes

We will create a custom production checking utility script in our workspace root to automatically scan local `.env` values, verify structural formats, check CORS domains, and generate deployment configuration JSON assets to copy directly into Vercel and Render dashboards.

#### [NEW] [verify_deploy.js](file:///c:/Altamash%20Next%20js%20%20Project/autobazar/scripts/verify_deploy.js)
- Performs a check on all environment keys.
- Validates URL syntax for `CLIENT_URL` and `NEXT_PUBLIC_API_URL`.
- Checks that `BETTER_AUTH_SECRET` has sufficient length.
- Outputs structured key-value template files (`deploy_frontend.json`, `deploy_backend.json`) that can be used to set up environment fields on hosting dashboards in seconds.

---

## Verification Plan

### Automated Checks
- Execute `node scripts/verify_deploy.js` to ensure environmental integrity before push actions.
- Execute our comprehensive test suite `python tests/run_tests.py` on local production mode.

### Manual Verification
- Deploy Express to web hosting and verify `/api/health` reports status `ok`.
- Deploy Next.js to Vercel and verify landing, login, and bento dashboard components load smoothly with optimized Cloudinary assets.
