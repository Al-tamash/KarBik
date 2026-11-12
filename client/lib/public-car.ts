/**
 * Fields of a car row that public API responses must not carry.
 * - registrationNumber: with it anyone can look the owner up on VAHAN, and it ties
 *   a listing to a physical car. Only the owning dealer and admins get it back.
 * - searchVector: an internal Postgres text-search column, just noise on the wire.
 */
export function stripPrivateCarFields<T extends object>(
  car: T,
): Omit<T, "registrationNumber" | "searchVector"> {
  const copy = { ...car } as Record<string, unknown>;
  delete copy.registrationNumber;
  delete copy.searchVector;
  return copy as Omit<T, "registrationNumber" | "searchVector">;
}
