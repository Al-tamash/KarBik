# Big-bang TypeScript conversion at maximum strictness

The codebase was plain JavaScript (one `jsconfig.json`, no types anywhere). As part of the rewrite we decided to convert both the frontend and all ported backend code to TypeScript in a single dedicated branch, with `"strict": true` enabled from day one — not incrementally with `allowJs`.

Why: the rewrite already touches nearly every file (database layer replaced, API relocated), so the marginal cost of converting a file is near zero during the rewrite and high after it. Loose-first typing would leave a mixed JS/TS codebase for months and strict mode retrofitted later is notoriously painful.

Related choices:

- **Server-side code converts first**, establishing typed API contracts before the larger client surface is converted against them.
- **`shared/` package (zod schemas)** remains the source of truth for input validation, exporting inferred types (`z.infer<>`) consumed by both client and route handlers.
- Verification is a manual smoke-test checklist per feature group (auth, listings CRUD, uploads, inquiries, payments, boosts, analytics, reviews, wishlist, push) — no test framework is introduced during the rewrite itself.

Considered and rejected: incremental `allowJs` migration (prolongs the mixed state), lenient tsconfig first (defeats the purpose of the rewrite).
