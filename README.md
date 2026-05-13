# autobazaar

Full-stack car dealer marketplace built with Next.js 16, Express.js, MongoDB, and Better Auth.

## Tech Stack
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Backend:** Node.js + Express.js (ESModules)
- **Database:** MongoDB Atlas via Mongoose
- **Auth:** Better Auth (email + password)
- **File Uploads:** Cloudinary
- **Deployment:** Vercel (frontend) + Render (backend) + MongoDB Atlas (database)

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB Atlas account
- Cloudinary account
- GitHub account

### Local Development

```bash
# Server
cd server
npm install
cp .env.example .env
# Fill in MONGO_URI, BETTER_AUTH_SECRET, CLOUDINARY_*, CLIENT_URL
npm run dev

# Client
cd client
npm install
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_API_URL, NEXT_PUBLIC_APP_URL
npm run dev
```

## API Routes
- `GET /api/cars` — Public listings with search, filters, sort, pagination
- `GET /api/cars/brands` — All unique car brands
- `GET /api/cars/mine` — Dealer's own listings (protected)
- `GET /api/cars/:id` — Single car listing
- `POST /api/cars` — Create listing (dealer only, with Cloudinary upload)
- `PUT /api/cars/:id` — Update listing (owner only)
- `DELETE /api/cars/:id` — Delete listing (owner only)
- `POST /api/auth/sign-up/email` — Register
- `POST /api/auth/sign-in/email` — Login
- `POST /api/auth/sign-out` — Logout
- `GET /api/auth/get-session` — Current session
- `POST /api/inquiries` — Send inquiry (buyer)
- `GET /api/inquiries/mine` — Dealer received inquiries
- `GET /api/inquiries/sent` — Buyer sent inquiries

## Project Structure
```
autobazar/
├── client/                 # Next.js frontend
│   ├── app/                # App Router pages
│   ├── components/         # React components
│   └── lib/                # Client auth config
├── server/                 # Express backend
│   ├── config/             # MongoDB, Cloudinary config
│   ├── controllers/        # Business logic
│   ├── middleware/          # Auth, file upload
│   ├── models/             # Mongoose schemas
│   └── routes/             # API route handlers
└── agents/                 # Agent workflows & plans
    └── workflows/
        └── phase-6.md      # Deployment plan
```

## License
MIT