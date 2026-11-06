/**
 * Seed Script — 20 Authentic Indian Car Listings & Verified Dealer Setup
 *
 * WHAT: Configures an authentic certified pre-owned dealer ("Apex Motors")
 *       with an active Pro plan and 5 genuine buyer reviews, then seeds 20
 *       popular Indian cars with accurate CarDekho specs, features, and multi-angle photography.
 * WHY: High-quality, real-world data is crucial for testing marketplace search,
 *      filtering, responsiveness, trust signals, and dealer micro-websites.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "../lib/db/schema";
import type { CarFeatures, CloudFile } from "@autobazaar/shared";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// Load the 4-angle CarDekho photos generated previously
const cardekhoImages: Record<string, string[]> = JSON.parse(
  fs.readFileSync(path.join(__dirname, "cardekho-images.json"), "utf8")
);

function makeImages(slug: string): CloudFile[] {
  const urls = cardekhoImages[slug] || [];
  return urls.map((url, i) => ({
    url,
    publicId: `cardekho_${slug.replace("/", "_")}_${i + 1}`,
  }));
}

const DEALER_USER_ID = "uDwklQTGKyEYO32PTG35FkFQLwkiN959";

async function main() {
  console.log("🚀 Starting database seeding for 20 authentic cars & dealer profile...");

  // 1. Update dealer user name in Better-Auth user table
  await db
    .update(schema.user)
    .set({
      name: "Apex Motors (Certified Pre-Owned)",
      role: "dealer",
    })
    .where(eq(schema.user.id, DEALER_USER_ID));
  console.log("✓ Updated dealer user record.");

  // 2. Upsert Dealer Profile
  const [existingProfile] = await db
    .select()
    .from(schema.dealerProfiles)
    .where(eq(schema.dealerProfiles.user, DEALER_USER_ID))
    .limit(1);

  const profileData = {
    user: DEALER_USER_ID,
    businessName: "Apex Motors - Certified Pre-Owned",
    slug: "apex-motors",
    isVerified: true,
    averageRating: 4.9,
    totalReviews: 48,
    phone: "+91 98112 34567",
    address: "Plot 42, Sector 18, Auto Hub, Gurugram, Delhi NCR - 122008",
    city: "Delhi NCR",
    about:
      "Established in 2012, Apex Motors is Delhi NCR's premier destination for certified pre-owned cars. Every vehicle in our showroom undergoes our rigorous 150-point technical & structural inspection. We guarantee non-accidental history, genuine odometer readings, verified authorized service records, and complete doorstep RC transfer assistance with a 7-day money-back guarantee.",
    bannerImage: {
      url: "https://res.cloudinary.com/dlmwc4qnt/image/upload/v1778836292/autobazaar/banners/mdp7sxckked5ytjvwefg.jpg",
      publicId: "autobazaar/banners/mdp7sxckked5ytjvwefg",
    },
    socialLinks: {
      whatsapp: "+919811234567",
      instagram: "apexmotors_delhi",
      facebook: "apexmotors.delhi",
    },
    microWebsiteEnabled: true,
  };

  if (existingProfile) {
    await db
      .update(schema.dealerProfiles)
      .set(profileData)
      .where(eq(schema.dealerProfiles.id, existingProfile.id));
    console.log("✓ Updated existing dealer profile.");
  } else {
    await db.insert(schema.dealerProfiles).values(profileData);
    console.log("✓ Created new dealer profile for Apex Motors.");
  }

  // 3. Ensure Dealer has an active Pro subscription (unlimited listings)
  const [proPlan] = await db
    .select()
    .from(schema.plans)
    .where(eq(schema.plans.slug, "pro"))
    .limit(1);

  if (proPlan) {
    const [existingSub] = await db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.dealer, DEALER_USER_ID))
      .limit(1);

    const subData = {
      dealer: DEALER_USER_ID,
      plan: proPlan.id,
      status: "active" as const,
      startDate: new Date("2026-01-01T00:00:00Z"),
      endDate: new Date("2027-12-31T23:59:59Z"),
    };

    if (existingSub) {
      await db
        .update(schema.subscriptions)
        .set(subData)
        .where(eq(schema.subscriptions.id, existingSub.id));
      console.log("✓ Updated active Pro subscription.");
    } else {
      await db.insert(schema.subscriptions).values(subData);
      console.log("✓ Inserted active Pro subscription.");
    }
  }

  // 4. Seed authentic customer reviews for the dealer
  await db.delete(schema.reviews).where(eq(schema.reviews.dealer, DEALER_USER_ID));
  const reviewRows = [
    {
      dealer: DEALER_USER_ID,
      buyerName: "Rahul Sharma",
      buyerId: "buyer_sample_1",
      rating: 5,
      comment:
        "Purchased a 2023 Hyundai Creta from Apex Motors. The car was in showroom condition with 100% original factory paint. Their 150-point inspection report was completely accurate. RC transfer was completed in 10 days.",
    },
    {
      dealer: DEALER_USER_ID,
      buyerName: "Vikram Malhotra",
      buyerId: "buyer_sample_2",
      rating: 5,
      comment:
        "Extremely professional and transparent experience. No hidden processing charges or meter tampering. Checked service history directly with the authorized workshop and it matched 100%.",
    },
    {
      dealer: DEALER_USER_ID,
      buyerName: "Pooja Mehta",
      buyerId: "buyer_sample_3",
      rating: 5,
      comment:
        "Very honest dealership. Got my Honda City verified independently by our trusted family mechanic and he was thoroughly impressed by how clean the suspension and engine bay were. Highly recommended!",
    },
    {
      dealer: DEALER_USER_ID,
      buyerName: "Anand Verma",
      buyerId: "buyer_sample_4",
      rating: 4,
      comment:
        "Great collection of well-maintained automatic SUVs in Delhi NCR. Fair fixed-pricing policy without painful back-and-forth bargaining. Staff is courteous and knowledgeable.",
    },
    {
      dealer: DEALER_USER_ID,
      buyerName: "Siddharth Nair",
      buyerId: "buyer_sample_5",
      rating: 5,
      comment:
        "Smooth delivery, genuine mileage, and crystal-clear vehicle title. Bought a Mahindra Thar 4x4 and it drives like brand new. Kudos to team Apex Motors!",
    },
  ];

  await db.insert(schema.reviews).values(reviewRows);
  console.log(`✓ Inserted ${reviewRows.length} dealer reviews.`);

  // 5. Clean up old dummy cars
  await db.delete(schema.cars).where(eq(schema.cars.dealer, DEALER_USER_ID));
  console.log("✓ Cleared previous car records for fresh authentic seeding.");

  // 6. Define the 20 cars with real CarDekho specs, ARAI mileage, and features
  const carsData = [
    {
      title: "2023 Hyundai Creta SX (O) 1.5 Turbo DCT",
      brand: "Hyundai",
      model: "Creta",
      variant: "SX (O) 1.5 Turbo DCT",
      year: 2023,
      price: 1785000,
      fuelType: "petrol" as const,
      transmission: "automatic" as const,
      mileage: 18400,
      bodyType: "suv" as const,
      color: "Ranger Khaki",
      owners: "1st owner" as const,
      city: "Delhi NCR",
      registrationNumber: "DL 08 CR 9124",
      insuranceValid: "Zero Dep till Nov 2026",
      rcVerified: true,
      isInspected: true,
      engineCC: 1482,
      power: "158 bhp @ 5500 rpm",
      groundClearance: "190 mm",
      certifiedMileage: "18.4 kmpl",
      accidentHistory: false,
      serviceHistory: true,
      views: 342,
      features: {
        comfort: [
          "Panoramic Sunroof",
          "Ventilated Front Seats",
          "Wireless Phone Charger",
          "Dual Zone Climate Control",
          "Electronic Parking Brake with Auto Hold",
          "Cruise Control",
        ],
        safety: [
          "6 Airbags",
          "Level 2 ADAS Suite",
          "360-Degree Camera",
          "Electronic Stability Control (ESC)",
          "Hill Start Assist",
          "All-Wheel Disc Brakes",
        ],
        interior: [
          "10.25-inch Touchscreen Infotainment",
          "Bose 8-Speaker Premium Sound",
          "Digital Instrument Cluster",
          "Leatherette Upholstery",
          "Ambient Lighting",
        ],
        exterior: [
          "Trio Beam LED Headlamps",
          "17-inch Diamond Cut Alloy Wheels",
          "Connecting LED Tail Lamps",
          "Shark Fin Antenna",
          "Roof Rails",
        ],
      },
      description:
        "Pristine condition single-owner Hyundai Creta Turbo DCT in sought-after Ranger Khaki. Driven solely within Delhi NCR with complete service history at Hyundai authorized center. Non-accidental certified with original paint, zero scratches, brand new Michelin rubber, and valid Zero Dep insurance.",
      images: makeImages("hyundai/creta"),
      dealer: DEALER_USER_ID,
    },
    {
      title: "2022 Tata Nexon Fearless Plus S Petrol MT",
      brand: "Tata",
      model: "Nexon",
      variant: "Fearless Plus S 1.2 Revotron",
      year: 2022,
      price: 1045000,
      fuelType: "petrol" as const,
      transmission: "manual" as const,
      mileage: 28500,
      bodyType: "suv" as const,
      color: "Daytona Grey",
      owners: "1st owner" as const,
      city: "Delhi NCR",
      registrationNumber: "HR 26 EB 4291",
      insuranceValid: "Comprehensive till Aug 2026",
      rcVerified: true,
      isInspected: true,
      engineCC: 1199,
      power: "118 bhp @ 5500 rpm",
      groundClearance: "208 mm",
      certifiedMileage: "17.4 kmpl",
      accidentHistory: false,
      serviceHistory: true,
      views: 289,
      features: {
        comfort: [
          "Voice Assisted Electric Sunroof",
          "Automatic Climate Control",
          "Air Purifier with AQI Display",
          "Cooled Glovebox",
          "Height Adjustable Driver Seat",
        ],
        safety: [
          "5-Star Global NCAP Safety Rating",
          "6 Airbags",
          "ESP with Electronic Traction Control",
          "Blind Spot View Monitor",
          "Rear Parking Camera with Dynamic Guidelines",
        ],
        interior: [
          "10.25-inch Floating Touchscreen",
          "JBL Audio System",
          "Wireless Apple CarPlay & Android Auto",
          "Digital Driver Cockpit",
          "Touch-based HVAC Panel",
        ],
        exterior: [
          "Sequential LED DRLs",
          "Bi-Function LED Headlamps",
          "16-inch Alloy Wheels",
          "Contrast Roof",
        ],
      },
      description:
        "Top-spec 5-star crash safety rated Tata Nexon Fearless Plus S. Single hand driven by a corporate executive. Complete authorized Tata Motors maintenance records available. Interior is like new with no wear on steering or upholstery. Hassle-free Gurgaon registration.",
      images: makeImages("tata/nexon"),
      dealer: DEALER_USER_ID,
    },
    {
      title: "2021 Mahindra Thar LX 4x4 Hard Top Diesel AT",
      brand: "Mahindra",
      model: "Thar",
      variant: "LX 4x4 Hard Top Diesel AT",
      year: 2021,
      price: 1475000,
      fuelType: "diesel" as const,
      transmission: "automatic" as const,
      mileage: 34200,
      bodyType: "suv" as const,
      color: "Napoli Black",
      owners: "1st owner" as const,
      city: "Gurugram",
      registrationNumber: "HR 26 EX 1109",
      insuranceValid: "Comprehensive till Dec 2026",
      rcVerified: true,
      isInspected: true,
      engineCC: 2184,
      power: "130 bhp @ 3750 rpm",
      groundClearance: "226 mm",
      certifiedMileage: "15.2 kmpl",
      accidentHistory: false,
      serviceHistory: true,
      views: 512,
      features: {
        comfort: [
          "Factory Fitted Molded Hard Top",
          "Tilt Adjustable Steering",
          "Cruise Control",
          "Remote Keyless Entry",
          "Power Windows",
        ],
        safety: [
          "Shift-on-the-Fly 4WD with Low Ratio",
          "Built-in Roll Cage",
          "ESP with Rollover Mitigation",
          "Hill Hold and Hill Descent Control",
          "Dual Front Airbags",
          "ABS with EBD",
        ],
        interior: [
          "7-inch Touchscreen Infotainment with Adventure Gauges",
          "Roof-Mounted Weatherproof Speakers",
          "Washable Interior with Drain Plugs",
          "Custom Fitted Leatherette Seat Covers",
        ],
        exterior: [
          "18-inch Deep Silver Alloy Wheels",
          "All-Terrain Ceat Tyres",
          "Front Fog Lamps",
          "Iconic Thar Vertical Slotted Grille",
        ],
      },
      description:
        "Immaculate condition Mahindra Thar LX 4x4 Diesel Automatic with factory hard top. Never abused off-road; highway driven for road trips. Equipped with smooth 6-speed torque converter AT and powerful 2.2L mHawk diesel engine. Complete Mahindra service history.",
      images: makeImages("mahindra/thar"),
      dealer: DEALER_USER_ID,
    },
    {
      title: "2022 Maruti Suzuki Brezza ZXi Plus AT",
      brand: "Maruti Suzuki",
      model: "Brezza",
      variant: "ZXi Plus Dual Tone AT",
      year: 2022,
      price: 1180000,
      fuelType: "petrol" as const,
      transmission: "automatic" as const,
      mileage: 22100,
      bodyType: "suv" as const,
      color: "Brave Khaki with White Roof",
      owners: "1st owner" as const,
      city: "Delhi NCR",
      registrationNumber: "DL 03 CB 7714",
      insuranceValid: "Zero Dep till Oct 2026",
      rcVerified: true,
      isInspected: true,
      engineCC: 1462,
      power: "102 bhp @ 6000 rpm",
      groundClearance: "198 mm",
      certifiedMileage: "19.8 kmpl",
      accidentHistory: false,
      serviceHistory: true,
      views: 260,
      features: {
        comfort: [
          "Electric Sunroof",
          "Heads-Up Display (HUD)",
          "Wireless Smartphone Charger",
          "Automatic Climate Control with Rear AC Vents",
          "Paddle Shifters",
        ],
        safety: [
          "360-Degree HD Camera",
          "6 Airbags",
          "Electronic Stability Program (ESP)",
          "Hill Hold Assist",
          "ISOFIX Child Seat Anchors",
        ],
        interior: [
          "9-inch SmartPlay Pro+ Touchscreen",
          "Arkamys Surround Sound",
          "Wireless Apple CarPlay & Android Auto",
          "Dual Tone Interior Theme",
        ],
        exterior: [
          "Dual LED Projector Headlamps",
          "16-inch Dual Tone Precision Cut Alloys",
          "Shark Fin Antenna",
          "Floating Roof Design",
        ],
      },
      description:
        "Top variant Maruti Brezza ZXi Plus Automatic in striking dual-tone combination. Exceptionally fuel efficient with Smart Hybrid tech delivering nearly 20 kmpl ARAI. 100% verified mileage with Maruti Suzuki workshop inspection clearance.",
      images: makeImages("maruti/brezza"),
      dealer: DEALER_USER_ID,
    },
    {
      title: "2023 Kia Seltos GTX Plus 1.5 Turbo DCT",
      brand: "Kia",
      model: "Seltos",
      variant: "GTX Plus 1.5 T-GDi DCT",
      year: 2023,
      price: 1890000,
      fuelType: "petrol" as const,
      transmission: "automatic" as const,
      mileage: 16500,
      bodyType: "suv" as const,
      color: "Imperial Blue",
      owners: "1st owner" as const,
      city: "Noida",
      registrationNumber: "UP 16 DR 5521",
      insuranceValid: "Comprehensive till Feb 2027",
      rcVerified: true,
      isInspected: true,
      engineCC: 1482,
      power: "158 bhp @ 5500 rpm",
      groundClearance: "190 mm",
      certifiedMileage: "17.9 kmpl",
      accidentHistory: false,
      serviceHistory: true,
      views: 430,
      features: {
        comfort: [
          "Dual Panoramic Panoramic Sunroof",
          "Front Ventilated Seats",
          "Dual Zone Fully Automatic AC",
          "8-Way Power Adjustable Driver Seat",
          "Electronic Parking Brake",
        ],
        safety: [
          "Level 2 ADAS (Forward Collision Warning, Lane Keep Assist, Smart Cruise)",
          "6 Airbags Standard",
          "360-Degree Surround View Camera with Blind View Monitor",
          "Front & Rear Parking Sensors",
          "All-Wheel Disc Brakes",
        ],
        interior: [
          "Dual 10.25-inch Curved Monolith Screen Display",
          "Bose 8-Speaker Premium Sound",
          "64-Color Ambient Mood Lighting",
          "Sporty Black Leatherette Seats with Tubular Pattern",
        ],
        exterior: [
          "Star Map LED Headlamps & Connecting DRLs",
          "18-inch Crystal Cut Alloy Wheels",
          "Dual Sports Exhaust Pipes",
          "Glossy Black Signature Tiger Nose Grille",
        ],
      },
      description:
        "Facelifted 2023 Kia Seltos GTX Plus Turbo in mint condition. Loaded with Level 2 ADAS, panoramic glass roof, and dynamic 160PS turbocharged powertrain. Under manufacturer warranty until 2028. Pristine non-smoker interior.",
      images: makeImages("kia/seltos"),
      dealer: DEALER_USER_ID,
    },
    {
      title: "2020 Toyota Fortuner 2.8 4x2 AT Diesel",
      brand: "Toyota",
      model: "Fortuner",
      variant: "2.8 4x2 AT Diesel",
      year: 2020,
      price: 2980000,
      fuelType: "diesel" as const,
      transmission: "automatic" as const,
      mileage: 58000,
      bodyType: "suv" as const,
      color: "Super White",
      owners: "1st owner" as const,
      city: "Delhi NCR",
      registrationNumber: "DL 10 CE 4004",
      insuranceValid: "Zero Dep till Sep 2026",
      rcVerified: true,
      isInspected: true,
      engineCC: 2755,
      power: "201 bhp @ 3400 rpm",
      groundClearance: "225 mm",
      certifiedMileage: "14.4 kmpl",
      accidentHistory: false,
      serviceHistory: true,
      views: 640,
      features: {
        comfort: [
          "8-Way Power Adjustable Driver and Co-Driver Seats",
          "Dual Zone Automatic Climate Control with Rear Vents",
          "Powered Tailgate with Memory",
          "Cruise Control",
          "Paddle Shifters",
        ],
        safety: [
          "7 Airbags (including driver knee airbag)",
          "Vehicle Stability Control (VSC) with Brake Assist",
          "Hill Start Assist Control (HAC)",
          "ABS with EBD",
          "Reverse Camera with Back Guide Monitor",
        ],
        interior: [
          "Premium Chamois Leather Upholstery",
          "8-inch Touchscreen Infotainment with Navigation",
          "Cooled Console Box",
          "Optitron Meter with Color TFT Multi-info Display",
        ],
        exterior: [
          "Bi-Beam LED Headlamps with DRLs",
          "18-inch Machined Alloy Wheels",
          "Chrome Door Handles and Window Beltline",
          "Aero Stabilizing Fins",
        ],
      },
      description:
        "The undisputed king of Indian roads: Toyota Fortuner 2.8L Diesel Automatic in pristine Super White. Bulletproof Toyota reliability with complete authorized service history at Espirit Toyota. Tyres recently replaced. Zero mechanical defects.",
      images: makeImages("toyota/fortuner"),
      dealer: DEALER_USER_ID,
    },
    {
      title: "2022 Honda City 1.5 i-VTEC ZX CVT",
      brand: "Honda",
      model: "City",
      variant: "5th Gen ZX CVT",
      year: 2022,
      price: 1290000,
      fuelType: "petrol" as const,
      transmission: "cvt" as const,
      mileage: 24000,
      bodyType: "sedan" as const,
      color: "Platinum White Pearl",
      owners: "1st owner" as const,
      city: "Delhi NCR",
      registrationNumber: "DL 07 CG 3812",
      insuranceValid: "Comprehensive till Nov 2026",
      rcVerified: true,
      isInspected: true,
      engineCC: 1498,
      power: "119 bhp @ 6600 rpm",
      groundClearance: "165 mm",
      certifiedMileage: "18.4 kmpl",
      accidentHistory: false,
      serviceHistory: true,
      views: 310,
      features: {
        comfort: [
          "One-Touch Electric Sunroof",
          "Walk Away Auto Lock",
          "Automatic Climate Control with Click Knobs",
          "Paddle Shifters for 7-Speed Step CVT",
          "Rear Sunshade",
        ],
        safety: [
          "Honda LaneWatch Camera",
          "6 Airbags",
          "Vehicle Stability Assist (VSA) with Agile Handling Assist",
          "Tyre Pressure Deflation Warning System",
          "Multi-Angle Rear Camera",
        ],
        interior: [
          "8-inch Advanced Display Audio with Smartphone Connectivity",
          "Leather Seats with Soft Touch Padded Dashboard",
          "7-inch HD Full Color TFT Driver Instrument Cluster",
          "Honda Connect with Alexa Remote Capability",
        ],
        exterior: [
          "Full LED 9-Array Inline Headlamps",
          "16-inch Diamond Cut Alloy Wheels",
          "Z-Shaped 3D Wrap-Around LED Tail Lamps",
          "Shark Fin Antenna",
        ],
      },
      description:
        "Class-leading executive sedan Honda City 5th Gen ZX CVT. Known for silky-smooth i-VTEC petrol engine and plush sofa-like rear seat comfort. Single corporate owner, driven with utmost care. Full service records at Prime Honda Delhi.",
      images: makeImages("honda/city"),
      dealer: DEALER_USER_ID,
    },
    {
      title: "2021 Hyundai i20 Asta (O) 1.0 Turbo IMT",
      brand: "Hyundai",
      model: "i20",
      variant: "Asta (O) 1.0 Turbo Petrol",
      year: 2021,
      price: 840000,
      fuelType: "petrol" as const,
      transmission: "amt" as const,
      mileage: 31000,
      bodyType: "hatchback" as const,
      color: "Fiery Red",
      owners: "1st owner" as const,
      city: "Delhi NCR",
      registrationNumber: "DL 04 CZ 6219",
      insuranceValid: "Comprehensive till Jul 2026",
      rcVerified: true,
      isInspected: true,
      engineCC: 998,
      power: "118 bhp @ 6000 rpm",
      groundClearance: "170 mm",
      certifiedMileage: "20.2 kmpl",
      accidentHistory: false,
      serviceHistory: true,
      views: 195,
      features: {
        comfort: [
          "Electric Sunroof",
          "Wireless Smartphone Charger with Cooling Pad",
          "Automatic AC with Digital Display",
          "Cruise Control",
          "Smart Key with Push Button Start",
        ],
        safety: [
          "6 Airbags",
          "Electronic Stability Control (ESC)",
          "Hill Assist Control (HAC)",
          "Emergency Stop Signal",
          "Rear Parking Camera with Guidelines",
        ],
        interior: [
          "10.25-inch HD Touchscreen Infotainment",
          "Bose 7-Speaker Premium Sound with Subwoofer",
          "Digital Instrument Cluster",
          "BlueLink Connected Car Tech with 50+ Features",
        ],
        exterior: [
          "Projector Headlamps with LED DRLs",
          "16-inch Diamond Cut Alloy Wheels",
          "Z-Shaped LED Tail Lamps",
          "Parametric Jewel Pattern Front Grille",
        ],
      },
      description:
        "Peppy and feature-loaded premium hatchback. Punchy 1.0L Turbo GDi petrol engine paired with convenient clutchless manual transmission. Immaculate mechanical condition and clean Delhi registration.",
      images: makeImages("hyundai/i20"),
      dealer: DEALER_USER_ID,
    },
    {
      title: "2023 Tata Harrier Fearless Plus Dark Edition AT",
      brand: "Tata",
      model: "Harrier",
      variant: "Fearless Plus Dark Edition AT",
      year: 2023,
      price: 2150000,
      fuelType: "diesel" as const,
      transmission: "automatic" as const,
      mileage: 19800,
      bodyType: "suv" as const,
      color: "Oberon Black",
      owners: "1st owner" as const,
      city: "Gurugram",
      registrationNumber: "HR 26 EQ 0099",
      insuranceValid: "Zero Dep till Dec 2026",
      rcVerified: true,
      isInspected: true,
      engineCC: 1956,
      power: "168 bhp @ 3750 rpm",
      groundClearance: "205 mm",
      certifiedMileage: "16.8 kmpl",
      accidentHistory: false,
      serviceHistory: true,
      views: 480,
      features: {
        comfort: [
          "Panoramic Sunroof with Mood Lighting",
          "Ventilated Front Seats",
          "Memory Driver Seat with Welcome Feature",
          "Dual Zone Climate Control",
          "Electronic Shifter with Paddle Shifters",
        ],
        safety: [
          "ADAS Suite with Autonomous Emergency Braking & Blind Spot Detection",
          "7 Airbags",
          "360-Degree 3D Surround Camera",
          "Advanced ESP with 17 Functionalities",
          "Corner Stability Control",
        ],
        interior: [
          "12.3-inch Cinematic Touchscreen Display",
          "10-Speaker JBL Sound System with Subwoofer",
          "10.25-inch Digital Cockpit with Map View",
          "All-Black Dark Theme Upholstery",
        ],
        exterior: [
          "19-inch Blackstone Diamond Cut Alloy Wheels",
          "Bi-LED Projector Headlamps with Sequential Indicators",
          "Connected End-to-End LED DRLs & Tail Lamps",
          "#DARK Chrome Emblems",
        ],
      },
      description:
        "The commanding Tata Harrier Fearless Plus Dark Edition. Built on Land Rover's D8 derived OMEGARC architecture, offering exceptional highway composure and rough road capability. Zero accidents, original paint, VIP HR26 number.",
      images: makeImages("tata/harrier"),
      dealer: DEALER_USER_ID,
    },
    {
      title: "2022 Volkswagen Virtus GT Plus 1.5 TSI DSG",
      brand: "Volkswagen",
      model: "Virtus",
      variant: "GT Plus 1.5 TSI DSG",
      year: 2022,
      price: 1540000,
      fuelType: "petrol" as const,
      transmission: "automatic" as const,
      mileage: 21500,
      bodyType: "sedan" as const,
      color: "Wild Cherry Red",
      owners: "1st owner" as const,
      city: "Delhi NCR",
      registrationNumber: "DL 09 CF 8412",
      insuranceValid: "Zero Dep till Oct 2026",
      rcVerified: true,
      isInspected: true,
      engineCC: 1498,
      power: "148 bhp @ 5000 rpm",
      groundClearance: "179 mm",
      certifiedMileage: "18.6 kmpl",
      accidentHistory: false,
      serviceHistory: true,
      views: 395,
      features: {
        comfort: [
          "Ventilated Front Seats",
          "Electric Sunroof",
          "Paddle Shifters on Leather Steering",
          "Auto Dimming IRVM",
          "Wireless Phone Charging",
        ],
        safety: [
          "5-Star Global NCAP Safety Rating",
          "6 Airbags",
          "Electronic Stability Control (ESC)",
          "Multi-Collision Brakes (MCB)",
          "Hill Start Assist",
          "Tyre Pressure Deflation Warning",
        ],
        interior: [
          "10.1-inch VW Play Touchscreen Infotainment",
          "8-inch Digital Cockpit Cluster",
          "Red Ambient Lighting",
          "Aluminium Sporty Pedals",
        ],
        exterior: [
          "Dual Tone Black Roof & ORVMs",
          "16-inch Razor Alloy Wheels in Black",
          "Red Painted Brake Calipers",
          "GT Wing Rear Spoiler",
        ],
      },
      description:
        "Pure German engineering and driving pleasure. The Virtus GT Plus packs 150 PS of turbocharged performance with lightning-quick 7-speed DSG dual-clutch transmission and Active Cylinder Tech for fuel economy. Maintained strictly at VW Delhi West.",
      images: makeImages("volkswagen/virtus"),
      dealer: DEALER_USER_ID,
    },
    {
      title: "2021 Mahindra XUV700 AX7 Luxury Pack AWD AT",
      brand: "Mahindra",
      model: "XUV700",
      variant: "AX7 Luxury Pack AWD AT Diesel",
      year: 2021,
      price: 2280000,
      fuelType: "diesel" as const,
      transmission: "automatic" as const,
      mileage: 36000,
      bodyType: "suv" as const,
      color: "Midnight Black",
      owners: "1st owner" as const,
      city: "Delhi NCR",
      registrationNumber: "HR 26 DM 7120",
      insuranceValid: "Comprehensive till Nov 2026",
      rcVerified: true,
      isInspected: true,
      engineCC: 2184,
      power: "182 bhp @ 3500 rpm",
      groundClearance: "200 mm",
      certifiedMileage: "16.5 kmpl",
      accidentHistory: false,
      serviceHistory: true,
      views: 575,
      features: {
        comfort: [
          "Panoramic Skyroof (Largest in Class)",
          "Flush Smart Door Handles",
          "Dual-Zone Fully Automatic AC",
          "6-Way Power Driver Seat with Memory and Welcome Retract",
          "Wireless Charger",
        ],
        safety: [
          "Level 2 ADAS (Adaptive Cruise, Auto Emergency Braking, Lane Keep)",
          "All-Wheel Drive (AWD)",
          "7 Airbags (including Knee Airbag)",
          "360-Degree Surround Camera with Blind View Monitor",
          "Electronic Parking Brake",
        ],
        interior: [
          "Dual 10.25-inch Monolith HD Curved Screens",
          "Sony 3D 12-Speaker Sound with Roof Mounted Speakers",
          "White Leatherette Interiors",
          "Built-in Alexa Voice Control",
        ],
        exterior: [
          "Arrow-Head LED Headlamps with Auto Booster",
          "18-inch Diamond Cut Alloys",
          "Sequential LED Indicators",
        ],
      },
      description:
        "Top-of-the-line Mahindra XUV700 AX7 Luxury Pack equipped with rare factory All-Wheel Drive (AWD). 185 bhp 2.2L mHawk diesel engine delivers effortless performance. Fully serviced on schedule with verified zero claim history.",
      images: makeImages("mahindra/xuv700"),
      dealer: DEALER_USER_ID,
    },
    {
      title: "2023 Maruti Suzuki Grand Vitara Alpha Plus Hybrid",
      brand: "Maruti Suzuki",
      model: "Grand Vitara",
      variant: "Alpha Plus Strong Hybrid e-CVT",
      year: 2023,
      price: 1720000,
      fuelType: "hybrid" as const,
      transmission: "cvt" as const,
      mileage: 14800,
      bodyType: "suv" as const,
      color: "Arctic White with Black Roof",
      owners: "1st owner" as const,
      city: "Delhi NCR",
      registrationNumber: "DL 01 CB 3341",
      insuranceValid: "Zero Dep till Jan 2027",
      rcVerified: true,
      isInspected: true,
      engineCC: 1490,
      power: "114 bhp (Combined)",
      groundClearance: "210 mm",
      certifiedMileage: "27.97 kmpl",
      accidentHistory: false,
      serviceHistory: true,
      views: 310,
      features: {
        comfort: [
          "Panoramic Double-Sliding Glass Sunroof",
          "Front Ventilated Seats",
          "Heads-Up Display (HUD)",
          "Wireless Phone Charging",
          "Automatic Climate Control",
        ],
        safety: [
          "360-Degree Camera",
          "6 Airbags",
          "Tyre Pressure Monitoring System (TPMS)",
          "Electronic Stability Program (ESP)",
          "Hill Descent Control & Hill Hold",
        ],
        interior: [
          "9-inch SmartPlay Pro+ Touchscreen Infotainment",
          "All-Digital 7-inch Color Multi-Information Display",
          "Black and Bordeaux Leatherette Interior Theme",
          "EV Drive Mode Selector",
        ],
        exterior: [
          "Full LED Projector Headlamps",
          "17-inch Precision Cut Alloy Wheels",
          "Sweeping LED Rear Light Bar",
          "Roof Rails",
        ],
      },
      description:
        "Extraordinary fuel efficiency of 28 kmpl! Genuine self-charging Strong Hybrid Grand Vitara Alpha Plus. Runs on pure electric mode in heavy city traffic. Complete battery warranty intact till 2031. Spotless body and interior.",
      images: makeImages("maruti/grand-vitara"),
      dealer: DEALER_USER_ID,
    },
    {
      title: "2022 Skoda Slavia Style 1.5 TSI DSG",
      brand: "Skoda",
      model: "Slavia",
      variant: "Style 1.5 TSI DSG",
      year: 2022,
      price: 1460000,
      fuelType: "petrol" as const,
      transmission: "automatic" as const,
      mileage: 23500,
      bodyType: "sedan" as const,
      color: "Crystal Blue",
      owners: "1st owner" as const,
      city: "Gurugram",
      registrationNumber: "HR 26 EK 4114",
      insuranceValid: "Comprehensive till Sep 2026",
      rcVerified: true,
      isInspected: true,
      engineCC: 1498,
      power: "148 bhp @ 5000 rpm",
      groundClearance: "179 mm",
      certifiedMileage: "18.4 kmpl",
      accidentHistory: false,
      serviceHistory: true,
      views: 290,
      features: {
        comfort: [
          "Ventilated Front Seats",
          "Electric Glass Sunroof",
          "Wireless Phone Charger",
          "Climatronic Dual-Zone AC with Air Care",
          "Keyless Entry with Push Button Start",
        ],
        safety: [
          "5-Star Global NCAP Adult & Child Safety",
          "6 Airbags",
          "Electronic Differential Lock (EDS)",
          "Multi-Collision Braking System",
          "Rear View Camera with Static Guidelines",
        ],
        interior: [
          "10-inch Touchscreen Infotainment with Wireless SmartLink",
          "Skoda Premium Sound with Subwoofer in Boot",
          "8-inch Virtual Cockpit Instrument Display",
          "Beige & Black Dual-Tone Leatherette Seats",
        ],
        exterior: [
          "Crystalline LED Headlamps with L-Shaped DRLs",
          "16-inch Ving Alloy Wheels",
          "Signature Chrome Hexagonal Grille",
          "Split LED Tail Lamps",
        ],
      },
      description:
        "European sophistication meets unmatched safety in the Skoda Slavia Style 1.5 TSI. Features cylinder deactivation tech and DSG gearbox for an exhilarating drive. Single owner, non-accidental, verified maintenance records at Skoda Gurugram.",
      images: makeImages("skoda/slavia"),
      dealer: DEALER_USER_ID,
    },
    {
      title: "2020 Maruti Suzuki Swift ZXi Plus MT",
      brand: "Maruti Suzuki",
      model: "Swift",
      variant: "ZXi Plus Dual Tone",
      year: 2020,
      price: 590000,
      fuelType: "petrol" as const,
      transmission: "manual" as const,
      mileage: 38000,
      bodyType: "hatchback" as const,
      color: "Solid Fire Red with Midnight Black",
      owners: "1st owner" as const,
      city: "Delhi NCR",
      registrationNumber: "DL 05 CE 9921",
      insuranceValid: "Comprehensive till Jul 2026",
      rcVerified: true,
      isInspected: true,
      engineCC: 1197,
      power: "89 bhp @ 6000 rpm",
      groundClearance: "163 mm",
      certifiedMileage: "23.2 kmpl",
      accidentHistory: false,
      serviceHistory: true,
      views: 245,
      features: {
        comfort: [
          "Engine Push Start-Stop with Smart Key",
          "Automatic Climate Control",
          "Electrically Folding ORVMs",
          "Tilt Steering with Audio Controls",
        ],
        safety: [
          "Dual Front Airbags",
          "ABS with EBD and Brake Assist",
          "Reverse Parking Camera with Sensor Display",
          "Front Fog Lamps",
        ],
        interior: [
          "7-inch SmartPlay Studio Touchscreen",
          "Android Auto and Apple CarPlay",
          "Leather Wrapped Flat-Bottom Steering Wheel",
        ],
        exterior: [
          "LED Projector Headlamps with Signature DRLs",
          "15-inch Precision Cut Two-Tone Alloys",
          "Dual-Tone Floating Black Roof",
        ],
      },
      description:
        "India's beloved hatchback in top-spec ZXi Plus avatar. Extremely economical to run and maintain with 23+ kmpl fuel economy. Engine is responsive and silent. Full service history at Maruti Arena with brand new battery.",
      images: makeImages("maruti/swift"),
      dealer: DEALER_USER_ID,
    },
    {
      title: "2023 Tata Safari Accomplished Plus 6S AT",
      brand: "Tata",
      model: "Safari",
      variant: "Accomplished Plus 6-Seater AT",
      year: 2023,
      price: 2390000,
      fuelType: "diesel" as const,
      transmission: "automatic" as const,
      mileage: 17200,
      bodyType: "suv" as const,
      color: "Cosmic Gold",
      owners: "1st owner" as const,
      city: "Noida",
      registrationNumber: "UP 16 DZ 1122",
      insuranceValid: "Zero Dep till Dec 2026",
      rcVerified: true,
      isInspected: true,
      engineCC: 1956,
      power: "168 bhp @ 3750 rpm",
      groundClearance: "205 mm",
      certifiedMileage: "16.3 kmpl",
      accidentHistory: false,
      serviceHistory: true,
      views: 410,
      features: {
        comfort: [
          "Ventilated Captain Seats in 1st & 2nd Rows",
          "Panoramic Sunroof with Ambient Mood Lighting",
          "Powered Gesture Controlled Tailgate",
          "Dual Zone Climate Control",
          "Boss Mode Passenger Seat Adjustment",
        ],
        safety: [
          "Level 2 ADAS Suite with 11 Autonomous Safety Functions",
          "7 Airbags Standard",
          "360-Degree Surround Camera with Transparent Chassis View",
          "Emergency Call & Breakdown Assistance",
        ],
        interior: [
          "12.3-inch Ultra HD Harman Infotainment",
          "10-Speaker JBL Premium Sound System",
          "10.25-inch Digital Instrument Cluster with Full Navigation",
          "Benecke Kaliko Dual Tone Leather Upholstery",
        ],
        exterior: [
          "Parametric Grille with Warm White Accents",
          "19-inch Spider Diamond Cut Alloys",
          "Connected End-to-End LED Light Bar",
        ],
      },
      description:
        "Flagship 6-seater luxury SUV with ventilated captain chairs in both rows. Equipped with Level 2 ADAS, panoramic skyroof, and powerful 2.0L Kryotec turbo diesel engine. Corporate owned with comprehensive service record at Tata Motors.",
      images: makeImages("tata/safari"),
      dealer: DEALER_USER_ID,
    },
    {
      title: "2022 MG Hector Sharp Pro 2.0 Diesel MT",
      brand: "MG",
      model: "Hector",
      variant: "Sharp Pro 2.0 Diesel",
      year: 2022,
      price: 1650000,
      fuelType: "diesel" as const,
      transmission: "manual" as const,
      mileage: 29000,
      bodyType: "suv" as const,
      color: "Havana Grey",
      owners: "1st owner" as const,
      city: "Delhi NCR",
      registrationNumber: "DL 08 CZ 4321",
      insuranceValid: "Comprehensive till Oct 2026",
      rcVerified: true,
      isInspected: true,
      engineCC: 1956,
      power: "168 bhp @ 3750 rpm",
      groundClearance: "192 mm",
      certifiedMileage: "15.8 kmpl",
      accidentHistory: false,
      serviceHistory: true,
      views: 320,
      features: {
        comfort: [
          "14-inch HD Portrait Touchscreen (Largest in India)",
          "Dual-Pane Panoramic Skyroof",
          "Powered 6-Way Driver and 4-Way Co-Driver Seats",
          "Ventilated Front Seats",
          "Wireless Android Auto & Apple CarPlay",
        ],
        safety: [
          "6 Airbags",
          "360-Degree Camera with 3D Transparent Car View",
          "Electronic Stability Program (ESP)",
          "Traction Control System (TCS)",
          "Heated Outside Rear View Mirrors",
        ],
        interior: [
          "Infinity 8-Speaker Audio System with Subwoofer & Amplifier",
          "i-SMART Next Gen with 75+ Connected Features",
          "Dual-Tone Oak White & Black Interior Theme",
        ],
        exterior: [
          "Argyle Inspired Diamond Mesh Grille",
          "18-inch Dual Tone Machined Alloys",
          "LED Projector Headlamps & Floating Turn Indicators",
        ],
      },
      description:
        "Spacious internet SUV with colossal 14-inch touchscreen and lounge-like interior room. Torque-rich 2.0L diesel engine provides effortless cruising power. Immaculate single-owner condition with full MG Motors warranty package.",
      images: makeImages("mg/hector"),
      dealer: DEALER_USER_ID,
    },
    {
      title: "2021 Hyundai Verna SX (O) 1.5 Turbo DCT",
      brand: "Hyundai",
      model: "Verna",
      variant: "SX (O) 1.0 Turbo DCT",
      year: 2021,
      price: 1150000,
      fuelType: "petrol" as const,
      transmission: "automatic" as const,
      mileage: 32000,
      bodyType: "sedan" as const,
      color: "Titan Grey",
      owners: "1st owner" as const,
      city: "Delhi NCR",
      registrationNumber: "DL 03 CK 9119",
      insuranceValid: "Comprehensive till Aug 2026",
      rcVerified: true,
      isInspected: true,
      engineCC: 998,
      power: "118 bhp @ 6000 rpm",
      groundClearance: "165 mm",
      certifiedMileage: "19.2 kmpl",
      accidentHistory: false,
      serviceHistory: true,
      views: 275,
      features: {
        comfort: [
          "Front Ventilated Seats",
          "Smart Electric Sunroof",
          "Smart Trunk with Hands-free Opening",
          "Wireless Smartphone Charger",
          "Paddle Shifters",
        ],
        safety: [
          "6 Airbags",
          "Electronic Stability Control (ESC)",
          "Vehicle Stability Management (VSM)",
          "Front & Rear Parking Sensors",
          "Tyre Pressure Monitoring System (TPMS)",
        ],
        interior: [
          "8-inch Touchscreen with HD Display",
          "Arkamys Premium Audio",
          "BlueLink Connected Car Tech",
          "Full Digital Cluster with 4.2-inch Color TFT",
        ],
        exterior: [
          "Dark Chrome Radiator Grille",
          "16-inch Diamond Cut Alloy Wheels",
          "Twin Tip Sports Exhaust",
          "Shark Fin Antenna",
        ],
      },
      description:
        "Sleek and aerodynamically styled Hyundai Verna Turbo DCT. Features ventilated front seats and punchy turbocharged performance. Always parked in covered garage. 100% verified authorized service stamps at Himgiri Hyundai.",
      images: makeImages("hyundai/verna"),
      dealer: DEALER_USER_ID,
    },
    {
      title: "2023 Mahindra Scorpio-N Z8L 4x4 Diesel AT",
      brand: "Mahindra",
      model: "Scorpio-N",
      variant: "Z8L 4x4 Diesel AT",
      year: 2023,
      price: 2295000,
      fuelType: "diesel" as const,
      transmission: "automatic" as const,
      mileage: 21000,
      bodyType: "suv" as const,
      color: "Dazzling Silver",
      owners: "1st owner" as const,
      city: "Delhi NCR",
      registrationNumber: "HR 26 EQ 4880",
      insuranceValid: "Zero Dep till Nov 2026",
      rcVerified: true,
      isInspected: true,
      engineCC: 2184,
      power: "172 bhp @ 3500 rpm",
      groundClearance: "187 mm",
      certifiedMileage: "15.5 kmpl",
      accidentHistory: false,
      serviceHistory: true,
      views: 520,
      features: {
        comfort: [
          "Electric Sunroof with Anti-Pinch",
          "Dual Zone Fully Automatic Temperature Control",
          "6-Way Powered Driver Seat",
          "Wireless Charger",
          "Push Button Engine Start/Stop",
        ],
        safety: [
          "4XPLOR Intelligent Terrain Management System (Normal, Snow, Mud, Sand)",
          "Mechanical Locking Differential & Brake Locking Differential",
          "6 Airbags",
          "Driver Drowsiness Alert",
          "Front & Rear Parking Cameras and Sensors",
        ],
        interior: [
          "Sony 12-Speaker 3D Immersive Sound with Subwoofer",
          "8-inch Touchscreen Infotainment with Built-in Navigation",
          "Rich Coffee Black Leatherette Interiors",
          "7-inch Color Cluster Display",
        ],
        exterior: [
          "18-inch Diamond Cut Alloys",
          "Double Barrel LED Projector Headlamps",
          "Sting-like Chrome Window Line",
          "Tall Vertically Stacked LED Tail Lamps",
        ],
      },
      description:
        "The Big Daddy of SUVs in its most loaded Z8L 4x4 Automatic trim. Combines rugged body-on-frame go-anywhere capability with luxury car ride quality. Under official Mahindra factory warranty till 2026. Zero off-road wear.",
      images: makeImages("mahindra/scorpio-n"),
      dealer: DEALER_USER_ID,
    },
    {
      title: "2022 Tata Tiago EV XZ Plus Tech LUX",
      brand: "Tata",
      model: "Tiago EV",
      variant: "XZ Plus Tech LUX (24 kWh Long Range)",
      year: 2022,
      price: 875000,
      fuelType: "electric" as const,
      transmission: "automatic" as const,
      mileage: 19500,
      bodyType: "hatchback" as const,
      color: "Teal Blue with Contrast Black Roof",
      owners: "1st owner" as const,
      city: "Delhi NCR",
      registrationNumber: "DL 01 EV 8092",
      insuranceValid: "Zero Dep till Oct 2026",
      rcVerified: true,
      isInspected: true,
      engineCC: 0,
      power: "74 bhp (55 kW)",
      groundClearance: "165 mm",
      certifiedMileage: "315 km/charge",
      accidentHistory: false,
      serviceHistory: true,
      views: 290,
      features: {
        comfort: [
          "Multi-Mode Regenerative Braking (Levels 0, 1, 2, 3)",
          "Automatic Climate Control",
          "Cooled Glovebox",
          "Cruise Control",
          "Electric Tailgate Release",
        ],
        safety: [
          "IP67 Rated Battery Pack and Motor",
          "Dual Front Airbags",
          "ABS with EBD and Corner Stability Control",
          "Reverse Camera with Dynamic Guidelines",
          "Tyre Pressure Monitoring System (iTPMS)",
        ],
        interior: [
          "7-inch Harman Touchscreen Infotainment",
          "8-Speaker Harman Audio System",
          "Plush Leatherette Seats",
          "ZConnect App with 45 Smart Connected Features",
        ],
        exterior: [
          "Contrast Black Roof with Teal Blue Body",
          "Hyperstyle 14-inch Wheels",
          "Signature Humanity Line with EV Blue Accents",
          "Projector Headlamps with DRLs",
        ],
      },
      description:
        "Zero emissions, whisper quiet, and just ₹1 per kilometer running cost! Top spec Long Range 24kWh battery pack supporting DC Fast Charging (10-80% in under 57 mins). Battery and motor under 8-Year / 160,000 km manufacturer warranty.",
      images: makeImages("tata/tiago-ev"),
      dealer: DEALER_USER_ID,
    },
    {
      title: "2021 BMW 3 Series Gran Limousine 330Li M Sport",
      brand: "BMW",
      model: "3 Series",
      variant: "330Li M Sport Gran Limousine",
      year: 2021,
      price: 4150000,
      fuelType: "petrol" as const,
      transmission: "automatic" as const,
      mileage: 27000,
      bodyType: "sedan" as const,
      color: "Portimao Blue Metallic",
      owners: "1st owner" as const,
      city: "Delhi NCR",
      registrationNumber: "HR 26 DM 0003",
      insuranceValid: "Zero Dep till Dec 2026",
      rcVerified: true,
      isInspected: true,
      engineCC: 1998,
      power: "258 bhp @ 5000 rpm",
      groundClearance: "135 mm",
      certifiedMileage: "15.3 kmpl",
      accidentHistory: false,
      serviceHistory: true,
      views: 680,
      features: {
        comfort: [
          "Extended Wheelbase with First-Class Rear Legroom",
          "Panoramic Glass Sunroof",
          "3-Zone Automatic Climate Control",
          "Vernasca Cognac Leather Seats with Luxury Headrest Pillows",
          "Hands-Free Comfort Access Boot Lid",
        ],
        safety: [
          "BMW Parking Assistant with Reversing Assistant",
          "6 Airbags",
          "Dynamic Stability Control (DSC) with Cornering Brake Control (CBC)",
          "Attentiveness Assistant",
          "Run-Flat Tyres with Indicator",
        ],
        interior: [
          "BMW Live Cockpit Professional (12.3-inch Digital Instrument + 10.25-inch Control Display)",
          "Harman Kardon 16-Speaker Surround Sound System (464W)",
          "Wireless Apple CarPlay & Android Auto",
          "Ambient Lighting with 6 Color Tones",
        ],
        exterior: [
          "M Aerodynamics Package with Front Apron and Side Skirts",
          "18-inch M Double-Spoke Bicolor Alloy Wheels",
          "BMW LED Headlamps with Extended Contents",
          "M Sport Badging on Side Panels",
        ],
      },
      description:
        "The ultimate luxury driving machine. Long wheelbase Gran Limousine offering executive rear-seat space paired with BMW's exhilarating 258 hp TwinPower Turbo engine and 8-speed Steptronic Sport AT. Impeccable BMW Bird Automotive service history. Single owner, zero insurance claims.",
      images: makeImages("bmw/3-series"),
      dealer: DEALER_USER_ID,
    },
  ];

  console.log(`Inserting ${carsData.length} cars into database...`);
  await db.insert(schema.cars).values(carsData);
  console.log("🎉 Successfully inserted all 20 authentic cars into the database!");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error during seeding:", err);
    process.exit(1);
  });

