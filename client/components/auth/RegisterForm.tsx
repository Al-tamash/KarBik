"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient, useAppSession } from "@/lib/auth-client";
import { normalizeIndianMobile } from "@/lib/car-format";
import { homeFor, withNext } from "@/lib/auth-redirect";
import AuthFields, { EMPTY_AUTH, type AuthValues } from "./AuthFields";
import AuthShell, { FormError, footerLink } from "./AuthShell";

type Role = "buyer" | "dealer";

const OFFLINE = "We could not reach KarBik. Check your connection and try again.";

/* One honest line per role, each a statement of how KarBik really works (PRODUCT.md). */
const LEAD: Record<Role, string> = {
  buyer: "Free for buyers. KarBik support talks to you first, then connects you with the dealer.",
  dealer: "List your cars. KarBik support checks each buyer lead before it reaches you.",
};

/** `next` and `role` arrive already read from the URL by the server page. */
export default function RegisterForm({ next, initialRole }: { next: string | null; initialRole: Role }) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(initialRole);
  const [values, setValues] = useState<AuthValues>(EMPTY_AUTH);
  const [error, setError] = useState("");
  const [phoneInvalid, setPhoneInvalid] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: existing, isPending } = useAppSession();
  useEffect(() => {
    if (isPending || !existing) return;
    router.replace(next ?? homeFor(existing.user?.role));
  }, [isPending, existing, router, next]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setPhoneInvalid(false);
    const phone = normalizeIndianMobile(values.phone);
    if (!phone) {
      setError("Enter a valid 10-digit Indian mobile number.");
      setPhoneInvalid(true);
      document.getElementById("reg-phone")?.focus();
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        phone,
        // `role` is read by the server's user-create hook (only buyer or dealer are accepted);
        // the client type does not declare it.
        role,
      } as Parameters<typeof authClient.signUp.email>[0]);
      if (err) {
        setError(err.message || err.statusText || "We could not create your account. Please try again.");
        setLoading(false);
        return;
      }
      // Stay in the loading state: the page is about to change.
      router.push(next ?? homeFor(undefined));
    } catch {
      setError(OFFLINE);
      setLoading(false);
    }
  }

  if (existing) return null;

  return (
    <AuthShell
      title="Create your account"
      lead={LEAD[role]}
      footer={
        <>
          Already have an account?{" "}
          <Link href={withNext("/login", next)} className={footerLink}>
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <p id="role-label" className="label">
            I am a
          </p>
          <div role="group" aria-labelledby="role-label" className="flex gap-1">
            {(["buyer", "dealer"] as const).map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={role === r}
                onClick={() => setRole(r)}
                className={`h-11 cursor-pointer rounded-full px-5 text-sm font-semibold ${
                  role === r
                    ? "bg-ink-strong text-surface"
                    : "border border-border-strong text-ink hover:bg-surface-alt"
                }`}
              >
                {r === "buyer" ? "Buyer" : "Dealer"}
              </button>
            ))}
          </div>
        </div>

        <AuthFields
          mode="signup"
          idPrefix="reg"
          values={values}
          onChange={(patch) => {
            if (patch.phone !== undefined) setPhoneInvalid(false);
            setValues((v) => ({ ...v, ...patch }));
          }}
          phoneInvalid={phoneInvalid}
        />
        <FormError message={error} />
        <button
          type="submit"
          aria-disabled={loading}
          className="btn btn-cta btn-lg btn-full cursor-pointer aria-disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
        <p className="text-center text-xs text-ink-muted">
          By creating an account you agree to the{" "}
          <Link href="/terms" className="font-semibold text-primary-600 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-semibold text-primary-600 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  );
}
