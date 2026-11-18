"use client";

/**
 * The one dialog the admin screens use: a bottom sheet on phones, a centred panel from md.
 * Esc closes, Tab stays inside, the page behind does not scroll, focus lands in the sheet
 * and returns to the button that opened it. Same behaviour as the buyer lead sheet.
 */

import React, { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

export default function AdminSheet({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();

  // Callers pass a fresh onClose on every render. Keeping it in a ref means the effect below runs
  // only when the sheet opens or closes; otherwise every keystroke in a field would re-run it
  // and move focus back to the first field.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeRef.current();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const focusable = [
        ...panel.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), a[href], select:not([disabled]), textarea:not([disabled])',
        ),
      ];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;
      if (!panel.current.contains(current)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && current === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    // First field, not the close button, so the admin can type straight away.
    const firstField = panel.current?.querySelector<HTMLElement>("textarea, input, select");
    (firstField ?? panel.current?.querySelector<HTMLElement>("button"))?.focus();
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      // Back to the button that opened it. If that button is gone (a verified lead leaves the
      // list), land on the current tab panel instead of dropping focus to the page body.
      if (opener && document.contains(opener)) opener.focus();
      else document.querySelector<HTMLElement>("[role=tabpanel]")?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-graphite/60 md:items-center md:px-4"
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-surface shadow-xl md:max-w-md md:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-5">
          <div>
            <h2 id={titleId} className="font-display text-xl font-bold tracking-tight text-ink-strong">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-1 text-sm text-ink-muted">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-surface-alt"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">{children}</div>
      </div>
    </div>
  );
}
