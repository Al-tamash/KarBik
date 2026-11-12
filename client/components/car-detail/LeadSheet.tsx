"use client";

/**
 * The lead gate: sign in (or create an account) and confirm a mobile number
 * before KarBik support is contacted. A bottom sheet on phones, a centred panel
 * from md. Same fields and rules as before; only the surface changed.
 */

import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

import AuthFields, { type AuthValues } from "@/components/auth/AuthFields";

export type AuthForm = AuthValues;

export default function LeadSheet({
  open,
  onClose,
  isLoggedIn,
  authTab,
  setAuthTab,
  form,
  setForm,
  error,
  loading,
  pendingAction,
  subject,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  authTab: string;
  setAuthTab: (tab: string) => void;
  form: AuthForm;
  setForm: React.Dispatch<React.SetStateAction<AuthForm>>;
  error: string;
  loading: boolean;
  pendingAction: string;
  /** What the buyer is asking about, e.g. "Maruti Baleno". Defaults to "this car". */
  subject?: string;
  onSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
}) {
  const reduce = useReducedMotion();
  const panel = useRef<HTMLDivElement>(null);

  /* Esc closes; Tab stays inside the sheet; the page behind does not scroll; focus lands
     in the sheet on open and returns to the button that opened it on close. */
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
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
    panel.current?.querySelector<HTMLElement>("input")?.focus();
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [open, onClose]);

  /* After signing in with no saved number the sheet turns into "Confirm your mobile number";
     the field that had focus is gone, so focus the new one. */
  useEffect(() => {
    if (open && isLoggedIn) panel.current?.querySelector<HTMLElement>("#lead-phone")?.focus();
  }, [open, isLoggedIn]);

  const goal = pendingAction === "whatsapp" ? "open WhatsApp" : "request the call back";
  const submitLabel = loading
    ? "Please wait…"
    : isLoggedIn
      ? `Confirm and ${goal}`
      : authTab === "signup"
        ? "Create account and continue"
        : "Sign in and continue";

  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-graphite/60 md:items-center md:px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.18 }}
          onClick={onClose}
        >
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-sheet-title"
            aria-describedby="lead-sheet-desc"
            className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-surface shadow-xl md:max-w-md md:rounded-2xl"
            initial={reduce ? { opacity: 0 } : { y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 48, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.28, ease }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 px-5 pt-5">
              <div>
                <h2 id="lead-sheet-title" className="font-display text-xl font-bold tracking-tight text-ink-strong">
                  {isLoggedIn ? "Confirm your mobile number" : authTab === "signup" ? "Create your account" : "Sign in"}
                </h2>
                <p id="lead-sheet-desc" className="mt-1 text-sm text-ink-muted">
                  {isLoggedIn
                    ? `KarBik support will use this number to reach you about ${subject ?? "this car"}.`
                    : `One account lets KarBik support reach you about ${subject ?? "this car"}. It also keeps spam out.`}
                </p>
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

            {!isLoggedIn && (
              <div className="mt-4 flex gap-1 px-5" role="tablist" aria-label="Account">
                {(["signup", "signin"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={authTab === tab}
                    onClick={() => setAuthTab(tab)}
                    className={`h-11 rounded-full px-4 text-sm font-semibold ${
                      authTab === tab ? "bg-ink-strong text-surface" : "text-ink-muted hover:bg-surface-alt"
                    }`}
                  >
                    {tab === "signup" ? "Create account" : "Sign in"}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
              {isLoggedIn ? (
                <div>
                  <label htmlFor="lead-phone" className="label">
                    10-digit mobile number
                  </label>
                  <input
                    id="lead-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="9876543210"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                    className="input"
                    required
                  />
                  <p className="mt-1.5 text-xs text-ink-muted">Saved to your profile so next time it is one tap.</p>
                </div>
              ) : (
                <AuthFields
                  mode={authTab === "signup" ? "signup" : "signin"}
                  idPrefix="lead"
                  forgotHref="/forgot-password"
                  values={form}
                  onChange={(patch) => setForm((p) => ({ ...p, ...patch }))}
                />
              )}

              {error && (
                <p role="alert" className="error-text">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className="btn btn-cta btn-lg btn-full cursor-pointer disabled:opacity-60">
                {submitLabel}
              </button>

              <p className="text-center text-xs text-ink-muted">
                By continuing you allow KarBik support to contact you on this number.
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
