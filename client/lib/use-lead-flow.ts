"use client";

/**
 * The buyer's lead flow, shared by every page that can ask KarBik about a car
 * (the car detail page and the compare page).
 *
 * One place owns: the sign-in + phone gate, the POST to /api/inquiries, the
 * WhatsApp hand-off, and what each car's button should say afterwards. A page
 * only decides WHEN to call `request(car, action)`; the sheet and the result
 * text come from here, so both pages behave the same.
 *
 * Rules kept from the original detail-page code:
 *  - The lead is stored FIRST; WhatsApp opens only with a server-issued link, so
 *    the dealer's number never reaches the browser.
 *  - The blank tab is opened synchronously inside the click so popup blockers allow it.
 *  - No OTP: the gate is account sign-in or sign-up plus a 10-digit mobile number.
 */

import { useCallback, useEffect, useState } from "react";
import { authClient, useAppSession } from "@/lib/auth-client";
import { normalizeIndianMobile } from "@/lib/car-format";
import type { AuthForm } from "@/components/car-detail/LeadSheet";
import type { InquiryUi } from "@/components/car-detail/ContactActions";

export type LeadAction = "whatsapp" | "callback";
/**
 * What a lead is about: the name the buyer knows it by, and either a car (`id` is the car
 * id) or a whole showroom (`kind: "dealer"`, `id` is the storefront slug).
 */
export type LeadTarget = { id: string; label: string; kind?: "car" | "dealer" };

/** The part of the POST body that says what the lead is about. */
function targetFields(target: LeadTarget) {
  return target.kind === "dealer" ? { dealerSlug: target.id } : { car: target.id };
}

type Notice = { carId: string; status: "success" | "error"; message: string };

const EMPTY_FORM: AuthForm = { name: "", phone: "", email: "", password: "" };

