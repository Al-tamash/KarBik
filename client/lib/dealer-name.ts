/**
 * The name a buyer sees for a dealer.
 *
 * Dealers type their business name with a tagline and an area after a dash, for example
 * "Apex Motors - Certified Pre-Owned Jubilee Hills". The tagline is a claim KarBik cannot back
 * and the area narrows the showroom down to a street, so only the part before the first
 * separator is shown. The stored name is untouched; fixing it is a data edit.
 */
export function dealerDisplayName(name: string | null | undefined): string {
  const full = (name ?? "").trim();
  if (!full) return "";
  const short = full.split(/\s+[-–—|]\s+/)[0]?.trim();
  return short || full;
}
