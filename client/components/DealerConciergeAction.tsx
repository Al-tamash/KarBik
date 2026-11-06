"use client";

import React, { useState } from "react";
import { Phone, ShieldCheck, CheckCircle2, X } from "lucide-react";
import { useAppSession } from "@/lib/auth-client";

/**
 * DealerConciergeAction — Zero Lead Leakage Contact Action
 * 
 * WHAT: Replaces raw unmonitored dealer phone exposure with a managed
 *       Concierge Request Callback form and platform hotline.
 * WHY: Prevents direct phone leakage and ensures every buyer connection
 *      is logged, verified by admin concierge, and routed with proof of intent.
 */
export default function DealerConciergeAction({
  dealerId,
  dealerName,
  dealerCity,
}: {
  dealerId: string;
  dealerName: string;
  dealerCity: string;
}) {
  const { data: session } = useAppSession();
  const [openModal, setOpenModal] = useState(false);
  const [phone, setPhone] = useState(
    (session?.user as { phone?: string })?.phone || ""
  );
  const [name, setName] = useState(session?.user?.name || "");
  const [message, setMessage] = useState(
    `Looking for verified cars at ${dealerName}. Please connect me with the showroom manager.`
  );
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  async function handleCallbackSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setStatus("error");
      setStatusMessage("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setSubmitting(true);
    setStatus("idle");
    setStatusMessage("");

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          dealer: dealerId,
          name: name || session?.user?.name || "Interested Buyer",
          phone: cleanPhone,
          message,
          leadSource: "dealer_profile",
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Failed to submit callback request.");
      }

      setStatus("success");
      setStatusMessage(
        "Request received! KarBik support will call you shortly, then connect you with this showroom."
      );
    } catch (err) {
      setStatus("error");
      setStatusMessage(
        (err as Error).message || "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <button
          type="button"
          onClick={() => {
            if (session?.user) {
              setName(session.user.name || "");
              setPhone((session.user as { phone?: string })?.phone || "");
            }
            setOpenModal(true);
          }}
          className="btn btn-primary btn-md rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <Phone className="h-4 w-4" />
          Request Showroom Callback
        </button>

        <a
          href="tel:+919494720878"
          className="btn btn-outline btn-md rounded-xl text-ink font-semibold hover:bg-surface-alt transition-colors"
        >
          <ShieldCheck className="h-4 w-4 text-primary-600" />
          KarBik Support: 94947 20878
        </a>
      </div>

      <p className="mt-2 text-xs text-ink-subtle flex items-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-primary-600" />
        Free for buyers • KarBik support follows up on your request
      </p>

      {/* Modal Overlay */}
      {openModal && (
        <div
          className="fixed inset-0 z-90 bg-black/60 backdrop-blur-xs flex items-center justify-center px-4"
          onClick={() => setOpenModal(false)}
        >
          <div
            className="w-full max-w-md bg-surface rounded-2xl shadow-xl overflow-hidden border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div>
                <h3 className="text-lg font-bold text-ink-strong">
                  Connect with {dealerName}
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Showroom in {dealerCity || "Hyderabad"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpenModal(false)}
                className="h-8 w-8 rounded-full bg-surface-alt flex items-center justify-center text-ink-muted hover:text-ink transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6">
              {status === "success" ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-success-50 text-success-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-bold text-ink-strong">
                    Request received!
                  </h4>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    {statusMessage}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenModal(false);
                      setStatus("idle");
                    }}
                    className="btn btn-outline btn-sm mt-3"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCallbackSubmit} className="space-y-4">
                  <div>
                    <label className="label">Your Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">10-Digit Mobile Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      placeholder="e.g. 9876543210"
                      className="input"
                      required
                    />
                    <p className="helper-text">
                      The showroom team will call you back on this number.
                    </p>
                  </div>

                  <div>
                    <label className="label">Your Note / Interest (Optional)</label>
                    <textarea
                      rows={2}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="input resize-none"
                    />
                  </div>

                  {status === "error" && (
                    <p className="error-text text-xs">{statusMessage}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary btn-full py-3 font-bold"
                  >
                    {submitting ? "Sending request..." : "Submit Callback Request"}
                  </button>
                  <p className="text-xs text-ink-muted text-center leading-relaxed">
                    By submitting, you allow KarBik and this showroom to call or WhatsApp you on this number.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
