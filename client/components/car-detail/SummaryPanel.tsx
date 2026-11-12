"use client";

/**
 * The summary, rendered once. On phones it is plain content under the photo (the
 * sticky bottom bar carries the actions). From lg it becomes the sticky right-hand
 * panel with the two ways to reach KarBik support. One element, so the page has
 * one h1 and the content is not duplicated in the DOM.
 */

import React from "react";
import Link from "next/link";
import type { ApiCar, BuyerDealerSummary } from "@/lib/api-types";
import CarSummary from "./CarSummary";
import { CallbackButton, InquiryNotice, SentConfirmation, WhatsAppButton, type InquiryUi } from "./ContactActions";

export default function SummaryPanel({
  car,
  dealer,
  ui,
  onWhatsApp,
  onCallback,
}: {
  car: ApiCar;
  dealer: BuyerDealerSummary | null;
  ui: InquiryUi;
  onWhatsApp: () => void;
  onCallback: () => void;
}) {
  return (
    <div className="lg:rounded-2xl lg:border lg:border-border lg:bg-surface lg:p-6 lg:shadow-card">
      <CarSummary car={car} dealer={dealer} />

      {dealer?.isSample && (
        <p className="mt-4 text-xs leading-relaxed text-ink-muted">
          This is a sample listing shown for demonstration. Message KarBik support and we will help you find similar
          real cars.
        </p>
      )}

      {/* Desktop only: phones use the sticky bottom bar */}
      <div className="hidden lg:block">
        <div className="mt-5 space-y-3">
          {ui.sent ? (
            <SentConfirmation />
          ) : (
            <>
              <InquiryNotice ui={ui} />
              <WhatsAppButton onClick={onWhatsApp} sending={ui.sending} className="btn-full" />
              <CallbackButton onClick={onCallback} sending={ui.sending} className="btn-full" />
            </>
          )}
        </div>

        <p className="mt-4 text-xs leading-relaxed text-ink-muted">
          By contacting, you allow KarBik and the dealer to call or WhatsApp you on your number.{" "}
          <Link href="/privacy" className="font-semibold text-primary-600 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
