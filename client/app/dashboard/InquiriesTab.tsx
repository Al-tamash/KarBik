"use client";

import Link from "next/link";
import { Phone, Car, MessageSquare, AlertTriangle } from "lucide-react";
import type { ApiInquiry } from "@/lib/api-types";

const CRM_STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "interested", label: "Interested" },
  { value: "test_drive", label: "Test Drive" },
  { value: "closed", label: "Closed" },
  { value: "lost", label: "Lost" },
  { value: "fake", label: "Fake Lead" },
];

const CRM_PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

function followUpLabel(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const followUpDate = new Date(dateStr);
  followUpDate.setHours(0, 0, 0, 0);

  if (followUpDate < today) return "Overdue";
  if (followUpDate.getTime() === today.getTime()) return "Follow up today";
  return `Follow up ${followUpDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`;
}

function leadQualityMeta(quality: string): { label: string; className: string } {
  if (quality === "high_intent") {
    return { label: "High Intent", className: "bg-success-50 text-success-700 border border-success-200" };
  }
  if (quality === "good") {
    return { label: "Good Lead", className: "bg-primary-50 text-primary-700 border border-primary-200" };
  }
  if (quality === "suspicious") {
    return { label: "Suspicious", className: "bg-danger-50 text-danger-700 border border-danger-200" };
  }
  return { label: "New Lead", className: "bg-surface-alt text-ink-muted border border-border" };
}

