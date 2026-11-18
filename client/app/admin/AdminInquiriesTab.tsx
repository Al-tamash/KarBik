"use client";

/**
 * Buyer leads for KarBik support. Every lead waits here until support has spoken to the buyer
 * and does "Verify and forward" (PRODUCT.md: buyers never contact a dealer directly). Built for a
 * phone: one list, a Call and a WhatsApp link on every lead, and a sheet that cannot be
 * confirmed without saying you spoke to the buyer. The note is the support person's own words;
 * the dealer sees it, so nothing is pre-filled for them.
 */

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { MessageCircle, Phone, Search } from "lucide-react";

import AdminSheet from "@/components/admin/AdminSheet";

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

type Filter = "needs" | "forwarded" | "all";
type LeadState = "needs" | "sample" | "forwarded" | "verified";

/** The one place that decides what state a lead is in. */
export function leadState(inq: AdminInquiry): LeadState {
  if (!inq.isVerifiedByAdmin) return inq.dealerIsSample ? "sample" : "needs";
  return inq.adminHold ? "verified" : "forwarded";
}

const STATE_LABEL: Record<LeadState, string> = {
  needs: "Needs a call",
  sample: "Sample dealer, not forwarded",
  forwarded: "Forwarded to the dealer",
  verified: "Verified, not forwarded",
};

