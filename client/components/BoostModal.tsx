"use client";

import { useEffect, useState } from "react";
import { X, Zap } from "lucide-react";
import type { ApiCar } from "@/lib/api-types";



export default function BoostModal({ car, user, onClose, onBoostSuccess }: {
  car: ApiCar;
  user?: { name?: string; email?: string; role?: string } | null;
  onClose: () => void;
  onBoostSuccess: (boost: { type: string; endDate: string }) => void;
}) {
  const [selectedTier, setSelectedTier] = useState("3day");
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState<{ total: number; remaining: number } | null>(null);

  // Plan boost credits (Starter/Pro). Null until loaded, or for plans without any.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/boosts/credits", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { total: number; remaining: number } | null) => {
        if (!cancelled && d && d.total > 0) setCredits(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleUseCredit() {
    try {
      setLoading(true);
      const res = await fetch(`/api/boosts/cars/${car.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ useCredit: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Could not use a boost credit");
        return;
      }
      onBoostSuccess({ type: "3day", endDate: data.endDate });
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const tiers = [
    { id: "1day", label: "1 Day Spotlight", price: 99 },
    { id: "3day", label: "3 Day Spotlight", price: 249, recommended: true },
    { id: "7day", label: "7 Day Spotlight", price: 499 },
  ];

  async function handleBoostPayment() {
    try {
      setLoading(true);

      // 1. Create Boost Order
      const orderRes = await fetch(`/api/boosts/cars/${car.id}`, {
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
        name: "KarBik",
        description: `Boost: ${orderData.planName} for ${car.title}`,
        order_id: orderData.orderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#f59e0b", // warning-500 — literal hex required by Razorpay checkout config
        },
        handler: async function (response: Record<string, string>) {
          try {
            // 3. Verify Payment
            const verifyRes = await fetch(`/api/boosts/verify`, {
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

      const RazorpayCtor = window.Razorpay;
      if (!RazorpayCtor) {
        alert("Payment gateway failed to load. Please refresh and try again.");
        setLoading(false);
        return;
      }
      const rzp = new RazorpayCtor(options);
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
          aria-label="Close"
          className="absolute top-4 right-4 text-ink-muted hover:text-ink-strong"
        >
          <X className="h-5 w-5" />
        </button>
        
        <h2 className="text-xl font-bold text-neutral-900 mb-1 flex items-center gap-2">
          <Zap className="h-5 w-5 text-warning-500" aria-hidden /> Boost Listing
        </h2>
        <p className="text-sm text-neutral-500 mb-6">
          Featured listings are shown first in search results. Boost <span className="font-semibold text-neutral-900">{car.title}</span> to move it to the top.
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
                <span className="absolute -top-2.5 right-4 rounded-full bg-accent-500 px-2 py-0.5 text-xs font-bold text-neutral-900 uppercase tracking-wider">
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

        {credits && credits.remaining > 0 && (
          <button
            onClick={handleUseCredit}
            disabled={loading}
            className="mb-3 w-full rounded-xl border-2 border-accent-500 bg-accent-50 py-3.5 text-sm font-bold text-accent-900 hover:bg-accent-100 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            Use 1 plan credit — 3 Day Spotlight ({credits.remaining} of {credits.total} left this month)
          </button>
        )}

        <button
          onClick={handleBoostPayment}
          disabled={loading}
          className="w-full rounded-xl bg-linear-to-r from-accent-500 to-accent-400 py-3.5 text-sm font-bold text-neutral-900 hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-accent-500/20"
        >
          {loading ? "Processing..." : `Pay ₹${tiers.find(t => t.id === selectedTier)?.price} to Boost`}
        </button>
      </div>
    </div>
  );
}
