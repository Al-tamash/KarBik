"use client";

/**
 * WHAT: Redesigned Login page with split-layout.
 * WHY: The previous login was a bare white card on a blank background.
 *      Competitors (Spinny, Cars24) use split-layout auth pages because
 *      they convert better — the left panel builds trust while the right
 *      panel handles the action. This design:
 *      - Shows value props (trust badges) on the left panel
 *      - Shows the form on the right panel
 *      - Uses the KarBik brand palette throughout
 *      - Collapses gracefully to single-column on mobile
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient, useAppSession } from "@/lib/auth-client";
import { Car, ShieldCheck, Award, Star } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Already signed in? Don't leave the visitor staring at the form.
  const { data: existingSession, isPending: sessionPending } = useAppSession();
  useEffect(() => {
    if (sessionPending || !existingSession) return;
    router.replace(existingSession.user?.role === "admin" ? "/admin" : "/dashboard");
  }, [sessionPending, existingSession, router]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: err } = await authClient.signIn.email({
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (err) {
      setError(err.message || err.statusText);
      return;
    }

    // Role-based routing: Send Super Admin directly to /admin portal
    const role = (data?.user as { role?: string } | undefined)?.role;
    if (role === "admin" || form.email.toLowerCase().includes("admin@")) {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex bg-bg">

      {/* ─── Left Panel: Brand + Trust (hidden on mobile) ─── */}
      <div className="hidden lg:flex lg:w-5/12 bg-primary-600 relative overflow-hidden flex-col justify-between p-10 xl:p-14">
        {/* Top: Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5 text-2xl font-extrabold text-white tracking-tight">
            <Car className="h-7 w-7" />
            KarBik
          </Link>
        </div>

        {/* Middle: Value proposition */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight">
            Welcome back to<br />
            Hyderabad&apos;s Car Marketplace
          </h2>
          <p className="text-sm text-white leading-relaxed max-w-sm">
            Access your dashboard, manage listings, track inquiries, and grow your showroom — all from one place.
          </p>

          {/* Trust indicators — every claim maps to a real platform feature */}
          <div className="space-y-3 pt-4">
            {[
              { icon: ShieldCheck, text: "Dealer verification with document checks" },
              { icon: Award, text: "Inspection reports you can download" },
              { icon: Star, text: "Real buyer reviews on every showroom" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-white">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Tagline */}
        <p className="relative z-10 text-xs text-white font-medium">
          Buy and sell used cars across Hyderabad with local dealers.
        </p>
      </div>

      {/* ─── Right Panel: Login Form ─── */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo — visible only when left panel is hidden */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-2xl font-extrabold text-ink-strong tracking-tight">
              <Car className="h-6 w-6 text-primary-600" />
              <span>Kar<span className="text-primary-600">Bik</span></span>
            </Link>
          </div>

          {/* Form card */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-ink-strong tracking-tight">
                Sign in to your account
              </h1>
              <p className="text-sm text-ink-muted mt-1">
                Welcome back — enter your credentials to continue.
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="text-sm text-danger-700 bg-danger-50 border border-danger-100 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="login-email" className="block text-sm font-semibold text-ink mb-1.5">
                  Email
                </label>
                <input id="login-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink-strong placeholder:text-ink-subtle focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-semibold text-ink mb-1.5">
                  Password
                </label>
                <input id="login-password"
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink-strong placeholder:text-ink-subtle focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
                  placeholder="Your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary-600 py-3 text-sm font-bold text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Register link */}
            <p className="text-center text-sm text-ink-muted pt-2">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-bold text-primary-600 hover:text-primary-700 hover:underline">
                Register for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
