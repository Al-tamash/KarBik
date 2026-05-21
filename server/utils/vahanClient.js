/**
 * Vahan RTO Mock Client
 *
 * This file simulates a connection to the Indian government's Vahan database.
 * In production, this would make an HTTPS request to an API provider (e.g. Signzy, RapidAPI, Zoop)
 * using an API key. For development and testing, we mock this data perfectly.
 */

// Curated database of verified vehicles for testing
export const MOCK_VEHICLE_DATABASE = {
  "MH12DE5678": {
    registrationNumber: "MH-12-DE-5678",
    brand: "Hyundai",
    model: "Creta",
    variant: "SX",
    year: 2021,
    fuelType: "diesel",
    transmission: "automatic",
    owners: "1st owner",
    color: "Polar White",
    insuranceValid: "December 2026",
    engineNumber: "D4FLM123456",
    chassisNumber: "MALH351CLM789012",
    rcStatus: "Active",
    registeredAt: "Pune RTO, Maharashtra",
    ownerName: "Altamash Khan",
    challansCount: 0
  },
  "DL3CAA1111": {
    registrationNumber: "DL-03-CA-A111",
    brand: "Honda",
    model: "City",
    variant: "ZX",
    year: 2022,
    fuelType: "petrol",
    transmission: "manual",
    owners: "2nd owner",
    color: "Silver Metallic",
    insuranceValid: "March 2027",
    engineNumber: "L15Z1987654",
    chassisNumber: "MAHM418GLB123456",
    rcStatus: "Active",
    registeredAt: "Mall Road RTO, Delhi",
    ownerName: "Mohd Azimullah",
    challansCount: 1
  },
  "KA51MB9999": {
    registrationNumber: "KA-51-MB-9999",
    brand: "Maruti Suzuki",
    model: "Swift",
    variant: "ZXi+",
    year: 2023,
    fuelType: "petrol",
    transmission: "manual",
    owners: "1st owner",
    color: "Solid Red",
    insuranceValid: "October 2028",
    engineNumber: "K12M837462",
    chassisNumber: "MA3EBS12D3456789",
    rcStatus: "Active",
    registeredAt: "Electronic City RTO, Bangalore",
    ownerName: "Vijay Kumar",
    challansCount: 2
  }
};

/**
 * Validates the format of an Indian vehicle registration number
 * Format: Two letters (state), two numbers (RTO code), two optional letters (series), four numbers
 * E.g., MH12DE5678, DL3CAA1111
 */
export function isValidRegistrationNumber(regNo) {
  // Strip hyphens and spaces, then make uppercase
  const cleanReg = regNo.replace(/[\s-]/g, "").toUpperCase();
  
  // Standard Indian vehicle plate regex
  const standardPattern = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/;
  return standardPattern.test(cleanReg);
}

/**
 * Simulates fetching vehicle details from the Vahan database
 * @param {string} regNo - The vehicle registration number (e.g. "MH12DE5678")
 */
export async function fetchVehicleDetails(regNo) {
  // Normalize input: strip spaces/hyphens and convert to uppercase
  const cleanReg = regNo.replace(/[\s-]/g, "").toUpperCase();

  // Simulate network latency (500ms) to make the app feel alive
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!isValidRegistrationNumber(cleanReg)) {
    throw new Error("Invalid vehicle registration number format");
  }

  // Check if we have this mock vehicle in our predefined database
  if (MOCK_VEHICLE_DATABASE[cleanReg]) {
    return MOCK_VEHICLE_DATABASE[cleanReg];
  }

  // Fallback: If registration is syntactically valid but not in database,
  // we dynamically generate realistic data so testing any number is seamless!
  const stateCode = cleanReg.substring(0, 2);
  const stateNames = {
    MH: "Maharashtra",
    DL: "Delhi",
    KA: "Karnataka",
    UP: "Uttar Pradesh",
    HR: "Haryana",
    GJ: "Gujarat",
    KL: "Kerala",
    TN: "Tamil Nadu",
    AP: "Andhra Pradesh"
  };

  const stateName = stateNames[stateCode] || "State RTO";
  const year = 2018 + (cleanReg.charCodeAt(4) % 6); // Dynamically decide a realistic year (2018 - 2023)
  const brands = ["Maruti Suzuki", "Hyundai", "Tata", "Toyota", "Honda"];
  const selectedBrand = brands[cleanReg.charCodeAt(5) % brands.length];
  
  const models = {
    "Maruti Suzuki": "Swift",
    "Hyundai": "Creta",
    "Tata": "Nexon",
    "Toyota": "Fortuner",
    "Honda": "City"
  };
  const selectedModel = models[selectedBrand];
  const fuels = ["petrol", "diesel", "cng"];
  const fuel = fuels[cleanReg.charCodeAt(6) % fuels.length];

  return {
    registrationNumber: cleanReg.replace(/^([A-Z]{2})([0-9]{2})([A-Z]{0,2})([0-9]{4})$/, "$1-$2-$3-$4"),
    brand: selectedBrand,
    model: selectedModel,
    variant: "Base Variant",
    year: year,
    fuelType: fuel,
    transmission: "manual",
    owners: "1st owner",
    color: "Silver Grey",
    insuranceValid: "December 2026",
    engineNumber: "ENG" + Math.floor(Math.random() * 900000 + 100000),
    chassisNumber: "CHA" + Math.floor(Math.random() * 900000000 + 100000000),
    rcStatus: "Active",
    registeredAt: `${stateName} RTO Office`,
    ownerName: "Verified AutoBazaar Customer",
    challansCount: 0
  };
}
