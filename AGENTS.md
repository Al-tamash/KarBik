# AutoBazaar — Project Context

AutoBazaar is a full-stack car dealer marketplace.
Dealers list cars for sale. Buyers browse and send inquiries.

## Architecture

Single Next.js 16 app (App Router, TypeScript strict) deployed on Vercel.
API lives in `client/app/api/**` route handlers. Database is Postgres on Neon,
accessed via Drizzle ORM (neon-http driver). Auth is Better Auth with the
drizzle adapter, mounted at `/api/auth/[...all]`.

See `docs/adr/` for the key decisions and `CONTEXT.md` for domain language.

## Two user roles

- `dealer` — create/edit/delete listings, view inquiries
- `buyer` — browse listings, send inquiries (default on register)

## Tech stack

- Framework: Next.js 16 App Router + React 19, TypeScript (`strict: true`)
- Styling: Tailwind CSS 4
- API: Next.js Route Handlers (`app/api/**/route.ts`)
- Database: PostgreSQL on Neon via Drizzle ORM (`@neondatabase/serverless`, `neon-http`)
- Auth: Better Auth (`better-auth/adapters/drizzle`), email + password
- Validation: Zod schemas in `shared/` (single source of truth for both client & API)
- File uploads: Cloudinary (intake via `request.formData()`)
- Payments: Razorpay; AI: Google Gemini; Push: web-push (VAPID)

## Folder structure

```
autobazaar/
├── AGENTS.md
├── CONTEXT.md                      # Domain glossary
├── docs/adr/                       # Architecture decision records
├── shared/                         # @autobazaar/shared — zod schemas + TS types
│   ├── index.ts
│   ├── types.ts                    # CloudFile, CarFeatures, PlanFeatures, enums…
│   └── validation.ts               # searchCarsSchema, createCarSchema…
└── client/                         # The entire app (port 3000)
    ├── drizzle.config.ts
    ├── drizzle/0000_init.sql       # Versioned migrations (committed)
    ├── lib/
    │   ├── db/{schema.ts,index.ts} # Drizzle schema + neon-http client
    │   ├── auth.ts                 # Better Auth server config
    │   ├── auth-client.ts          # useAppSession() typed hook
    │   ├── guards.ts               # requireUser / requireDealer / ApiError / apiHandler
    │   ├── api-types.ts            # JSON shapes returned by the API
    │   ├── form.ts                 # formData parsing helpers
    │   └── …                       # cloudinary-server, razorpay-server, gemini, vahan, push
    ├── app/
    │   ├── api/
    │   │   ├── auth/[...all]/route.ts
    │   │   ├── cars/…              # list/create, brands, mine, upload, [id], verify-vehicle
    │   │   ├── dealers/…           # list, check-slug, profile, [slug]
    │   │   ├── inquiries/…         # create, mine, sent, check, [id]/{status,notes,follow-up,whatsapp}
    │   │   ├── wishlist/…          # get, check, toggle
    │   │   ├── payments/…          # create-order, verify
    │   │   ├── subscriptions/…     # plans, my-plan
    │   │   ├── boosts/…            # cars/[id], cars/[id]/status, verify
    │   │   ├── ai/…                # description, price-estimate, specs
    │   │   ├── analytics/dashboard
    │   │   ├── trust/…             # verify, reviews, reviews/:dealerId, profile/:dealerId
    │   │   └── notifications/subscribe
    │   └── …                       # pages (all .tsx)
    ├── components/                 # all .tsx
    ├── scripts/                    # migrate.ts, reset-db.ts, seedPlans.ts, rotateSecrets.ts
    └── .env.local
```

## Environment variables

client/.env.local

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://<user>:<pass>@<ep-pooler>.neon.tech/neondb?sslmode=require
BETTER_AUTH_SECRET=<random_32_char_string>
CLOUDINARY_CLOUD_NAME=…
CLOUDINARY_API_KEY=…
CLOUDINARY_API_SECRET=…
RAZORPAY_KEY_ID=…
RAZORPAY_KEY_SECRET=…
GEMINI_API_KEY=…
VAPID_PUBLIC_KEY=…
VAPID_PRIVATE_KEY=…
```

## Common commands (run inside client/)

```
npm run dev          # dev server
npm run build        # production build
npm run lint         # eslint
npm run db:generate  # generate SQL migration from schema changes
npm run db:migrate   # apply migrations to Neon
npm run db:reset     # drop + recreate public schema (dev only!)
npm run seed:plans   # upsert Free/Starter/Pro plans
```

## Conventions

- All application code is TypeScript strict — do not add `.js/.jsx` files.
- Server-side fetches need absolute URLs (`lib/api-base.ts`); browser code uses relative `/api/...`.
- Guards: call `requireUser()` / `requireDealer()` inside route handlers; wrap handlers with `apiHandler()`.
- User IDs are Better Auth strings; entity PKs are UUIDs.
- Embedded/nested documents are JSONB columns; stable enums are `pgEnum`s.
