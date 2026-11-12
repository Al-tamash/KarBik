"use client";

/**
 * Phone-only bottom bar: price, Call back, and the orange WhatsApp action, always
 * in thumb reach. It replaces the site's bottom nav on this page.
 */

import React from "react";
import type { ApiCar } from "@/lib/api-types";
import { formatPrice } from "@/lib/car-format";
import { calculateEmi } from "@/lib/emi";
import { CallbackButton, InquiryNotice, SentConfirmation, WhatsAppButton, type InquiryUi } from "./ContactActions";

export default function StickyCtaBar({
  car,
  ui,
  onWhatsApp,
  onCallback,
}: {
  car: ApiCar;
  ui: InquiryUi;
  onWhatsApp: () => void;
  onCallback: () => void;
}) {
  const emi = calculateEmi(car.price);
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg lg:hidden">
      {ui.sent ? (
        <SentConfirmation />
      ) : (
        <>
          {ui.message && (
            <div className="mb-2">
              <InquiryNotice ui={ui} />
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="min-w-0 shrink-0">
              <p className="text-lg font-extrabold leading-tight tracking-tight text-ink-strong tabular-nums">
                {formatPrice(car.price)}
              </p>
              {emi > 0 && (
                <p className="text-xs text-ink-muted tabular-nums">EMI ₹{emi.toLocaleString("en-IN")}/mo</p>
              )}
            </div>
            <CallbackButton onClick={onCallback} sending={ui.sending} iconOnly className="ml-auto shrink-0 !px-3" />
            <WhatsAppButton onClick={onWhatsApp} sending={ui.sending} className="min-w-0 flex-1 !px-3" />
          </div>
        </>
      )}
    </div>
  );
}
