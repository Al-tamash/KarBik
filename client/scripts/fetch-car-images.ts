import { config } from "dotenv";
config({ path: ".env.local" });
import fs from "fs";

async function getImagesForCar(slug: string) {
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
    "hyundai/creta",
    "tata/nexon",
    "mahindra/thar",
    "maruti/brezza",
    "kia/seltos",
    "toyota/fortuner",
    "honda/city",
    "hyundai/i20",
    "tata/harrier",
    "volkswagen/virtus",
    "mahindra/xuv700",
    "maruti/grand-vitara",
    "skoda/slavia",
    "maruti/swift",
    "tata/safari",
    "mg/hector",
    "hyundai/verna",
    "mahindra/scorpio-n",
    "tata/tiago-ev",
    "bmw/3-series",
  ];

  const results: Record<string, string[]> = {};
  for (const car of cars) {
    const imgs = await getImagesForCar(car);
    results[car] = imgs.slice(0, 4);
  }

  fs.writeFileSync("scripts/cardekho-images.json", JSON.stringify(results, null, 2));
  console.log("Saved scripts/cardekho-images.json successfully!");
}

main();
