/**
 * Where leads go. Decided with the business owner:
 *  - Buyers never contact a dealer directly. Every lead, WhatsApp or callback, goes to
 *    KarBik support first (ROUTE_ALL_LEADS_VIA_SUPPORT): the WhatsApp button opens a
 *    chat with SUPPORT_PHONE, and the lead is held (adminHold) until support has spoken
 *    to the buyer and forwards it to the dealer. The dealer's own number is never shown.
 *  - Set ROUTE_ALL_LEADS_VIA_SUPPORT to false to go back to "WhatsApp straight to the
 *    dealer" once lead volume outgrows a single support desk.
 *  - HOLD_CALLBACKS_FOR_ADMIN only matters when the flag above is off.
 *  - Sample (demo) showrooms never receive a lead: everything goes to support.
 */
export const ROUTE_ALL_LEADS_VIA_SUPPORT = true;
export const HOLD_CALLBACKS_FOR_ADMIN = true;

/** KarBik support (call + WhatsApp). National 10-digit form. */
export const SUPPORT_PHONE = "9494720878";
export const SUPPORT_PHONE_DISPLAY = "94947 20878";
export const SUPPORT_EMAIL = "support@karbik.com";

/** Mailbox that is alerted about held leads. Override with SUPPORT_ALERT_EMAIL. */
export function supportAlertEmail(): string {
  return process.env.SUPPORT_ALERT_EMAIL || SUPPORT_EMAIL;
}
