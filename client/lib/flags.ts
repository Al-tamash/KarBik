/**
 * Dealer reviews are switched off on buyer pages until the owner confirms the reviews in
 * the database are real. PRODUCT.md: "No real customer testimonials ... do not fabricate",
 * yet the database holds a few 5-star reviews, and one names the dealer in its text, which
 * would let a buyer skip KarBik. While this is false the car page neither fetches nor
 * serialises reviews, and the dealer's user id is blanked from the buyer-facing props.
 * Set to true once the reviews are verified or removed.
 */
export const SHOW_DEALER_REVIEWS = false;
