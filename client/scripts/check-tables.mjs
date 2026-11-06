import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const r =
  await sql`select table_name from information_schema.tables where table_schema='public' order by table_name`;
console.log(r.map((t) => t.table_name).join(", "));