/** A 10-digit Indian mobile number from what the buyer typed, or "" when it is not one. */
function indianMobile(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const ten = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  return /^[6-9]\d{9}$/.test(ten) ? ten : "";
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export default function AdminInquiriesTab({
  inquiries,
  loading,
  onRefresh,
}: {
  inquiries: AdminInquiry[];
  loading: boolean;
  onRefresh?: () => void;
}) {
  const [filter, setFilter] = useState<Filter>("needs");
  const [search, setSearch] = useState("");
  // Changes the admin just made, shown at once; the next refresh makes them permanent.
  const [patches, setPatches] = useState<Record<string, Partial<AdminInquiry>>>({});

  const [active, setActive] = useState<AdminInquiry | null>(null);
  const [note, setNote] = useState("");
  const [spoke, setSpoke] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // A patch only bridges the gap until the refreshed row says the same thing.
  const list = useMemo(
    () => inquiries.map((i) => (patches[i.id] && !i.isVerifiedByAdmin ? { ...i, ...patches[i.id] } : i)),
    [inquiries, patches],
  );

  const counts = useMemo(() => {
    const c = { needs: 0, forwarded: 0, all: list.length };
    for (const i of list) {
      const s = leadState(i);
      if (s === "needs") c.needs += 1;
      if (s === "forwarded") c.forwarded += 1;
    }
    return c;
  }, [list]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return list.filter((inq) => {
      const s = leadState(inq);
      if (filter === "needs" && s !== "needs") return false;
      if (filter === "forwarded" && s !== "forwarded") return false;
      if (!term) return true;
      return [inq.name, inq.phone, inq.buyerEmail, inq.carTitle, inq.dealerBusinessName]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));
    });
  }, [list, filter, search]);

  function open(inq: AdminInquiry) {
    setActive(inq);
    setNote("");
    setSpoke(false);
    setError("");
  }

  async function submit() {
    if (!active || !spoke) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/inquiries/${active.id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isVerified: true, adminNotes: note.trim(), spokeToBuyer: true }),
      });
      const data = (await res.json().catch(() => ({}))) as { forwarded?: boolean; message?: string; error?: string };
      if (!res.ok) {
        setError(data.error || data.message || "Could not save. Try again.");
        return;
      }
      setPatches((prev) => ({
        ...prev,
        [active.id]: {
          isVerifiedByAdmin: true,
          adminHold: data.forwarded ? false : active.adminHold,
          adminNotes: note.trim(),
          verifiedAt: new Date().toISOString(),
        },
      }));
      setActive(null);
      onRefresh?.();
    } catch {
      setError("Network problem. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const FILTERS: { key: Filter; label: string; n: number }[] = [
    { key: "needs", label: "Needs a call", n: counts.needs },
    { key: "forwarded", label: "Forwarded", n: counts.forwarded },
    { key: "all", label: "All", n: counts.all },
  ];

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div role="group" aria-label="Filter leads" className="-mx-4 flex gap-2 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:px-0">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={`h-11 shrink-0 cursor-pointer whitespace-nowrap rounded-full px-4 text-sm font-semibold tabular-nums ${
                filter === f.key ? "bg-ink-strong text-surface" : "border border-border text-ink hover:bg-surface-alt"
              }`}
            >
              {f.label} {f.n}
            </button>
          ))}
        </div>
        <div className="relative md:w-72">
          <label htmlFor="lead-search" className="sr-only">
            Search leads
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
          <input
            id="lead-search"
            type="search"
            placeholder="Name, phone, car or dealer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
      </div>

      {loading ? (
        <p role="status" className="py-10 text-sm text-ink-muted">
          Loading leads…
        </p>
      ) : visible.length === 0 ? (
        <p className="py-10 text-base text-ink-muted">
          {filter === "needs" && !search ? "No lead is waiting for a call." : "No leads match."}
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {visible.map((inq) => {
            const state = leadState(inq);
            const ten = indianMobile(inq.phone);
            return (
              <li key={inq.id} className="py-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-base font-bold text-ink-strong">{inq.name}</span>
                  {inq.leadSource && inq.leadSource !== "car_detail" && (
                    <span className="rounded-md border border-border px-1.5 py-0.5 text-xs font-semibold text-ink-muted">
                      {inq.leadSource.replace(/_/g, " ")}
                    </span>
                  )}
                  <span className="text-sm text-ink-muted tabular-nums">{formatWhen(inq.createdAt)}</span>
                </div>

                <p className="mt-1 text-sm text-ink">
                  {inq.carId ? (
                    <Link
                      href={`/cars/${inq.carId}`}
                      target="_blank"
                      className="font-semibold text-primary-600 underline underline-offset-2"
                    >
                      {inq.carTitle || "View the car"}
                    </Link>
                  ) : (
                    <span>About the showroom</span>
                  )}
                  <span className="text-ink-muted"> · Dealer: {inq.dealerBusinessName || "not set"}</span>
                </p>

                {inq.message && <p className="mt-1 text-sm text-ink-muted">&ldquo;{inq.message}&rdquo;</p>}

                <p className="mt-2 text-sm font-semibold text-ink">
                  {STATE_LABEL[state]}
                  {state === "needs" && inq.adminHold && (
                    <span className="font-normal text-ink-muted"> · the dealer cannot see it yet</span>
                  )}
                </p>
                {inq.isVerifiedByAdmin && inq.adminNotes && (
                  <p className="mt-1 text-sm text-ink-muted">Your note: {inq.adminNotes}</p>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  {ten === "" && <p className="w-full text-sm text-ink">Phone: {inq.phone || "not given"}</p>}
                  {ten !== "" && (
                    <>
                      <a href={`tel:+91${ten}`} className="btn btn-outline btn-md">
                        <Phone className="h-4 w-4" aria-hidden />
                        Call {ten}
                      </a>
                      <a
                        href={`https://wa.me/91${ten}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-md"
                      >
                        <MessageCircle className="h-4 w-4" aria-hidden />
                        WhatsApp
                      </a>
                    </>
                  )}
                  {state === "needs" || state === "sample" ? (
                    <button type="button" onClick={() => open(inq)} className="btn btn-primary btn-md cursor-pointer">
                      Verify and forward
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {!loading && list.length >= 100 && (
        <p className="mt-3 text-sm text-ink-muted">
          Every lead that needs a call is listed. Of the handled ones, the latest 100 are shown.
        </p>
      )}

      <AdminSheet
        open={Boolean(active)}
        onClose={() => setActive(null)}
        title="Verify and forward"
        description={
          active?.dealerIsSample
            ? "This dealer is a sample. The lead is marked verified but is not sent to anyone."
            : active?.adminHold
              ? "The dealer sees this lead and your note, and gets an alert."
              : "The dealer already has this lead. Verifying adds your note and the verified mark."
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="verify-note" className="label">
              Note for the dealer (optional)
            </label>
            <textarea
              id="verify-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What the buyer told you, in your words"
              className="input resize-none"
            />
          </div>

          <label className="flex min-h-11 items-start gap-3 text-sm text-ink">
            <input
              type="checkbox"
              checked={spoke}
              onChange={(e) => setSpoke(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-primary-600"
            />
            <span>I spoke to the buyer on the phone and they want this car.</span>
          </label>

          {error && (
            <p role="alert" className="error-text">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => setActive(null)} className="btn btn-outline btn-md flex-1">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void submit()}
              disabled={!spoke || saving}
              className="btn btn-primary btn-md flex-1 cursor-pointer disabled:opacity-60"
            >
              {saving ? "Saving…" : "Verify and forward"}
            </button>
          </div>
        </div>
      </AdminSheet>
    </div>
  );
}
