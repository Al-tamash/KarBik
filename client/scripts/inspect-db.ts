import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const [totalCars] = await sql`SELECT count(*) FROM cars`;
  console.log("Total Cars:", totalCars.count);

  const dealers = await sql`SELECT id, "businessName", slug, city, "isVerified", "averageRating", "totalReviews" FROM dealer_profiles`;
  console.log("Dealers:", dealers);

  const carsPerDealer = await sql`SELECT "dealer", count(*) as count FROM cars GROUP BY "dealer"`;
  console.log("Cars per Dealer:", carsPerDealer);

  const [reviews] = await sql`SELECT count(*) FROM reviews`;
  console.log("Total Reviews:", reviews.count);

  const sampleCars = await sql`SELECT title, city, "registrationNumber" FROM cars LIMIT 6`;
  console.log("Sample Cars:", sampleCars);
}

main();