function timeAgo(dateStr: string | null | undefined): string {
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

function dateInputValue(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().slice(0, 10);
}

function normalizeWhatsAppPhone(phone: string): string {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

function getWhatsAppHref(inquiry: ApiInquiry): string | null {
  const phone = normalizeWhatsAppPhone(inquiry.phone);
  if (!/^91[6-9]\d{9}$/.test(phone)) return null;
  const carTitle = inquiry.car?.title || "your car inquiry";
  const message = `Hi ${inquiry.name}, thanks for your inquiry on KarBik about ${carTitle}. Is this car still of interest to you?`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export default function InquiriesTab({
  inquiries,
  loadingInquiries,
  onStatusChange,
  onPriorityChange,
  onNotesSave,
  onFollowUpChange,
  onWhatsAppClick,
  onMarkSpam,
}: {
  inquiries: ApiInquiry[];
  loadingInquiries: boolean;
  onStatusChange: (inquiryId: string, status: string) => void;
  onPriorityChange: (inquiryId: string, priority: string) => void;
  onNotesSave: (inquiryId: string, notes: string) => void;
  onFollowUpChange: (inquiryId: string, followUpAt: string | null) => void;
  onWhatsAppClick: (e: React.MouseEvent<HTMLAnchorElement>, inquiry: ApiInquiry) => void;
  onMarkSpam: (inquiryId: string) => void;
}) {
  if (loadingInquiries) {
    return (
      <div className="card py-16 flex flex-col items-center justify-center gap-3">
        <div className="h-6 w-6 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
        <p className="text-sm text-ink-subtle">Loading inquiries...</p>
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div className="card text-center py-16 px-6 max-w-sm mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-surface-alt flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-6 h-6 text-ink-subtle" />
        </div>
        <h3 className="text-base font-bold text-ink-strong mb-1">No inquiries yet</h3>
        <p className="text-sm text-ink-muted">Buyer leads will appear here as they come in.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {inquiries.map((inq: ApiInquiry) => {
        const followLabel = followUpLabel(inq.followUpAt);
        const qualityMeta = leadQualityMeta(inq.leadQuality);
        const waHref = getWhatsAppHref(inq);

        return (
          <div key={inq.id} className="card p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-ink-strong">{inq.name}</h3>
                  {inq.isVerifiedByAdmin && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-success-50 text-success-700 border border-success-200">
                      ✓ Concierge Verified
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${qualityMeta.className}`}>
                    {qualityMeta.label}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    (inq.priority || "medium") === "high"
                      ? "bg-danger-50 text-danger-700 border border-danger-200"
                      : (inq.priority || "medium") === "low"
                        ? "bg-surface-alt text-ink-muted border border-border"
                        : "bg-warning-50 text-warning-700 border border-warning-200"
                  }`}>
                    {inq.priority || "medium"}
                  </span>
                  {followLabel && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      followLabel === "Overdue"
                        ? "bg-danger-600 text-white"
                        : "bg-success-50 text-success-700 border border-success-200"
                    }`}>
                      {followLabel}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-ink-muted flex items-center gap-1">
                  <Phone className="w-3 h-3 text-ink-subtle" /> +{inq.phone}
                </p>
                {inq.lastContactedAt && (
                  <p className="mt-0.5 text-xs text-ink-subtle">Last contacted {timeAgo(inq.lastContactedAt)}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {waHref ? (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => onWhatsAppClick(e, inq)}
                    className="btn-sm inline-flex items-center gap-1 text-xs font-semibold py-2 bg-[#25D366] text-neutral-900 hover:bg-[#20BD5A] shadow-sm"
                  >
                    Contact via WhatsApp
                  </a>
                ) : (
                  <button className="btn-sm btn-outline opacity-50 cursor-not-allowed text-xs py-2" disabled>
                    No phone number
                  </button>
                )}
                {inq.status !== "fake" && (
                  <button
                    type="button"
                    onClick={() => onMarkSpam(inq.id)}
                    className="btn-sm btn-outline text-danger-600 border-danger-200 hover:bg-danger-50 text-xs py-2"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Mark spam
                  </button>
                )}
                <div className="flex flex-col items-end pl-2 shrink-0">
                  <span className="text-xs text-ink-subtle">{timeAgo(inq.createdAt)}</span>
                  <span className="text-xs text-ink-subtle">{inq.whatsappMessageCount || 0} WA clicks</span>
                </div>
              </div>
            </div>

            {inq.car && (
              <div className="mt-3">
                <Link
                  href={`/cars/${inq.car.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700"
                >
                  <Car className="w-3.5 h-3.5" />
                  {inq.car.title}
                  <span className="text-ink-subtle mx-0.5">/</span>
                  <span className="text-ink-muted">₹{inq.car.price?.toLocaleString("en-IN")}</span>
                </Link>
              </div>
            )}

            <div className="mt-3 p-3 bg-surface-alt rounded-xl border border-border">
              <p className="text-sm text-ink leading-relaxed">{inq.message}</p>
            </div>

            {inq.adminNotes && (
              <div className="mt-2.5 p-3 bg-primary-50/70 rounded-xl border border-primary-200/60 text-xs text-primary-950">
                <span className="font-bold block text-xs uppercase tracking-wider text-primary-700 mb-0.5">
                  🛡️ KarBik Concierge Verification Note:
                </span>
                <p className="leading-relaxed">{inq.adminNotes}</p>
              </div>
            )}

            {inq.leadSignals?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {inq.leadSignals.map((signal: string) => (
                  <span key={signal} className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-alt text-ink-muted border border-border">
                    {signal.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-border grid gap-4 grid-cols-1 sm:grid-cols-3">
              <label className="block">
                <span className="block text-xs font-medium text-ink-muted mb-1">Status</span>
                <select
                  value={inq.status || "new"}
                  onChange={(e) => onStatusChange(inq.id, e.target.value)}
                  className="select input-sm"
                >
                  {CRM_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="block text-xs font-medium text-ink-muted mb-1">Priority</span>
                <select
                  value={inq.priority || "medium"}
                  onChange={(e) => onPriorityChange(inq.id, e.target.value)}
                  className="select input-sm"
                >
                  {CRM_PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="block text-xs font-medium text-ink-muted mb-1">Follow-up</span>
                <input
                  type="date"
                  value={dateInputValue(inq.followUpAt)}
                  onChange={(e) => onFollowUpChange(inq.id, e.target.value)}
                  className="input input-sm text-ink"
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="block text-xs font-medium text-ink-muted mb-1">Notes</span>
              <textarea
                value={inq.notes || ""}
                onChange={(e) => {
                  const notes = e.target.value;
                  onNotesSave(inq.id, notes);
                }}
                rows={2}
                className="input input-sm resize-none text-sm leading-relaxed"
                placeholder="Add follow-up details..."
              />
            </label>
          </div>
        );
      })}
    </div>
  );
}
