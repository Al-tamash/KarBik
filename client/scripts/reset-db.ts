import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  await sql`drop schema if exists public cascade`;
  await sql`create schema public`;
  console.log("public schema reset");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
