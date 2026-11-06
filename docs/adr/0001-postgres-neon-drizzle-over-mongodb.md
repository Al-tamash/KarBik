# Postgres (Neon) with Drizzle replaces MongoDB with Mongoose

AutoBazaar outgrew MongoDB: the data is highly relational (listings → dealers → plans → payments → inquiries), and Mongo's `$lookup` aggregations were fighting the grain. We decided to move the database to Postgres hosted on Neon, accessed through Drizzle ORM, and to start fresh (no data migration from Atlas) since the project has no production data.

Key choices made during grilling:

- **Drizzle ORM** over Prisma (lighter, Neon's official pairing, first-class Better Auth adapter) and over raw `pg` (too much hand-written SQL for this team size).
- **`@neondatabase/serverless` + `drizzle-orm/neon-http`** driver — deploy target is Vercel functions, where HTTP-based connections avoid pooling problems entirely.
- **UUID primary keys** (`gen_random_uuid()`) instead of sequential IDs — listing/record IDs appear in public URLs and we don't want to leak volume.
- **JSONB columns** for embedded-document shapes (`Car.features`, `Car.images`, `inspectionReport`, `bannerImage`, `socialLinks`, web-push `subscription`) — these are read/write-as-a-whole blobs; separate tables would be join overhead with no querying need.
- **`pgEnum`s** for stable enumerations (fuel type, transmission, owners, inquiry status, payment/subscription status).
- **Postgres full-text search**: generated `tsvector` column over title/brand/model/variant + GIN index + `websearch_to_tsquery()`, replacing Mongo `$text`. Chosen over `ILIKE` which degrades with scale.
- **Versioned migrations**: `drizzle-kit generate` output committed to the repo and applied via `migrate` — not schema `push`.
- **Better Auth** switches from `mongodbAdapter(rawDb)` to its Drizzle adapter; the role field (`buyer`/`dealer`) and sign-up hook behaviour are preserved as-is.

Considered and rejected: Prisma (heavier runtime, cold starts), keeping Mongo (relational pain was the reason for the move), migrating existing data (none worth keeping).

## Consequences

- All aggregation pipelines (`$lookup`, `$group`, `$addFields`) become plain SQL joins/group-bys via Drizzle — simpler than their Mongo equivalents.
- Mongoose models in `server/models/*` are replaced by a single typed Drizzle schema; TypeScript types derive from table definitions.
