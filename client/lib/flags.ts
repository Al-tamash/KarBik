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
 * The dealer banner photo on a storefront and in its share card. Off for now: the banners in
 * the database are not the dealers' own showrooms. One is a photo of another business with its
 * name on the signboard, the other two are Unsplash stock images. Showing them tells a buyer
 * something false. Set to true once each dealer's banner is a photo of their own showroom.
 */
export const SHOW_DEALER_BANNER = false;
