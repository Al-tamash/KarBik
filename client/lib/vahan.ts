export type VehicleDetails = {
  registrationNumber: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  fuelType: string;
  transmission: string;
  owners: string;
  color: string;
  insuranceValid: string;
  engineNumber: string;
  chassisNumber: string;
  rcStatus: string;
  registeredAt: string;
  ownerName: string;
  challansCount: number;
};

const MOCK_VEHICLE_DATABASE: Record<string, VehicleDetails> = {
  MH12DE5678: {
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
    challansCount: 0,
  },
  DL3CAA1111: {
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
    challansCount: 1,
  },
  KA51MB9999: {
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
    challansCount: 2,
  },
};

export function isValidRegistrationNumber(regNo: string): boolean {
  const cleanReg = regNo.replace(/[\s-]/g, "").toUpperCase();
  const standardPattern = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/;
  return standardPattern.test(cleanReg);
}

const STATE_NAMES: Record<string, string> = {
  MH: "Maharashtra",
  DL: "Delhi",
  KA: "Karnataka",
  UP: "Uttar Pradesh",
  HR: "Haryana",
  GJ: "Gujarat",
  KL: "Kerala",
  TN: "Tamil Nadu",
  AP: "Andhra Pradesh",
};

const BRANDS = ["Maruti Suzuki", "Hyundai", "Tata", "Toyota", "Honda"] as const;

const MODELS: Record<string, string> = {
  "Maruti Suzuki": "Swift",
  Hyundai: "Creta",
  Tata: "Nexon",
  Toyota: "Fortuner",
  Honda: "City",
};

function randomDigits(count: number): number {
  const min = 10 ** (count - 1);
  return Math.floor(Math.random() * min * 9 + min);
}

export async function fetchVehicleDetails(
  regNo: string
): Promise<VehicleDetails> {
  const cleanReg = regNo.replace(/[\s-]/g, "").toUpperCase();

  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!isValidRegistrationNumber(cleanReg)) {
    throw new Error("Invalid vehicle registration number format");
  }

  const known = MOCK_VEHICLE_DATABASE[cleanReg];
  if (known) return known;

  const stateCode = cleanReg.substring(0, 2);
  const stateName = STATE_NAMES[stateCode] ?? "State";
  const year = 2018 + (cleanReg.charCodeAt(4) % 6);
  const selectedBrand = BRANDS[cleanReg.charCodeAt(5) % BRANDS.length];
  const selectedModel = MODELS[selectedBrand];
  const fuels = ["petrol", "diesel", "cng"];
  const fuel = fuels[cleanReg.charCodeAt(6) % fuels.length];

  return {
    registrationNumber: cleanReg.replace(
      /^([A-Z]{2})([0-9]{2})([A-Z]{0,2})([0-9]{4})$/,
      "$1-$2-$3-$4"
    ),
    brand: selectedBrand,
    model: selectedModel,
    variant: "Base Variant",
    year,
    fuelType: fuel,
    transmission: "manual",
    owners: "1st owner",
    color: "Silver Grey",
    insuranceValid: "December 2026",
    engineNumber: `ENG${randomDigits(6)}`,
    chassisNumber: `CHA${randomDigits(9)}`,
    rcStatus: "Active",
    registeredAt: `${stateName} RTO Office`,
    ownerName: "Verified KarBik Customer",
    challansCount: 0,
  };
}
