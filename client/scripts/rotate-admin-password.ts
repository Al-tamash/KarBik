/**
 * rotate-admin-password.ts — replace an admin's password with a new one.
 *
 * WHY: scripts/seed-admin.ts used to create admin@autobazaar.com with a
 *      password that was committed to the repo. Treat that password as public
 *      and run this once against production.
 *
 * USAGE:
 *   ADMIN_EMAIL=admin@autobazaar.com NEW_ADMIN_PASSWORD='long-random-password' \
 *     npm run admin:rotate-password
 *
 * It hashes with Better Auth's own hasher, updates only that user's credential
 * account, and revokes the user's existing sessions. Nothing is printed except
 * the outcome.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import { hashPassword } from "better-auth/crypto";

const sql = neon(process.env.DATABASE_URL!);

const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
const newPassword = process.env.NEW_ADMIN_PASSWORD ?? "";

async function main() {
  if (!email) throw new Error("Set ADMIN_EMAIL.");
  if (newPassword.length < 12) {
    throw new Error("Set NEW_ADMIN_PASSWORD (min 12 characters).");
  }

  const [adminUser] = await sql`
    SELECT id, role FROM "user" WHERE email = ${email}
  `;
  if (!adminUser) throw new Error(`No user found for ${email}.`);
  if (adminUser.role !== "admin") {
    throw new Error(`${email} is not an admin; refusing to touch its password.`);
  }

  const hash = await hashPassword(newPassword);
  const updated = await sql`
    UPDATE account
    SET password = ${hash}, "updatedAt" = now()
    WHERE "userId" = ${adminUser.id} AND "providerId" = 'credential'
    RETURNING id
  `;
  if (updated.length === 0) {
    throw new Error("This admin has no email/password credential to rotate.");
  }

  await sql`DELETE FROM session WHERE "userId" = ${adminUser.id}`;
  console.log(`✓ Password rotated for ${email}; existing sessions revoked.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
