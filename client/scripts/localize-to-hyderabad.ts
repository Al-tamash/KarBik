/**
 * Script: Localize AutoBazaar Platform 100% to Hyderabad
 *
 * WHAT: Converts all 3 dealerships, all 50 car listings, and all customer reviews
 *       into authentic Hyderabad pre-owned automotive businesses:
 *       1. Apex Motors (Jubilee Hills, Hyderabad)
 *       2. Heritage Autocraft (Banjara Hills, Hyderabad)
 *       3. Southgate Motors (Gachibowli / Financial District, Hyderabad)
 *       Every vehicle registration is mapped to official Telangana RTO formats (TS 07, TS 08, TS 09, TS 10, TS 11, TS EV)
 *       and descriptions reference Hyderabad authorized dealerships (Varun, KUN, Neon, Harsha, JSP, Silver Star).
 * WHY: Meets the exact business requirement that AutoBazaar is exclusively a
 *      Hyderabad-focused pre-owned car dealer marketplace.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, sql } from "drizzle-orm";
import * as schema from "../lib/db/schema";

const db = drizzle(neon(process.env.DATABASE_URL!), { schema });

const DEALER_1_ID = "uDwklQTGKyEYO32PTG35FkFQLwkiN959";
const DEALER_2_ID = "dealer_heritage_mumbai_02";
const DEALER_3_ID = "dealer_southgate_blr_03";

async function main() {
  console.log("🏙️  Starting 100% Hyderabad Platform Localization...");

  // ─── 1. Update Dealer User Names ───
  await db
    .update(schema.user)
    .set({ name: "Apex Motors (Jubilee Hills, Hyderabad)" })
    .where(eq(schema.user.id, DEALER_1_ID));

  await db
    .update(schema.user)
    .set({
      name: "Heritage Autocraft (Banjara Hills, Hyderabad)",
      email: "contact@heritageautocraft-hyd.in",
    })
    .where(eq(schema.user.id, DEALER_2_ID));

  await db
    .update(schema.user)
    .set({
      name: "Southgate Motors (Gachibowli, Hyderabad)",
      email: "sales@southgatemotors-hyd.com",
    })
    .where(eq(schema.user.id, DEALER_3_ID));

  console.log("✓ Updated dealer user accounts for Hyderabad.");

  // ─── 2. Update Dealer Profiles ───
  await db
    .update(schema.dealerProfiles)
    .set({
      businessName: "Apex Motors - Certified Pre-Owned Jubilee Hills",
      city: "Hyderabad",
      address: "Plot 42, Road No. 36, Jubilee Hills, Near Peddamma Gudi Metro, Hyderabad, Telangana - 500033",
      phone: "+91 98490 12345",
      about:
        "Established in 2014 on Road No. 36, Jubilee Hills, Apex Motors is one of Hyderabad's most trusted certified pre-owned car showrooms. Every vehicle undergoes our 150-point technical inspection with verified Telangana (TS) RTO transfer assistance, documented authorized service records, and a 7-day money-back guarantee.",
      socialLinks: {
        whatsapp: "+919849012345",
        instagram: "apexmotors_hyderabad",
        facebook: "apexmotors.hyderabad",
      },
    })
    .where(eq(schema.dealerProfiles.user, DEALER_1_ID));

  await db
    .update(schema.dealerProfiles)
    .set({
      businessName: "Heritage Autocraft - Banjara Hills Pre-Owned",
      city: "Hyderabad",
      address: "Road No. 12, Banjara Hills, Opp. Fortune Park Vallabha, Hyderabad, Telangana - 500034",
      phone: "+91 98480 54321",
      about:
        "Located in the heart of Banjara Hills, Heritage Autocraft specializes in certified pre-owned executive sedans, German luxury saloons, and top-tier family MPVs in Hyderabad. 100% verified single-owner Telangana registered vehicles with complete authorized dealership history.",
      socialLinks: {
        whatsapp: "+919848054321",
        instagram: "heritageautocraft_hyd",
        facebook: "heritageautocraft.hyd",
      },
    })
    .where(eq(schema.dealerProfiles.user, DEALER_2_ID));

  await db
    .update(schema.dealerProfiles)
    .set({
      businessName: "Southgate Motors - Gachibowli Tech Hub",
      city: "Hyderabad",
      address: "Financial District Main Road, Near Wipro Circle, Gachibowli, Hyderabad, Telangana - 500032",
      phone: "+91 98481 98765",
      about:
        "Situated in Hyderabad's Cyberabad/Financial District corridor. Southgate Motors is Hyderabad's specialist in tech-commuter sedans, crossovers, and certified electric vehicles with 200-point battery diagnostics, transparent TS RTO documentation, and 1-year roadside assistance.",
      socialLinks: {
        whatsapp: "+919848198765",
        instagram: "southgate_hyderabad",
        facebook: "southgatemotors.hyd",
      },
    })
    .where(eq(schema.dealerProfiles.user, DEALER_3_ID));

  console.log("✓ Updated all 3 dealer profiles with Hyderabad addresses and phone numbers.");

  // ─── 3. Localize Customer Reviews to Hyderabad ───
  await db.delete(schema.reviews);

  const hyderabadReviews = [
    // Apex Motors (Jubilee Hills)
    {
      dealer: DEALER_1_ID,
      buyerName: "K. Venkat Reddy",
      buyerId: "buyer_hyd_1",
      rating: 5,
      comment:
        "Purchased a 2023 Hyundai Creta from Apex Motors on Road 36, Jubilee Hills. The car is in mint showroom condition. Their 150-point inspection report was totally accurate and TS RTO transfer was completed in a week.",
    },
    {
      dealer: DEALER_1_ID,
      buyerName: "Mohammed Zameer",
      buyerId: "buyer_hyd_2",
      rating: 5,
      comment:
        "Very transparent pre-owned showroom in Hyderabad. Took a test drive on the Outer Ring Road. No meter tampering, verified service records directly with Neon Motors.",
    },
    {
      dealer: DEALER_1_ID,
      buyerName: "Sai Teja",
      buyerId: "buyer_hyd_3",
      rating: 5,
      comment:
        "Got our family Honda City certified by an independent mechanic in Madhapur and everything matched Apex Motors' inspection report. Best car dealer in Hyderabad!",
    },
    {
      dealer: DEALER_1_ID,
      buyerName: "P. Harsha Vardhan",
      buyerId: "buyer_hyd_4",
      rating: 4,
      comment:
        "Good collection of automatic SUVs in Jubilee Hills. Fair fixed-pricing policy without hard bargaining. Staff is courteous.",
    },
    {
      dealer: DEALER_1_ID,
      buyerName: "Vikram Rao",
      buyerId: "buyer_hyd_5",
      rating: 5,
      comment:
        "Smooth delivery and crystal-clear vehicle title. Bought a Mahindra Thar 4x4 with TS09 registration. Highly recommended!",
    },

    // Heritage Autocraft (Banjara Hills)
    {
      dealer: DEALER_2_ID,
      buyerName: "Dr. Archana Reddy",
      buyerId: "buyer_hyd_6",
      rating: 5,
      comment:
        "Bought a 2021 Toyota Innova Crysta from Heritage Autocraft on Road 12, Banjara Hills. Genuine single-owner car with full Harsha Toyota Hyderabad service history.",
    },
    {
      dealer: DEALER_2_ID,
      buyerName: "G. Srinivas",
      buyerId: "buyer_hyd_7",
      rating: 5,
      comment:
        "Impressed by their luxury collection in Banjara Hills. Verified paint thickness and battery health before delivery. Hassle-free TS07 transfer.",
    },
    {
      dealer: DEALER_2_ID,
      buyerName: "Farhan Ali Khan",
      buyerId: "buyer_hyd_8",
      rating: 5,
      comment:
        "Purchased a BMW X1 from Heritage Autocraft. KUN Exclusive Khairatabad verified complete service stamps. Professional and courteous team.",
    },

    // Southgate Motors (Gachibowli)
    {
      dealer: DEALER_3_ID,
      buyerName: "Praveen Kumar",
      buyerId: "buyer_hyd_9",
      rating: 5,
      comment:
        "Working at Hitec City and bought a Tata Nexon EV from Southgate Motors Gachibowli. Battery diagnostic was 97% health. Very knowledgeable EV specialists in Hyderabad.",
    },
    {
      dealer: DEALER_3_ID,
      buyerName: "S. Nithya",
      buyerId: "buyer_hyd_10",
      rating: 5,
      comment:
        "Great experience buying our Maruti Baleno automatic. Quick doorstep test drive in Kondapur and prompt delivery. Honest dealership.",
    },
    {
      dealer: DEALER_3_ID,
      buyerName: "Srikanth Varma",
      buyerId: "buyer_hyd_11",
      rating: 5,
      comment:
        "Excellent selection of hybrid and automatic cars near Financial District. Clear Karnataka and Telangana RTO assistance.",
    },
  ];

  await db.insert(schema.reviews).values(hyderabadReviews);
  console.log(`✓ Inserted ${hyderabadReviews.length} Hyderabad customer reviews.`);

  // ─── 4. Convert All 50 Cars to Hyderabad City and Telangana Plates ───
  const allCars = await db.select().from(schema.cars);
  console.log(`Processing ${allCars.length} cars for Hyderabad localization...`);

  // Telangana RTO series:
  // TS 09: Khairatabad / Jubilee Hills / Banjara Hills
  // TS 07: Ranga Reddy / Gachibowli / Madhapur
  // TS 08: Medchal-Malkajgiri / Kukatpally / Secunderabad
  // TS 10: Secunderabad
  // TS 11: Malakpet / Charminar

  const tsPlates = [
    // Dealer 1 (Jubilee Hills)
    "TS 09 EU 1248",
    "TS 09 FA 4291",
    "TS 09 EQ 1109",
    "TS 09 EA 7714",
    "TS 09 FB 5521",
    "TS 09 DX 4004",
    "TS 09 EM 3812",
    "TS 09 EL 6219",
    "TS 09 FC 0099",
    "TS 09 EZ 8412",
    "TS 09 FD 7120",
    "TS 09 EX 3341",
    "TS 09 EY 4114",
    "TS 09 DW 9921",
    "TS 09 FE 1122",
    "TS 09 DZ 4321",
    "TS 09 DY 9119",
    "TS 09 FF 4880",
    "TS 09 EV 8092", // Tiago EV
    "TS 09 FG 0003", // BMW 3 Series

    // Dealer 2 (Banjara Hills)
    "TS 07 FL 4810",
    "TS 07 FK 7700",
    "TS 07 FJ 8812",
    "TS 07 FH 1919",
    "TS 07 FG 3301",
    "TS 07 FF 6211",
    "TS 07 FE 2244",
    "TS 07 FD 9900",
    "TS 07 FC 0077",
    "TS 07 FB 0008",
    "TS 07 FA 4411",
    "TS 07 EZ 1100",
    "TS 07 EV 4010", // Punch EV
    "TS 07 EY 1947",
    "TS 07 EX 0055",

    // Dealer 3 (Gachibowli)
    "TS 08 EN 4410",
    "TS 08 EM 9102",
    "TS 08 EL 7819",
    "TS 08 EV 1008", // Nexon EV
    "TS 08 EV 5521", // ZS EV
    "TS 08 EK 0033",
    "TS 08 EJ 8821",
    "TS 08 EH 3190",
    "TS 08 EG 7712",
    "TS 08 EF 0099",
    "TS 08 EE 2289",
    "TS 08 ED 5104",
    "TS 08 EC 8920",
    "TS 08 EB 1199",
    "TS 08 EA 0005",
  ];

  for (let i = 0; i < allCars.length; i++) {
    const car = allCars[i];
    const plate = tsPlates[i] || `TS 09 HY ${1000 + i}`;

    // Clean description to reference Hyderabad locations and workshops
    let desc = car.description
      .replace(/Delhi NCR|Delhi West|Delhi|Mumbai|Gurugram|Gurgaon|Noida|Bengaluru|Bangalore/g, "Hyderabad")
      .replace(/South Hyderabad/g, "Banjara Hills, Hyderabad")
      .replace(/HR26|HR 26|DL|MH 01|MH 02|MH 03|MH 04|KA 01|KA 03|KA 04|KA 05|UP 16/g, plate.slice(0, 5))
      .replace(/Prime Honda/g, "JSP Honda Hyderabad")
      .replace(/Himgiri Hyundai/g, "KUN Hyundai Hyderabad")
      .replace(/Advaith Hyundai/g, "Fusion Hyundai Hyderabad")
      .replace(/Espirit Toyota|Lakozy Toyota/g, "Harsha Toyota Hyderabad")
      .replace(/Magnum Honda/g, "Pride Honda Hyderabad")
      .replace(/Auto Hangar/g, "Silver Star Mercedes-Benz Hyderabad")
      .replace(/Infinity Cars/g, "KUN Exclusive BMW Hyderabad")
      .replace(/Maruti Arena/g, "Varun Motors Hyderabad")
      .replace(/Nexa Koramangala|Nexa/g, "Nexa Jubilee Hills, Hyderabad")
      .replace(/Landmark Jeep/g, "PPS Jeep Hyderabad")
      .replace(/Skoda Gurugram/g, "Mahavir Skoda Hyderabad")
      .replace(/VW Bandra|VW Delhi West/g, "Mody Volkswagen Hyderabad")
      .replace(/MG Thane|MG Electronic City/g, "Raam MG Hyderabad")
      .replace(/Whitefield/g, "Gachibowli")
      .replace(/Koramangala/g, "Hitec City")
      .replace(/BKC|Bandra/g, "Banjara Hills");

    await db
      .update(schema.cars)
      .set({
        city: "Hyderabad",
        registrationNumber: plate,
        description: desc,
      })
      .where(eq(schema.cars.id, car.id));
  }

  console.log(`✓ All 50 cars successfully localized to city='Hyderabad' with official Telangana (TS) plates!`);
  console.log("\n🎉 PLATFORM IS NOW 100% HYDERABAD-BASED!");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error during localization:", err);
    process.exit(1);
  });

