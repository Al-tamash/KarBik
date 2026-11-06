/**
 * CarDekho Image Scraper for Dealer 2 & Dealer 3
 *
 * WHAT: Queries CarDekho's exterior gallery pages for 30 vehicle models
 *       and extracts official 930x620 CDN photo URLs.
 * WHY: Provides real, multi-angle manufacturer photography for all 30
 *      new cars across the Mumbai and Bengaluru dealerships.
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import fs from "fs";

async function getImagesForCar(slug: string): Promise<string[]> {
  try {
    const url = `https://www.cardekho.com/${slug}/pictures/exterior`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    const html = await res.text();
    const regex =
      /https:\/\/stimg\.cardekho\.com\/images\/carexteriorimages\/930x620\/[^\s"'<>]+/g;
    const matches = html.match(regex);
    if (!matches) return [];
    const unique = [...new Set(matches.map((m) => m.split("?")[0]))];
    return unique.filter((u) => u.endsWith(".jpg") || u.endsWith(".webp"));
  } catch (e) {
    console.error("Error fetching", slug, e);
    return [];
  }
}

async function main() {
  const cars = [
    // Dealer 2 (Heritage Autocraft - Mumbai)
    "toyota/innova-crysta",
    "jeep/compass",
    "volkswagen/taigun",
    "skoda/kushaq",
    "hyundai/alcazar",
    "kia/carens",
    "honda/elevate",
    "mg/gloster",
    "maruti/invicto",
    "mercedes-benz/c-class",
    "audi/a4",
    "bmw/x1",
    "tata/punch-ev",
    "mahindra/thar-roxx",
    "toyota/camry",

    // Dealer 3 (Southgate Motors - Bengaluru)
    "maruti/fronx",
    "hyundai/venue",
    "kia/sonet",
    "tata/nexon-ev",
    "mg/zs-ev",
    "mahindra/xuv-3xo",
    "maruti/baleno",
    "tata/altroz",
    "toyota/urban-cruiser-hyryder",
    "hyundai/tucson",
    "honda/amaze",
    "nissan/magnite",
    "maruti/ertiga",
    "mahindra/bolero-neo",
    "toyota/hilux",
  ];

  const results: Record<string, string[]> = {};
  for (const car of cars) {
    let imgs = await getImagesForCar(car);

    // Fallbacks if alternate slug naming is used
    if (imgs.length === 0) {
      if (car === "mahindra/xuv-3xo") imgs = await getImagesForCar("mahindra/xuv300");
      if (car === "toyota/urban-cruiser-hyryder") imgs = await getImagesForCar("toyota/hyryder");
      if (car === "mahindra/thar-roxx") imgs = await getImagesForCar("mahindra/thar");
      if (car === "tata/punch-ev") imgs = await getImagesForCar("tata/punch");
    }

    results[car] = imgs.slice(0, 4);
    console.log(`${car}: ${imgs.length} images found`);
  }

  fs.writeFileSync("scripts/cardekho-images-dealer2-3.json", JSON.stringify(results, null, 2));
  console.log("✓ Saved scripts/cardekho-images-dealer2-3.json successfully!");
}

main();

