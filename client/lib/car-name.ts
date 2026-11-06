/**
 * Human display name for a listing, e.g. "2023 Tata Nexon EV".
 *
 * Dealers often type the year and brand into the title already
 * ("2023 Tata Nexon EV"), so blindly prefixing them gave "2023 Tata 2023 Tata Nexon EV".
 * Only add what is missing.
 */
export function displayCarName(car: { year: number; brand: string; title: string }): string {
  const title = car.title.trim();
  const hasYear = (" " + title + " ").includes(" " + car.year + " ");
  const hasBrand = title.toLowerCase().includes(car.brand.toLowerCase());
  return [hasYear ? "" : String(car.year), hasBrand ? "" : car.brand, title].filter(Boolean).join(" ");
}
