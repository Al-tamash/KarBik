"use client";

import React, { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import AuthShell, { FormError, footerLink } from "./AuthShell";

/**
 * Ask for a reset link. The server answers the same way whether or not the email has an
 * account, so the form cannot be used to find out who is registered. Any error that does
 * come back is a real fault (or a network drop) and is shown as one.
 */
export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const { error: err } = await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
      if (err) {
        setError("We could not send the email just now. Please try again in a minute.");
      } else {
        setSent(true);
      }
    } catch {
      setError("We could not reach KarBik. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const back = (
    <Link href="/login" className={footerLink}>
      Back to sign in
    </Link>
  );

  if (sent) {
    return (
      <AuthShell title="Check your email" footer={back} focusTitle>
        <p role="status" className="text-base text-ink">
          If there is an account for <span className="font-semibold text-ink-strong">{email}</span>, we have sent a link
          to choose a new password. It works for one hour.
        </p>
        <p className="mt-3 text-sm text-ink-muted">Nothing there? Look in spam, or check the spelling and try again.</p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-2 inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-primary-600 hover:underline"
        >
          Use a different email
        </button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot your password?"
      lead="Enter the email you signed up with. We will send you a link to choose a new one."
      footer={back}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="forgot-email" className="label">
            Email
          </label>
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            required
          />
        </div>
        <FormError message={error} />
        <button
          type="submit"
          aria-disabled={loading}
          className="btn btn-cta btn-lg btn-full cursor-pointer aria-disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </AuthShell>
  );
}
