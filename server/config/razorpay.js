/**
 * Razorpay SDK Configuration
 *
 * This creates a single Razorpay instance that the entire server shares.
 * Same pattern as db.js — one connection, used everywhere.
 *
 * HOW RAZORPAY WORKS (real-world analogy):
 * Think of Razorpay as a cash register at a store.
 * - key_id is like the store's public ID (visible on receipts)
 * - key_secret is like the store manager's master key (stays locked in the safe)
 *
 * The server uses BOTH keys to create orders and verify payments.
 * The frontend only gets the key_id to open the checkout popup.
 */
import Razorpay from "razorpay";

// Create the Razorpay instance with API credentials from .env
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default razorpay;
