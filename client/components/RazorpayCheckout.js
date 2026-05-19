"use client";

/**
 * RazorpayCheckout — Handles the Razorpay payment popup
 *
 * HOW THIS COMPONENT WORKS:
 * 1. Dealer clicks "Subscribe" on a plan card
 * 2. We call our backend to create a Razorpay order
 * 3. We open the Razorpay checkout popup with that order
 * 4. Dealer pays (card/UPI/netbanking)
 * 5. Razorpay sends back payment details
 * 6. We send those details to our backend for verification
 * 7. If verified → subscription activated → redirect to dashboard
 *
 * IMPORTANT: The Razorpay checkout.js script must be loaded in layout.js
 * via <Script src="https://checkout.razorpay.com/v1/checkout.js" />
 * That script puts a global `Razorpay` class on the window object.
 */

const API = process.env.NEXT_PUBLIC_API_URL;

export default function RazorpayCheckout({ plan, user, isRecommended, onSuccess }) {
  /**
   * handlePayment — Orchestrates the entire payment flow
   *
   * This function runs the 3-step flow:
   * Step 1: Create order on our server
   * Step 2: Open Razorpay popup
   * Step 3: Verify payment on our server
   */
  async function handlePayment() {
    try {
      // ── Step 1: Create a Razorpay order on our backend ──
      // We send the plan._id, and the server fetches the real price from DB
      // (NEVER trust the price from the frontend — security rule)
      const orderRes = await fetch(`${API}/api/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // send auth cookies
        body: JSON.stringify({ planId: plan._id }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        alert(orderData.message || "Failed to create order");
        return;
      }

      // ── Step 2: Open the Razorpay checkout popup ──
      // The Razorpay class is available globally because we loaded
      // checkout.js in layout.js
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AutoBazaar",
        description: `${orderData.planName} Plan — Monthly Subscription`,
        order_id: orderData.orderId,

        // Prefill dealer's info so they don't have to type it
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },

        // Theme customization — match our brand primary indigo color (primary-600)
        theme: {
          color: "#4F46E5",
        },

        /**
         * handler — Called when payment is SUCCESSFUL
         *
         * Razorpay passes us three things:
         * - razorpay_order_id: the order we created in Step 1
         * - razorpay_payment_id: unique ID for this payment
         * - razorpay_signature: cryptographic proof the payment is real
         *
         * We send all three to our backend for verification.
         */
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API}/api/payments/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok) {
              // Payment verified + subscription activated!
              if (onSuccess) onSuccess(verifyData);
            } else {
              alert(verifyData.message || "Payment verification failed");
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Something went wrong verifying your payment.");
          }
        },

        // Called if the dealer closes the popup without paying
        modal: {
          ondismiss: function () {
            console.log("Payment popup closed by user");
          },
        },
      };

      // Create and open the Razorpay checkout popup
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Something went wrong. Please try again.");
    }
  }

  // Assign proper button styles based on plan status (Recommended Starter gets Accent Orange, others get Primary Indigo)
  const buttonClass = isRecommended
    ? "btn btn-md btn-accent btn-full py-3 rounded-xl tracking-wider uppercase font-bold text-xs"
    : "btn btn-md btn-primary btn-full py-3 rounded-xl tracking-wider uppercase font-bold text-xs";

  return (
    <button
      onClick={handlePayment}
      className={buttonClass}
    >
      Subscribe to {plan.name}
    </button>
  );
}
