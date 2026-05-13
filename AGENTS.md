# AutoBazaar — Project Context

AutoBazaar is a full-stack car dealer marketplace.
Dealers list cars for sale. Buyers browse and send inquiries.

## Two user roles
- `dealer` — create/edit/delete listings, view inquiries
- `buyer` — browse listings, send inquiries (default on register)

## Tech stack
- Frontend: Next.js 14+ App Router, JavaScript (no TypeScript), Tailwind CSS
- Backend: Node.js + Express.js, ESModules only (import/export — never require)
- Database: MongoDB via Mongoose
- Auth: Better Auth (email + password)
- File uploads: Cloudinary (Phase 2 onwards)

## Folder structure
```
autobazaar/
├── AGENTS.md
├── client/                     Next.js frontend (port 3000)
│   ├── app/
│   │   ├── layout.js
│   │   ├── page.js
│   │   ├── (auth)/login/page.js
│   │   ├── (auth)/register/page.js
│   │   └── dashboard/page.js
│   ├── lib/auth-client.js      Better Auth client config
│   ├── components/
│   └── .env.local
└── server/                     Express backend (port 5000)
    ├── index.js
    ├── config/db.js
    ├── lib/auth.js             Better Auth server config
    ├── models/Car.js           Phase 2+
    ├── models/Inquiry.js       Phase 5+
    ├── routes/auth.js
    ├── routes/cars.js          Phase 2+
    ├── routes/inquiries.js     Phase 5+
    ├── middleware/protect.js
    └── .env
```

## Environment variables

server/.env
```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/autobazaar
BETTER_AUTH_SECRET=<random_32_char_string>
PORT=5000
CLIENT_URL=http://localhost:3000
```

client/.env.local
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## API routes
- POST /api/auth/sign-up/email — register
- POST /api/auth/sign-in/email — login
- POST /api/auth/sign-out — logout
- GET  /api/auth/get-session — current session
- GET  /api/cars — public listings (Phase 2+)
- GET  /api/cars/mine — dealer's own listings (Phase 4+)
- POST /api/cars — create listing, dealer only (Phase 2+)
- PUT  /api/cars/:id — update, dealer owner only (Phase 2+)
- DELETE /api/cars/:id — delete, dealer owner only (Phase 2+)
- POST /api/inquiries — buyer sends inquiry (Phase 5+)
- GET  /api/inquiries/mine — dealer views inquiries (Phase 5+)
- GET  /api/inquiries/sent — buyer views sent inquiries (Phase 5+)

## Build phases
| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Setup + MongoDB + Express + Better Auth | ✅ Done |
| 2 | Car listing CRUD + Cloudinary upload | ✅ Done |
| 3 | Public browse + search + filters | ✅ Done |
| 4 | Dealer dashboard + role-based access | ✅ Done |
| 5 | Buyer inquiry system | ✅ Done |
| 6 | Deploy to Vercel + Render + MongoDB Atlas | 🔲 |

Update 🔲 to ✅ when a phase is complete and tested.