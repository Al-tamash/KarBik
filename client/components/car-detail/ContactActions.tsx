"use client";

/**
 * The two ways to reach KarBik support about this car, shared by the desktop
 * panel and the phone's sticky bar. WhatsApp is the view's single orange action;
 * Call back is an outline. After a request is sent both give way to a
 * confirmation that names the next step. The support number is not repeated
 * here: the two buttons are the way to reach support.
 */

import React from "react";
import { CheckCircle2, MessageCircle, Phone, AlertTriangle } from "lucide-react";

export type InquiryUi = {
  status: string;
  message: string;
  sent: boolean;
  sending: boolean;
};

export function InquiryNotice({ ui }: { ui: InquiryUi }) {
  if (!ui.message) return null;
  const isError = ui.status === "error";
  return (
    <p
      role={isError ? "alert" : "status"}
      className={`flex items-start gap-2 text-sm ${isError ? "text-danger-700" : "text-ink"}`}
    >
      {isError ? (
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger-600" aria-hidden />
      ) : (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
      )}
      <span>{ui.message}</span>
    </p>
  );
}

export function SentConfirmation() {
  return (
    <div className="text-sm text-ink" role="status">
      <p className="font-semibold text-ink-strong">Request sent</p>
      <p className="mt-0.5 text-ink-muted">
        KarBik support will contact you shortly to confirm, then connect you with the dealer.
      </p>
    </div>
  );
}

export function WhatsAppButton({
  onClick,
  sending,
  className = "",
}: {
  onClick: () => void;
  sending: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={sending}
      className={`btn btn-cta btn-md cursor-pointer disabled:opacity-60 ${className}`}
    >
      <MessageCircle className="h-5 w-5" aria-hidden />
      {sending ? "Connecting…" : "Ask on WhatsApp"}
    </button>
  );
}

export function CallbackButton({
  onClick,
  sending,
  iconOnly = false,
  className = "",
}: {
  onClick: () => void;
  sending: boolean;
  iconOnly?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={sending}
      aria-label={iconOnly ? "Request a call back" : undefined}
      className={`btn btn-outline btn-md cursor-pointer disabled:opacity-60 ${className}`}
    >
      <Phone className="h-5 w-5" aria-hidden />
      {!iconOnly && "Request call back"}
    </button>
  );
}
