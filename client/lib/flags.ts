/**
 * Dealer reviews are switched off on buyer pages until the owner confirms the reviews in
 * the database are real. PRODUCT.md: "No real customer testimonials ... do not fabricate",
 * yet the database holds a few 5-star reviews, and one names the dealer in its text, which
 * would let a buyer skip KarBik. While this is false the car page neither fetches nor
 * serialises reviews, and the dealer's user id is blanked from the buyer-facing props.
 * Set to true once the reviews are verified or removed.
 */
export const SHOW_DEALER_REVIEWS = false;

/**
 * Online payments (dealer plans and paid boosts) are OFF unless NEXT_PUBLIC_PAYMENTS_ENABLED is
 * exactly "true". The real Razorpay account does not exist yet and the keys in use are test
 * keys: with them a valid test-card signature would activate a paid plan for nothing. While
 * off, the payment routes answer 503 and the dashboard says paid plans open soon. Boosts that
 * spend a plan credit do not use Razorpay and are not affected.
 * Turn on (Vercel env, then redeploy) only after live keys are set and one real payment worked.
 * NEXT_PUBLIC_ so the browser reads the same value; it is inlined at build time.
 */
export const PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";

export const PAYMENTS_CLOSED_MESSAGE =
  "Online payments are not open yet. Message KarBik support and we will tell you when paid plans start.";

/**
 * The dealer banner photo on a storefront and in its share card. Off for now: the banners in
 * the database are not the dealers' own showrooms. One is a photo of another business with its
 * name on the signboard, the other two are Unsplash stock images. Showing them tells a buyer
 * something false. Set to true once each dealer's banner is a photo of their own showroom.
 */
export const SHOW_DEALER_BANNER = false;

/**
 * The "Verify RTO" lookup on the car forms. It is OFF: lib/vahan.ts is a mock that invents a make,
 * model, year, fuel, colour, insurance and owner for ANY well-formed plate, and the form showed it
 * under a green "RTO Verified" badge and could auto-fill the listing from it. Turn it on only when
 * a real provider replaces the mock (and drop the owner name from what it returns).
 * NEXT_PUBLIC_ so the form and the route read the same value.
 */
export const VEHICLE_LOOKUP_ENABLED = process.env.NEXT_PUBLIC_VEHICLE_LOOKUP_ENABLED === "true";
