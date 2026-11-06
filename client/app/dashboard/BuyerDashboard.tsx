"use client";
import type { ApiInquiry } from "@/lib/api-types";

import Link from "next/link";
import { Mail, User, Calendar, MessageSquare, ArrowRight, Car, ImageOff, ShieldAlert } from "lucide-react";

function timeAgo(dateStr: string | Date | null | undefined) {
  const diff = Date.now() - new Date(dateStr ?? Date.now()).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr ?? Date.now()).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export default function BuyerDashboard({ session, inquiries }: { session: { user?: { name?: string; email?: string; role?: string; createdAt?: string } | null }; inquiries: ApiInquiry[] }) {
  const memberSince = session.user?.createdAt
    ? new Date(session.user.createdAt).toLocaleDateString("en-IN", {
        year: "numeric", month: "short", day: "numeric",
      })
    : "—";

  const isAdmin = session?.user?.role === "admin";

  return (
    <div className="space-y-6">
      {/* ─── Admin Quick Jump Banner ─── */}
      {isAdmin && (
        <div className="p-4 sm:p-5 rounded-2xl bg-primary-50 border border-primary-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-primary-950">Super Administrator Access Detected</h3>
              <p className="text-xs text-primary-700 mt-0.5">
                Manage dealerships, verify legal papers, and oversee marketplace cars from the Admin Control Center.
              </p>
            </div>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-bold hover:bg-primary-700 transition-colors shrink-0 shadow-xs"
          >
            Open Admin Portal <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* ─── Account summary ─── */}
      <div className="card p-6">
        <h2 className="text-base font-bold text-ink-strong mb-4">Account</h2>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-surface-alt p-4 border border-border">
            <dt className="text-xs text-ink-subtle mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email
            </dt>
            <dd className="text-sm font-semibold text-ink truncate">{session?.user?.email}</dd>
          </div>
          <div className="rounded-xl bg-surface-alt p-4 border border-border">
            <dt className="text-xs text-ink-subtle mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Role
            </dt>
            <dd className="text-sm font-semibold text-ink capitalize">{session?.user?.role || "buyer"}</dd>
          </div>
          <div className="rounded-xl bg-surface-alt p-4 border border-border">
            <dt className="text-xs text-ink-subtle mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Member since
            </dt>
            <dd className="text-sm font-semibold text-ink">{memberSince}</dd>
          </div>
          <div className="rounded-xl bg-surface-alt p-4 border border-border">
            <dt className="text-xs text-ink-subtle mb-1 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Sent inquiries
            </dt>
            <dd className="text-sm font-semibold text-ink">{inquiries.length}</dd>
          </div>
        </dl>
      </div>

      {/* ─── Sent inquiries ─── */}
      {inquiries.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-sm font-bold text-ink-strong">Your inquiries</h2>
          </div>
          <div className="divide-y divide-border">
            {inquiries.map((inq: ApiInquiry) => (
              <div key={inq.id} className="p-5 hover:bg-surface-alt transition-colors">
                <div className="flex items-start justify-between mb-2">
                  {inq.car ? (
                    <Link
                      href={`/cars/${inq.car.id}`}
                      className="text-sm font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1.5"
                    >
                      <Car className="w-4 h-4" /> {inq.car.title}
                    </Link>
                  ) : (
                    <span className="text-sm text-ink-subtle italic">Listing removed</span>
                  )}
                  <span className="text-xs text-ink-subtle">{timeAgo(inq.createdAt)}</span>
                </div>
                <div className="p-3 bg-surface-alt rounded-xl border border-border">
                  <p className="text-sm text-ink leading-relaxed">{inq.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── CTA ─── */}
      <div className="card p-10 text-center relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4">
            <Car className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-ink-strong mb-2">Find your next car</h3>
          <p className="text-sm text-ink-muted max-w-sm mx-auto mb-6">
            Browse verified listings from trusted dealers across India.
          </p>
          <Link href="/cars" className="btn-lg btn-primary inline-flex items-center gap-2 shadow-sm">
            Browse cars
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
