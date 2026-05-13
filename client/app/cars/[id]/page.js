"use client";

/**
 * Car Detail Page — Shows full information about a single car listing
 *
 * Displays image gallery, car details, and an inquiry form for buyers.
 * The inquiry form only appears for logged-in buyers (not for dealers
 * viewing their own listing, and not for anonymous visitors).
 */
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function CarDetailPage({ params }) {
  const { id } = use(params);
  const { data: session } = authClient.useSession();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  // Inquiry form state
  const [inquiry, setInquiry] = useState({ name: "", phone: "", message: "" });
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [inquiryStatus, setInquiryStatus] = useState(""); // "success" | "error" | ""
  const [inquiryMessage, setInquiryMessage] = useState("");

  useEffect(() => {
    async function fetchCar() {
      try {
        const res = await fetch(`${API}/api/cars/${id}`);
        if (!res.ok) {
          setError("Car not found");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setCar(data);
      } catch (err) {
        setError("Failed to load car details");
      }
      setLoading(false);
    }
    fetchCar();
  }, [id]);

  // Pre-fill name from session when it loads
  useEffect(() => {
    if (session?.user?.name) {
      setInquiry((prev) => ({ ...prev, name: session.user.name }));
    }
  }, [session]);

  async function handleInquirySubmit(e) {
    e.preventDefault();
    setSendingInquiry(true);
    setInquiryStatus("");

    try {
      const res = await fetch(`${API}/api/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          car: id,
          name: inquiry.name,
          phone: inquiry.phone,
          message: inquiry.message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setInquiryStatus("error");
        setInquiryMessage(data.message || "Failed to send inquiry");
      } else {
        setInquiryStatus("success");
        setInquiryMessage("Inquiry sent! The dealer will contact you.");
        setInquiry({ name: session?.user?.name || "", phone: "", message: "" });
      }
    } catch (err) {
      setInquiryStatus("error");
      setInquiryMessage("Network error — please try again");
    }

    setSendingInquiry(false);
  }

  // Determine if the inquiry form should be visible
  const isLoggedIn = !!session;
  const isDealer = session?.user?.role === "dealer";
  const isOwnListing = car && isDealer && car.dealer === session?.user?.id;
  const showInquiryForm = isLoggedIn && !isOwnListing;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
          <p className="text-sm font-medium text-muted">Loading car details...</p>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-center px-4">
        <span className="text-5xl mb-4">😔</span>
        <h1 className="text-xl font-bold text-foreground mb-2">
          {error || "Car not found"}
        </h1>
        <Link href="/cars" className="mt-4 text-sm font-semibold text-primary hover:underline">
          ← Back to listings
        </Link>
      </div>
    );
  }

  const hasImages = car.images && car.images.length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

        <Link
          href="/cars"
          className="inline-flex items-center text-sm font-medium text-muted hover:text-foreground transition-colors mb-6"
        >
          ← Back to listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ─── Image Gallery ─── */}
          <div>
            <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 border border-border">
              {hasImages ? (
                <img
                  src={car.images[activeImage].url}
                  alt={car.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                  <span className="text-6xl">🚗</span>
                </div>
              )}
            </div>

            {hasImages && car.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {car.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 cursor-pointer transition-all ${
                      i === activeImage
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-muted"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`${car.title} - ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Car Info ─── */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
              {car.brand}
            </p>
            <h1 className="text-2xl font-bold text-foreground leading-tight mb-2">
              {car.title}
            </h1>
            <p className="text-3xl font-bold text-foreground mb-6">
              ₹{car.price.toLocaleString("en-IN")}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="rounded-xl bg-white border border-border p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Brand</p>
                <p className="text-sm font-bold text-foreground">{car.brand}</p>
              </div>
              <div className="rounded-xl bg-white border border-border p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Year</p>
                <p className="text-sm font-bold text-foreground">{car.year}</p>
              </div>
              <div className="rounded-xl bg-white border border-border p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Posted</p>
                <p className="text-sm font-bold text-foreground">
                  {new Date(car.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </p>
              </div>
              <div className="rounded-xl bg-white border border-border p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Images</p>
                <p className="text-sm font-bold text-foreground">{car.images?.length || 0} photos</p>
              </div>
            </div>

            {car.description && (
              <div className="rounded-xl bg-white border border-border p-5 mb-6">
                <h2 className="text-sm font-bold text-foreground mb-2">Description</h2>
                <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
                  {car.description}
                </p>
              </div>
            )}

            {/* ─── Inquiry Form ─── */}
            {showInquiryForm ? (
              <div className="rounded-xl border border-border bg-white p-5">
                <h2 className="text-sm font-bold text-foreground mb-3">
                  📩 Interested? Send an inquiry
                </h2>

                {inquiryStatus === "success" && (
                  <div className="mb-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                    ✅ {inquiryMessage}
                  </div>
                )}
                {inquiryStatus === "error" && (
                  <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    ❌ {inquiryMessage}
                  </div>
                )}

                <form onSubmit={handleInquirySubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">Your Name *</label>
                      <input
                        type="text" required value={inquiry.name}
                        onChange={(e) => setInquiry({ ...inquiry, name: e.target.value })}
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Rahul Kumar"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">Phone *</label>
                      <input
                        type="tel" required value={inquiry.phone}
                        onChange={(e) => setInquiry({ ...inquiry, phone: e.target.value })}
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="9876543210"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Message *</label>
                    <textarea
                      required value={inquiry.message}
                      onChange={(e) => setInquiry({ ...inquiry, message: e.target.value })}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      rows={3}
                      placeholder="Is this car still available? I'd like to schedule a test drive..."
                    />
                  </div>
                  <button
                    type="submit" disabled={sendingInquiry}
                    className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 cursor-pointer transition-opacity"
                  >
                    {sendingInquiry ? "Sending..." : "Send Inquiry"}
                  </button>
                </form>
              </div>
            ) : !isLoggedIn ? (
              <div className="rounded-xl border border-border bg-white p-5 text-center">
                <p className="text-sm text-muted mb-2">Want to inquire about this car?</p>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Log in to send an inquiry →
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
