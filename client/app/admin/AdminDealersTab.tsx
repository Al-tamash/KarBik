"use client";

/**
 * Dealers for KarBik admin: verify or revoke, open the KYC document, create or reset a login,
 * and give or end a plan by hand while online payments are switched off. A plan needs a note
 * (what was paid, how, the reference): the audit log keeps it, and the server refuses the
 * action when the log cannot be written (migration 0005).
 */

import React, { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import AdminSheet from "@/components/admin/AdminSheet";

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
  planName?: string | null;
  planEndsAt?: string | null;
}

interface AdminDealersTabProps {
  dealers: AdminDealer[];
  loading: boolean;
  onToggleVerify: (dealerId: string, currentVerified: boolean) => Promise<void>;
  onChanged: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

type Panel = { kind: "plan" | "login"; dealer: AdminDealer } | null;

export default function AdminDealersTab({ dealers, loading, onToggleVerify, onChanged }: AdminDealersTabProps) {
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel>(null);

  // Plan sheet
  const [plan, setPlan] = useState("starter");
  const [days, setDays] = useState("30");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  // Login sheet: the temporary password is shown once.
  const [access, setAccess] = useState<{ email: string; password: string; created: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  const term = search.trim().toLowerCase();
  const visible = dealers.filter(
    (d) =>
      !term ||
      d.businessName.toLowerCase().includes(term) ||
      d.city.toLowerCase().includes(term) ||
      (d.ownerEmail ?? "").toLowerCase().includes(term),
  );

  function openPanel(kind: "plan" | "login", dealer: AdminDealer) {
    setPanel({ kind, dealer });
    setPlan("starter");
    setDays("30");
    setNote("");
    setError("");
    setDone("");
    setAccess(null);
    setCopied(false);
  }

  function close() {
    setPanel(null);
    setAccess(null);
  }

  async function toggleVerify(d: AdminDealer) {
    setUpdatingId(d.id);
    try {
      await onToggleVerify(d.id, d.isVerified);
    } finally {
      setUpdatingId(null);
    }
  }

  async function submitPlan(action: "grant" | "end") {
    if (!panel) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/dealers/${panel.dealer.id}/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(action === "grant" ? { action, plan, days: Number(days), note } : { action, note }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
      if (!res.ok) {
        setError(data.error || data.message || "Could not save. Try again.");
        return;
      }
      setDone(data.message || "Saved.");
      onChanged();
    } catch {
      setError("Network problem. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function submitLogin() {
    if (!panel) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/dealers/${panel.dealer.id}/access`, { method: "POST", credentials: "include" });
      const data = (await res.json().catch(() => ({}))) as {
        email?: string;
        temporaryPassword?: string;
        created?: boolean;
        error?: string;
      };
      if (!res.ok || !data.temporaryPassword) {
        setError(data.error || "Could not create the login.");
        return;
      }
      setAccess({ email: data.email ?? "", password: data.temporaryPassword, created: Boolean(data.created) });
    } catch {
      setError("Network problem. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const dealer = panel?.dealer;

  return (
    <div>
      <div className="relative md:w-80">
        <label htmlFor="dealer-search" className="sr-only">
          Search dealers
        </label>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
        <input
          id="dealer-search"
          type="search"
          placeholder="Name, city or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      {loading ? (
        <p role="status" className="py-10 text-sm text-ink-muted">
          Loading dealers…
        </p>
      ) : visible.length === 0 ? (
        <p className="py-10 text-base text-ink-muted">No dealers match.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {visible.map((d) => {
            const status = d.isVerified ? "Verified" : d.verificationDoc ? "KYC document waiting for review" : "No KYC document yet";
            return (
              <li key={d.id} className="py-4">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-base font-bold text-ink-strong">{d.businessName || "Unnamed dealer"}</span>
                  <span className="text-sm text-ink-muted">{d.city || "Hyderabad"}</span>
                </div>
                <p className="mt-1 text-sm text-ink-muted">
                  {d.ownerEmail || d.ownerName || "No email"}
                  {d.phone ? ` · ${d.phone}` : ""}
                </p>
                <p className="mt-1 text-sm text-ink tabular-nums">
                  <span className="font-semibold">{status}</span> · {d.carsCount} {d.carsCount === 1 ? "car" : "cars"} ·{" "}
                  {d.planName && d.planEndsAt ? `${d.planName} until ${formatDate(d.planEndsAt)}` : "Free plan"}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void toggleVerify(d)}
                    disabled={updatingId === d.id}
                    className={`btn btn-md cursor-pointer disabled:opacity-60 ${d.isVerified ? "btn-outline" : "btn-primary"}`}
                  >
                    {updatingId === d.id ? "Saving…" : d.isVerified ? "Remove verification" : "Verify dealer"}
                  </button>
                  {d.verificationDoc?.url && (
                    <a href={d.verificationDoc.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-md">
                      KYC document
                    </a>
                  )}
                  <button type="button" onClick={() => openPanel("plan", d)} className="btn btn-outline btn-md cursor-pointer">
                    Plan
                  </button>
                  <button type="button" onClick={() => openPanel("login", d)} className="btn btn-outline btn-md cursor-pointer">
                    Dealer login
                  </button>
                  {d.slug && (
                    <Link href={`/dealer/${d.slug}`} target="_blank" className="btn btn-outline btn-md">
                      Storefront
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Plan: give or end by hand */}
      <AdminSheet
        open={panel?.kind === "plan"}
        onClose={close}
        title={`Plan for ${dealer?.businessName || "this dealer"}`}
        description={
          dealer?.planName && dealer.planEndsAt
            ? `Now on ${dealer.planName} until ${formatDate(dealer.planEndsAt)}. Online payments are off, so this does not charge anything.`
            : "Now on the Free plan. Online payments are off, so this does not charge anything."
        }
      >
        {done ? (
          <div className="space-y-4">
            <p role="status" className="text-base text-ink">
              {done}
            </p>
            <button type="button" onClick={close} className="btn btn-outline btn-md btn-full">
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="grant-plan" className="label">
                  Plan
                </label>
                <select id="grant-plan" value={plan} onChange={(e) => setPlan(e.target.value)} className="input">
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                </select>
              </div>
              <div>
                <label htmlFor="grant-days" className="label">
                  Days
                </label>
                <input
                  id="grant-days"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={366}
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="input"
                />
              </div>
            </div>
            {dealer?.planName && dealer.planEndsAt && (
              <p className="text-sm text-ink-muted">
                {dealer.planName.toLowerCase() === plan
                  ? `Adds ${days || "?"} days after the current end date (${formatDate(dealer.planEndsAt)}).`
                  : `Replaces ${dealer.planName} (until ${formatDate(dealer.planEndsAt)}). The days start today.`}
              </p>
            )}
            <div>
              <label htmlFor="grant-note" className="label">
                Note (required)
              </label>
              <textarea
                id="grant-note"
                rows={3}
                maxLength={500}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What was paid, how, and the reference. For example: UPI 999 received, ref 4821."
                className="input resize-none"
              />
              <p className="helper-text">This is the only record of the payment. It is saved in the audit log.</p>
            </div>

            {error && (
              <p role="alert" className="error-text">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={() => void submitPlan("grant")}
              disabled={busy || note.trim().length < 5}
              className="btn btn-primary btn-md btn-full cursor-pointer disabled:opacity-60"
            >
              {busy ? "Saving…" : "Give plan"}
            </button>
            {dealer?.planName && (
              <button
                type="button"
                onClick={() => void submitPlan("end")}
                disabled={busy || note.trim().length < 5}
                className="btn btn-outline btn-md btn-full cursor-pointer disabled:opacity-60"
              >
                End current plan (back to Free)
              </button>
            )}
          </div>
        )}
      </AdminSheet>

      {/* Login: confirm, then show the temporary password once */}
      <AdminSheet
        open={panel?.kind === "login"}
        onClose={close}
        title={access ? (access.created ? "Login created" : "Login reset") : "Create or reset login"}
        description={
          access
            ? "This password is shown only once. Send it to the dealer privately and ask them to change it in Settings, Password."
            : `For ${dealer?.businessName || "this dealer"}. Any current password stops working and they are signed out everywhere.`
        }
      >
        {access ? (
          <div className="space-y-4">
            <dl className="space-y-3 text-base">
              <div>
                <dt className="text-sm text-ink-muted">Email (login)</dt>
                <dd className="break-all font-mono text-ink-strong">{access.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-ink-muted">Temporary password</dt>
                <dd className="break-all font-mono text-ink-strong">{access.password}</dd>
              </div>
            </dl>
            <div className="flex gap-3">
              <button
                type="button"
                className="btn btn-primary btn-md flex-1 cursor-pointer"
                onClick={async () => {
                  await navigator.clipboard.writeText(`Email: ${access.email}\nPassword: ${access.password}`);
                  setCopied(true);
                }}
              >
                {copied ? "Copied" : "Copy both"}
              </button>
              <button type="button" className="btn btn-outline btn-md flex-1" onClick={close}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <p role="alert" className="error-text">
                {error}
              </p>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={close} className="btn btn-outline btn-md flex-1">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void submitLogin()}
                disabled={busy}
                className="btn btn-primary btn-md flex-1 cursor-pointer disabled:opacity-60"
              >
                {busy ? "Working…" : "Create or reset"}
              </button>
            </div>
          </div>
        )}
      </AdminSheet>
    </div>
  );
}
