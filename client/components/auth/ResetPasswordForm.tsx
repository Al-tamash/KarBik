"use client";

import React, { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { PasswordField } from "./AuthFields";
import AuthShell, { FormError } from "./AuthShell";

/**
 * The page the emailed link opens. `token` and `linkFailed` (?token=… or ?error=…) arrive
 * already read by the server page.
 */
export default function ResetPasswordForm({ token, linkFailed }: { token: string; linkFailed: boolean }) {
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const { error: err } = await authClient.resetPassword({ newPassword: password, token });
      if (err) {
        // Better Auth words a dead link "Invalid token"; anything else is shown as it is.
        setError(
          /token/i.test(err.message ?? "")
            ? "This link has expired or was already used. Ask for a new one from Forgot password."
            : err.message || "We could not change your password. Please try again.",
        );
      } else {
        setDone(true);
      }
    } catch {
      setError("We could not reach KarBik. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (linkFailed || !token) {
    return (
      <AuthShell title="This link has expired" lead="Reset links work once and only for an hour." focusTitle>
        <Link href="/forgot-password" className="btn btn-cta btn-lg btn-full">
          Send a new link
        </Link>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell title="Password changed" lead="You can now sign in with your new password." focusTitle>
        <Link href="/login" className="btn btn-cta btn-lg btn-full">
          Sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password" lead="Use at least 8 characters.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <PasswordField
          id="reset-password"
          label="New password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          minLength={8}
        />
        <FormError message={error} />
        <button
          type="submit"
          aria-disabled={loading}
          className="btn btn-cta btn-lg btn-full cursor-pointer aria-disabled:opacity-60"
        >
          {loading ? "Saving…" : "Change password"}
        </button>
      </form>
    </AuthShell>
  );
}
