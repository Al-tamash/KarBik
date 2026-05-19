"use client";

import Link from "next/link";
import { Mail, User, Calendar, MessageSquare, ArrowRight, Car, ImageOff } from "lucide-react";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export default function BuyerDashboard({ session, inquiries }) {
  const memberSince = new Date(session.user.createdAt).toLocaleDateString("en-IN", {
    year: "numeric", month: "short", day: "numeric",
  });

  return (
    <div className="space-y-6">

      {/* ─── Account summary ─── */}
      <div className="card p-6">
        <h2 className="text-base font-bold text-neutral-900 mb-4">Account</h2>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-neutral-50 p-4 border border-neutral-200">
            <dt className="text-xs text-neutral-400 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email
            </dt>
            <dd className="text-sm font-semibold text-neutral-800 truncate">{session.user.email}</dd>
          </div>
          <div className="rounded-xl bg-neutral-50 p-4 border border-neutral-200">
            <dt className="text-xs text-neutral-400 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Role
            </dt>
            <dd className="text-sm font-semibold text-neutral-800 capitalize">{session.user.role || "buyer"}</dd>
          </div>
          <div className="rounded-xl bg-neutral-50 p-4 border border-neutral-200">
            <dt className="text-xs text-neutral-400 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Member since
            </dt>
            <dd className="text-sm font-semibold text-neutral-800">{memberSince}</dd>
          </div>
          <div className="rounded-xl bg-neutral-50 p-4 border border-neutral-200">
            <dt className="text-xs text-neutral-400 mb-1 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Sent inquiries
            </dt>
            <dd className="text-sm font-semibold text-neutral-800">{inquiries.length}</dd>
          </div>
        </dl>
      </div>

      {/* ─── Sent inquiries ─── */}
      {inquiries.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h2 className="text-sm font-bold text-neutral-900">Your inquiries</h2>
          </div>
          <div className="divide-y divide-neutral-100">
            {inquiries.map((inq) => (
              <div key={inq._id} className="p-5 hover:bg-neutral-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  {inq.car ? (
                    <Link
                      href={`/cars/${inq.car._id}`}
                      className="text-sm font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1.5"
                    >
                      <Car className="w-4 h-4" /> {inq.car.title}
                    </Link>
                  ) : (
                    <span className="text-sm text-neutral-400 italic">Listing removed</span>
                  )}
                  <span className="text-xs text-neutral-400">{timeAgo(inq.createdAt)}</span>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <p className="text-sm text-neutral-700 leading-relaxed">{inq.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── CTA ─── */}
      <div className="card p-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_100%_100px,#EEF0FF,transparent)] pointer-events-none" />
        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4">
            <Car className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 mb-2">Find your next car</h3>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto mb-6">
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
