/**
 * Seed Script — Super Admin Account Setup
 *
 * WHAT: Creates the Super Admin user, or promotes an existing user to admin.
 * WHY:  The public sign-up endpoint can no longer assign the "admin" role, so
 *       admins are made here by a direct database update.
 *
 * USAGE (no password is stored in the repo):
 *   ADMIN_EMAIL=you@company.com ADMIN_PASSWORD='a-long-random-password' \
 *     npm run seed:admin
 *
 * The dev server must be running locally (it hashes the password through
 * Better Auth) when the account does not exist yet.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? "";
const appUrl = process.env.SEED_APP_URL ?? "http://localhost:3000";

async function main() {
  if (!email) {
    throw new Error("Set ADMIN_EMAIL before running this script.");
  }

  const existing = await sql`
    SELECT id FROM "user" WHERE email = ${email}
  `;

  if (existing.length > 0) {
    await sql`UPDATE "user" SET role = 'admin' WHERE email = ${email}`;
    console.log(`✓ Existing user ${email} promoted to admin (password unchanged).`);
    return;
  }

  if (password.length < 12) {
    throw new Error("Set ADMIN_PASSWORD (min 12 characters) to create a new admin.");
  }

  // Sign up as a normal buyer (the hook ignores role=admin), then promote.
  const res = await fetch(`${appUrl}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: appUrl },
    body: JSON.stringify({ name: "AutoBazaar Admin", email, password }),
  });
  const json = (await res.json()) as { user?: { id: string }; message?: string };
  if (!res.ok || !json.user) {
    throw new Error(`Sign-up failed: ${json.message ?? res.status}`);
  }

  await sql`UPDATE "user" SET role = 'admin' WHERE id = ${json.user.id}`;
  console.log(`✓ Admin ${email} created.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
