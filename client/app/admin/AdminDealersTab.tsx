"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Phone,
  MapPin,
  Car,
  Star,
  Search,
} from "lucide-react";

export interface AdminDealer {
  id: string;
  userId: string;
  businessName: string;
  slug: string | null;
  phone: string;
  address: string;
  city: string;
  isVerified: boolean;
  verificationDoc?: { url: string; publicId: string } | null;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  ownerName: string | null;
  ownerEmail: string | null;
  carsCount: number;
}

interface AdminDealersTabProps {
  dealers: AdminDealer[];
  loading: boolean;
  onToggleVerify: (dealerId: string, currentVerified: boolean) => Promise<void>;
}

export default function AdminDealersTab({
  dealers,
  loading,
  onToggleVerify,
}: AdminDealersTabProps) {
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  // One-time login details shown to the admin after creating/resetting access.
  const [access, setAccess] = useState<{ email: string; password: string; created: boolean } | null>(null);
  const [accessError, setAccessError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleAccess = async (dealer: AdminDealer) => {
    if (!confirm(`Create or reset the login for ${dealer.businessName || "this dealer"}? Any current password stops working.`)) return;
    setUpdatingId(dealer.id);
    setAccessError("");
    try {
      const res = await fetch(`/api/admin/dealers/${dealer.id}/access`, {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as {
        email?: string;
        temporaryPassword?: string;
        created?: boolean;
        error?: string;
      };
      if (!res.ok || !data.temporaryPassword) {
        setAccessError(data.error || "Could not create the login.");
        return;
      }
      setCopied(false);
      setAccess({ email: data.email ?? "", password: data.temporaryPassword, created: Boolean(data.created) });
    } catch {
      setAccessError("Network error while creating the login.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredDealers = dealers.filter((d) => {
    const term = search.toLowerCase();
    return (
      d.businessName.toLowerCase().includes(term) ||
      d.city.toLowerCase().includes(term) ||
      (d.address && d.address.toLowerCase().includes(term)) ||
      (d.ownerEmail && d.ownerEmail.toLowerCase().includes(term))
    );
  });

  const handleToggle = async (dealerId: string, currentVerified: boolean) => {
    setUpdatingId(dealerId);
    try {
      await onToggleVerify(dealerId, currentVerified);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Summary Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-subtle" />
          <input
            type="text"
            placeholder="Search dealers by name, location, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-alt/60 border border-border rounded-xl text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
        <div className="text-xs font-semibold text-ink-muted select-none flex items-center gap-3">
          <span>Total: <strong className="text-ink">{dealers.length}</strong></span>
          <span>Verified: <strong className="text-success-600">{dealers.filter(d => d.isVerified).length}</strong></span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-surface rounded-2xl border border-border">
          <div className="h-7 w-7 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
        </div>
      ) : filteredDealers.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl border border-border">
          <Building2 className="h-10 w-10 text-ink-subtle mx-auto mb-3" />
          <p className="text-sm font-semibold text-ink-strong">No dealerships match your search</p>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-alt/40 text-xs font-bold text-ink-subtle uppercase tracking-wider select-none">
                  <th className="py-3 px-4">Dealership / Owner</th>
                  <th className="py-3 px-4">Showroom Location</th>
                  <th className="py-3 px-4 text-center">Inventory</th>
                  <th className="py-3 px-4 text-center">Reviews</th>
                  <th className="py-3 px-4 text-center">Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDealers.map((dealer) => {
                  const isUpdating = updatingId === dealer.id;
                  return (
                    <tr key={dealer.id} className="hover:bg-surface-alt/40 transition-colors">
                      {/* Name & Owner */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-xl bg-primary-50 text-primary-700 border border-primary-100 flex items-center justify-center shrink-0 mt-0.5">
                            <Building2 className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <span className="font-bold text-ink-strong block leading-snug">
                              {dealer.businessName || "Unnamed Dealer"}
                            </span>
                            <span className="text-xs text-ink-muted block mt-0.5">
                              {dealer.ownerEmail || dealer.ownerName || "No email"}
                            </span>
                            {dealer.phone && (
                              <span className="text-xs text-ink-subtle inline-flex items-center gap-1 mt-0.5">
                                <Phone className="h-3 w-3" /> {dealer.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-1.5 text-xs text-ink">
                          <MapPin className="h-3.5 w-3.5 text-ink-subtle shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold block">{dealer.city || "Hyderabad"}</span>
                            <span className="text-xs text-ink-muted line-clamp-1">
                              {dealer.address || "Showroom address pending"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Cars Count */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-alt font-bold text-xs text-ink border border-border">
                          <Car className="h-3 w-3 text-ink-subtle" />
                          {dealer.carsCount}
                        </span>
                      </td>

                      {/* Reviews */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink">
                          <Star className="h-3.5 w-3.5 fill-warning-500 text-warning-500" />
                          {Number(dealer.averageRating || 0).toFixed(1)}
                          <span className="text-xs text-ink-subtle">({dealer.totalReviews})</span>
                        </span>
                      </td>

                      {/* Verification Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {dealer.isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-success-700 bg-success-50 border border-success-200">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Verified
                          </span>
                        ) : dealer.verificationDoc ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-warning-700 bg-warning-50 border border-warning-200">
                            Pending review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-ink-subtle bg-surface-alt border border-border">
                            <XCircle className="h-3.5 w-3.5" />
                            Unverified
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => void handleAccess(dealer)}
                            disabled={isUpdating}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold border border-border text-ink hover:bg-surface-alt transition-all cursor-pointer disabled:opacity-50"
                          >
                            Dealer login
                          </button>
                          {dealer.verificationDoc?.url ? (
                            <a
                              href={dealer.verificationDoc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg text-xs font-bold border border-border text-ink hover:bg-surface-alt transition-all"
                            >
                              View document
                            </a>
                          ) : (
                            <span className="text-xs text-ink-subtle">No document</span>
                          )}
                          <button
                            onClick={() => handleToggle(dealer.id, dealer.isVerified)}
                            disabled={isUpdating}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              dealer.isVerified
                                ? "border border-danger-200 text-danger-700 bg-danger-50 hover:bg-danger-100"
                                : "bg-primary-600 text-white hover:bg-primary-700 shadow-xs"
                            } disabled:opacity-50`}
                          >
                            {isUpdating ? "Saving..." : dealer.isVerified ? "Revoke" : "Verify Dealer"}
                          </button>

                          {dealer.slug && (
                            <Link
                              href={`/dealer/${dealer.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-lg border border-border text-ink-muted hover:text-primary-600 hover:border-primary-300 transition-colors"
                              title="Open public showroom"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {accessError && (
        <p className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-2 text-sm text-danger-700">{accessError}</p>
      )}

      {access && (
        <div className="fixed inset-0 z-90 flex items-center justify-center bg-black/60 px-4" onClick={() => setAccess(null)}>
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl border border-border" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-ink-strong">
              {access.created ? "Login created" : "Login reset"}
            </h3>
            <p className="mt-1 text-xs text-ink-muted">
              This password is shown only once. Send it to the dealer privately and ask them to change it in Settings → Password.
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-ink-muted">Email (login)</dt>
                <dd className="mt-0.5 font-mono text-ink-strong break-all">{access.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-ink-muted">Temporary password</dt>
                <dd className="mt-0.5 font-mono text-ink-strong break-all">{access.password}</dd>
              </div>
            </dl>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                className="btn btn-primary btn-md flex-1"
                onClick={async () => {
                  await navigator.clipboard.writeText(`Email: ${access.email}
Password: ${access.password}`);
                  setCopied(true);
                }}
              >
                {copied ? "Copied" : "Copy both"}
              </button>
              <button type="button" className="btn btn-outline btn-md" onClick={() => setAccess(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
