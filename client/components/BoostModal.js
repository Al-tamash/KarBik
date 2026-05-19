"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function BoostModal({ car, user, onClose, onBoostSuccess }) {
  const [selectedTier, setSelectedTier] = useState("3day");
  const [loading, setLoading] = useState(false);

  const tiers = [
    { id: "1day", label: "1 Day Spotlight", price: 99 },
    { id: "3day", label: "3 Day Spotlight", price: 249, recommended: true },
    { id: "7day", label: "7 Day Spotlight", price: 499 },
  ];

  async function handleBoostPayment() {
    try {
      setLoading(true);

      // 1. Create Boost Order
      const orderRes = await fetch(`${API}/api/boosts/cars/${car._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ boostType: selectedTier }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        alert(orderData.message || "Failed to create boost order");
        setLoading(false);
        return;
      }

      // 2. Open Razorpay Popup
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AutoBazaar",
        description: `Boost: ${orderData.planName} for ${car.title}`,
        order_id: orderData.orderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#f59e0b", // Amber/Gold color for boosts
        },
        handler: async function (response) {
          try {
            // 3. Verify Payment
            const verifyRes = await fetch(`${API}/api/boosts/verify`, {
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
              onBoostSuccess(verifyData.boost);
            } else {
              alert(verifyData.message || "Payment verification failed");
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Something went wrong verifying your payment.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-900"
        >
          ✕
        </button>
        
        <h2 className="text-xl font-bold text-neutral-900 mb-1 flex items-center gap-2">
          <span>⚡</span> Boost Listing
        </h2>
        <p className="text-sm text-neutral-500 mb-6">
          Get up to 10x more views by featuring your <span className="font-semibold text-neutral-900">{car.title}</span> at the top of search results.
        </p>

        <div className="space-y-3 mb-6">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              onClick={() => setSelectedTier(tier.id)}
              className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${
                selectedTier === tier.id
                  ? "border-accent-500 bg-accent-50"
                  : "border-neutral-200 hover:border-accent-200"
              }`}
            >
              {tier.recommended && (
                <span className="absolute -top-2.5 right-4 rounded-full bg-accent-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                  Recommended
                </span>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-bold ${selectedTier === tier.id ? "text-accent-900" : "text-neutral-900"}`}>
                    {tier.label}
                  </h3>
                </div>
                <p className={`text-lg font-bold ${selectedTier === tier.id ? "text-accent-600" : "text-neutral-900"}`}>
                  ₹{tier.price}
                </p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleBoostPayment}
          disabled={loading}
          className="w-full rounded-xl bg-linear-to-r from-accent-500 to-accent-600 py-3.5 text-sm font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-accent-500/20"
        >
          {loading ? "Processing..." : `Pay ₹${tiers.find(t => t.id === selectedTier)?.price} to Boost`}
        </button>
      </div>
    </div>
  );
}
