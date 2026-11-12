"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient, useAppSession } from "@/lib/auth-client";
import { homeFor, withNext } from "@/lib/auth-redirect";
import AuthFields, { EMPTY_AUTH, type AuthValues } from "./AuthFields";
import AuthShell, { FormError, footerLink } from "./AuthShell";

const OFFLINE = "We could not reach KarBik. Check your connection and try again.";

/** `next` arrives already checked by the server page (safeNext). */
export default function LoginForm({ next }: { next: string | null }) {
  const router = useRouter();
  const [values, setValues] = useState<AuthValues>(EMPTY_AUTH);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already signed in? Don't leave the visitor staring at the form.
  const { data: existing, isPending } = useAppSession();
  useEffect(() => {
    if (isPending || !existing) return;
    router.replace(next ?? homeFor(existing.user?.role));
  }, [isPending, existing, router, next]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const { data, error: err } = await authClient.signIn.email({ email: values.email, password: values.password });
      if (err) {
        setError(err.message || err.statusText || "We could not sign you in. Check your email and password.");
        setLoading(false);
        return;
      }
      const role = (data?.user as { role?: string } | undefined)?.role;
      // Stay in the loading state: the page is about to change.
      router.push(next ?? homeFor(role));
    } catch {
      setError(OFFLINE);
      setLoading(false);
    }
  }

  // A signed-in visitor is being sent on; do not flash the form.
  if (existing) return null;

  return (
    <AuthShell
      title="Sign in"
      lead="Welcome back. Your saved cars and requests are on your account."
      footer={
        <>
          New to KarBik?{" "}
          <Link href={withNext("/register", next)} className={footerLink}>
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthFields
          mode="signin"
          idPrefix="login"
          values={values}
          onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
          forgotHref="/forgot-password"
        />
        <FormError message={error} />
        <button
          type="submit"
          aria-disabled={loading}
          className="btn btn-cta btn-lg btn-full cursor-pointer aria-disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
