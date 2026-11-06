/**
 * Pure helpers for the text of the pre-filled WhatsApp enquiry.
 * Kept free of DB/framework imports so they can be unit-tested directly.
 */

export interface CarForMessage {
  year: number;
  brand: string;
  model: string;
  variant: string | null | undefined;
  fuelType: string;
}

function capitalise(word: string): string {
  return word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : "";
}

/**
 * "2021 Mahindra Bolero Neo N10 (O) with Multi-Terrain Tech (Diesel)".
 * Built from the structured fields. The listing `title` is NOT used because
 * it already repeats year and brand ("2021 Mahindra Bolero Neo ..."), which
 * made the old message read "the 2021 Mahindra 2021 Mahindra Bolero Neo ...".
 */
export function describeCar(car: CarForMessage): string {
  const name = [car.year, car.brand, car.model, car.variant?.trim()]
    .filter((part) => part !== undefined && part !== null && String(part).trim() !== "")
    .join(" ");
  const fuel = capitalise(car.fuelType);
  return fuel ? `${name} (${fuel})` : name;
}