export function useLeadFlow({ leadSource }: { leadSource?: string } = {}) {
  const { data: session } = useAppSession();
  const isLoggedIn = !!session?.user;
  const sessionPhone = (session?.user as { phone?: string } | undefined)?.phone || "";

  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState<ReadonlySet<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const [open, setOpen] = useState(false);
  const [authTab, setAuthTab] = useState("signup");
  const [form, setForm] = useState<AuthForm>(EMPTY_FORM);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [pending, setPending] = useState<{ target: LeadTarget; action: LeadAction } | null>(null);

  /* A signed-in buyer's saved number pre-fills the gate. */
  useEffect(() => {
    if (!session?.user) return;
    if (sessionPhone) {
      setPhone(sessionPhone);
      setForm((p) => ({ ...p, phone: sessionPhone }));
    }
  }, [session, sessionPhone]);

  const markSent = useCallback((carId: string) => {
    setSent((prev) => new Set(prev).add(carId));
  }, []);

  /* ─── The two lead requests ───────────────────────────────────────────── */

  async function submitCallback(target: LeadTarget, buyerPhone: string, buyerName: string, message?: string) {
    setBusyId(target.id);
    setNotice(null);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...targetFields(target),
          channel: "callback",
          ...(leadSource ? { leadSource } : {}),
          name: buyerName || "Buyer",
          phone: buyerPhone,
          message:
            message ||
            (target.kind === "dealer"
              ? `Interested in cars at ${target.label}. Please connect me.`
              : `Interested in ${target.label}. Please connect for a test drive.`),
        }),
        credentials: "include",
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(d.message || "Failed to submit inquiry.");
      }
      markSent(target.id);
      setNotice({
        carId: target.id,
        status: "success",
        message: "Request received. KarBik support will call you shortly to confirm, then connect you with the dealer.",
      });
    } catch (err) {
      setNotice({ carId: target.id, status: "error", message: (err as Error).message });
    } finally {
      setBusyId(null);
    }
  }

  async function submitWhatsApp(target: LeadTarget, buyerPhone: string, buyerName: string) {
    // Open a blank tab synchronously (inside the click) so popup blockers allow it.
    const waTab = window.open("", "_blank");
    setBusyId(target.id);
    setNotice(null);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...targetFields(target),
          channel: "whatsapp",
          ...(leadSource ? { leadSource } : {}),
          name: buyerName || "Buyer",
          phone: buyerPhone,
          message: "Requested details via WhatsApp",
        }),
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string; whatsappUrl?: string | null };
      if (!res.ok) throw new Error(data.message || "Failed to submit inquiry.");

      markSent(target.id);
      if (data.whatsappUrl) {
        setNotice({
          carId: target.id,
          status: "success",
          message: "Request received. Continue the chat with KarBik support on WhatsApp.",
        });
        if (waTab) {
          waTab.location.href = data.whatsappUrl;
        } else {
          // Popup blocked (e.g. the tab opened after the sign-up round trip). The lead is
          // stored, so hand the buyer to WhatsApp in this tab instead.
          window.location.assign(data.whatsappUrl);
        }
      } else {
        waTab?.close();
        setNotice({ carId: target.id, status: "success", message: "Request received. KarBik support will contact you shortly." });
      }
    } catch (err) {
      waTab?.close();
      setNotice({ carId: target.id, status: "error", message: (err as Error).message });
    } finally {
      setBusyId(null);
    }
  }

  /* ─── Entry point: a page calls this from a button ────────────────────── */

  async function request(target: LeadTarget, action: LeadAction) {
    const buyerName = session?.user?.name || "Buyer";
    const knownPhone = phone || sessionPhone;

    if (!isLoggedIn || !knownPhone) {
      setPending({ target, action });
      setAuthError("");
      setOpen(true);
      return;
    }
    if (action === "whatsapp") {
      await submitWhatsApp(target, knownPhone, buyerName);
    } else {
      await submitCallback(target, knownPhone, buyerName, target.kind === "dealer" ? undefined : "Callback requested");
    }
  }

  async function finishPending(buyerPhone: string, buyerName: string) {
    if (!pending) return;
    const { target, action } = pending;
    setPending(null);
    if (action === "whatsapp") await submitWhatsApp(target, buyerPhone, buyerName);
    else await submitCallback(target, buyerPhone, buyerName);
  }

  async function onSubmit(e?: React.FormEvent<HTMLFormElement>) {
    if (e) e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      // Already signed in: only confirm the number, then finish the pending action.
      if (isLoggedIn) {
        const normalized = normalizeIndianMobile(form.phone);
        if (!normalized) {
          setAuthError("Enter a valid 10-digit Indian mobile number.");
          return;
        }
        setPhone(normalized);
        setOpen(false);
        await finishPending(normalized, session?.user?.name || "Buyer");
        return;
      }

      if (authTab === "signup") {
        const normalized = normalizeIndianMobile(form.phone);
        if (!normalized) {
          setAuthError("Enter a valid 10-digit Indian mobile number.");
          return;
        }
        const { error } = await authClient.signUp.email({
          email: form.email,
          password: form.password,
          name: form.name,
          phone: normalized,
        } as Parameters<typeof authClient.signUp.email>[0] & { phone?: string });
        if (error) throw new Error(error.message || "Sign up failed.");
        setPhone(normalized);
        setOpen(false);
        await finishPending(normalized, form.name || "Buyer");
        setForm(EMPTY_FORM);
        return;
      }

      const { data, error } = await authClient.signIn.email({ email: form.email, password: form.password });
      if (error) throw new Error(error.message || "Sign in failed.");
      // The sign-in tab has no phone field. Use the number saved on the account; if there is
      // none, keep the request pending and let the sheet ask for it (it switches to "Confirm
      // your mobile number" as soon as the session arrives) instead of posting a blank one.
      const saved = normalizeIndianMobile((data?.user as { phone?: string } | undefined)?.phone);
      if (saved) {
        setPhone(saved);
        setOpen(false);
        await finishPending(saved, (data?.user as { name?: string } | undefined)?.name || "Buyer");
        setForm(EMPTY_FORM);
      } else {
        setForm((p) => ({ ...p, phone: "", password: "" }));
      }
    } catch (err) {
      setAuthError((err as Error).message || "Authentication failed.");
    } finally {
      setAuthLoading(false);
    }
  }

  const close = useCallback(() => setOpen(false), []);

  /** What one car's buttons should show. */
  const uiFor = useCallback(
    (carId: string): InquiryUi => ({
      status: notice?.carId === carId ? notice.status : "",
      message: notice?.carId === carId ? notice.message : "",
      sent: sent.has(carId),
      sending: busyId === carId,
    }),
    [notice, sent, busyId],
  );

  /* Spread onto <LeadSheet />. */
  const sheetProps = {
    open,
    onClose: close,
    isLoggedIn,
    authTab,
    setAuthTab,
    form,
    setForm,
    error: authError,
    loading: authLoading,
    pendingAction: pending?.action === "whatsapp" ? "whatsapp" : "inquiry",
    subject: pending?.target.label,
    onSubmit,
  };

  return { isLoggedIn, busy: busyId !== null, uiFor, request, sheetProps };
}
