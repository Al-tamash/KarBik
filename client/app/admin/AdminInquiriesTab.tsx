"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Phone,
  Mail,
  Car,
  Building2,
  Calendar,
} from "lucide-react";

export interface AdminInquiry {
  id: string;
  name: string;
  phone: string;
  message: string;
  status: string;
  priority: string;
  leadScore: number;
  leadSource?: string;
  isVerifiedByAdmin?: boolean;
  adminHold?: boolean;
  dealerIsSample?: boolean | null;
  adminNotes?: string;
  verifiedAt?: string | null;
  createdAt: string;
  buyerEmail: string | null;
  carId: string | null;
  carTitle: string | null;
  dealerId: string | null;
  dealerBusinessName: string | null;
}

interface AdminInquiriesTabProps {
  inquiries: AdminInquiry[];
  loading: boolean;
  onRefresh?: () => void;
}

export default function AdminInquiriesTab({
  inquiries: initialInquiries,
  loading,
  onRefresh,
}: AdminInquiriesTabProps) {
  const [inquiriesList, setInquiriesList] = useState<AdminInquiry[]>(initialInquiries);
  const [search, setSearch] = useState("");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState("");
  const [savingVerification, setSavingVerification] = useState(false);

  // Sync props to state
  useState(() => {
    setInquiriesList(initialInquiries);
  });

  const filteredInquiries = inquiriesList.filter((inq) => {
    const term = search.toLowerCase();
    return (
      inq.name.toLowerCase().includes(term) ||
      inq.phone.toLowerCase().includes(term) ||
      (inq.buyerEmail && inq.buyerEmail.toLowerCase().includes(term)) ||
      (inq.carTitle && inq.carTitle.toLowerCase().includes(term)) ||
      (inq.dealerBusinessName && inq.dealerBusinessName.toLowerCase().includes(term))
    );
  });

  async function handleVerifySubmit(inquiryId: string) {
    setSavingVerification(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiryId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isVerified: true, adminNotes: notesInput }),
      });
      if (res.ok) {
        const result = (await res.json().catch(() => ({}))) as { forwarded?: boolean };
        setInquiriesList((prev) =>
          prev.map((item) =>
            item.id === inquiryId
              ? {
                  ...item,
                  isVerifiedByAdmin: true,
                  adminHold: result.forwarded ? false : item.adminHold,
                  adminNotes: notesInput,
                  verifiedAt: new Date().toISOString(),
                }
              : item
          )
        );
        setVerifyingId(null);
        setNotesInput("");
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error("Failed to verify inquiry:", err);
    } finally {
      setSavingVerification(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-subtle" />
          <input
            type="text"
            placeholder="Search leads by customer, phone, car, or dealer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-alt/60 border border-border rounded-xl text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
        <div className="text-xs font-semibold text-ink-muted select-none flex items-center gap-3">
          <span>Total Inquiries: <strong className="text-ink">{inquiriesList.length}</strong></span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-surface rounded-2xl border border-border">
          <div className="h-7 w-7 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl border border-border">
          <MessageSquare className="h-10 w-10 text-ink-subtle mx-auto mb-3" />
          <p className="text-sm font-semibold text-ink-strong">No customer inquiries found</p>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-alt/40 text-xs font-bold text-ink-subtle uppercase tracking-wider select-none">
                  <th className="py-3 px-4">Customer Contact</th>
                  <th className="py-3 px-4">Car of Interest</th>
                  <th className="py-3 px-4">Destination Showroom</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Concierge Verification</th>
                  <th className="py-3 px-4 text-right">Inquiry Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredInquiries.map((inq) => {
                  const dateFormatted = new Date(inq.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <tr key={inq.id} className="hover:bg-surface-alt/40 transition-colors">
                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-ink-strong block">
                              {inq.name}
                            </span>
                            {inq.leadSource && inq.leadSource !== "car_detail" && (
                              <span className="px-1.5 py-0.2 rounded text-xs font-bold uppercase bg-surface-alt text-ink-subtle border border-border">
                                {inq.leadSource.replace(/_/g, " ")}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-ink-muted mt-0.5">
                            <span className="inline-flex items-center gap-1 font-medium text-ink">
                              <Phone className="h-3 w-3 text-primary-600" /> {inq.phone}
                            </span>
                            {inq.buyerEmail && (
                              <span className="inline-flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {inq.buyerEmail}
                              </span>
                            )}
                          </div>
                          {inq.message && (
                            <p className="text-xs text-ink-subtle line-clamp-1 italic mt-1">
                              &ldquo;{inq.message}&rdquo;
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Car */}
                      <td className="py-3.5 px-4">
                        {inq.carId ? (
                          <Link
                            href={`/cars/${inq.carId}`}
                            target="_blank"
                            className="font-semibold text-xs text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
                          >
                            <Car className="h-3.5 w-3.5 shrink-0" />
                            {inq.carTitle || "View Listing"}
                          </Link>
                        ) : (
                          <span className="text-xs text-ink-muted italic">General Showroom Inquiry</span>
                        )}
                      </td>

                      {/* Dealer */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-semibold text-ink inline-flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-ink-subtle" />
                          {inq.dealerBusinessName || "Independent Dealer"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-50 text-primary-700 border border-primary-200">
                          {inq.status}
                        </span>
                      </td>

                      {/* Concierge Verification */}
                      <td className="py-3.5 px-4 text-center">
                        {inq.isVerifiedByAdmin ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-success-50 text-success-700 border border-success-200">
                              ✓ Concierge Verified
                            </span>
                            {inq.adminNotes && (
                              <span className="text-xs text-ink-subtle mt-0.5 max-w-[130px] truncate" title={inq.adminNotes}>
                                {inq.adminNotes}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="inline-flex flex-col items-center gap-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-warning-50 text-warning-700 border border-warning-200">
                              Pending Call
                            </span>
                            {inq.dealerIsSample ? (
                              <span className="text-xs text-ink-muted">Sample listing: not forwarded to any dealer</span>
                            ) : inq.adminHold ? (
                              <span className="text-xs text-ink-muted">Held: the dealer cannot see it yet</span>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => {
                                setVerifyingId(inq.id);
                                setNotesInput(inq.adminNotes || "Buyer requirement & budget verified on phone call.");
                              }}
                              className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline cursor-pointer"
                            >
                              Verify & Forward →
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-xs text-ink-muted inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {dateFormatted}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Concierge Verification Modal */}
      {verifyingId && (
        <div
          className="fixed inset-0 z-90 bg-black/60 backdrop-blur-xs flex items-center justify-center px-4"
          onClick={() => setVerifyingId(null)}
        >
          <div
            className="w-full max-w-md bg-surface rounded-2xl shadow-xl overflow-hidden border border-border p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="text-base font-bold text-ink-strong">
                Verify & Forward Lead to Dealer
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">
                Confirm you spoke to the buyer and validated their intent. This marks the lead as high-priority in the dealer&apos;s CRM.
              </p>
            </div>

            <div>
              <label className="label text-xs">Concierge Verification Note for Dealer</label>
              <textarea
                rows={3}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="e.g. Spoke with customer. Budget 4.5L confirmed, interested in weekend test drive."
                className="input text-xs resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setVerifyingId(null)}
                className="btn btn-outline btn-sm text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingVerification}
                onClick={() => handleVerifySubmit(verifyingId)}
                className="btn btn-primary btn-sm text-xs font-bold"
              >
                {savingVerification ? "Saving..." : "Confirm & Mark Verified"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

