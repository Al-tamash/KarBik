"use client";

/**
 * WHAT: Redesigned Login page with split-layout.
 * WHY: The previous login was a bare white card on a blank background.
 *      Competitors (Spinny, Cars24) use split-layout auth pages because
 *      they convert better — the left panel builds trust while the right
 *      panel handles the action. This design:
 *      - Shows value props (trust badges) on the left panel
 *      - Shows the form on the right panel
 *      - Uses the AutoBazaar brand palette throughout
 *      - Collapses gracefully to single-column on mobile
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Car, ShieldCheck, Award, Star } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: err } = await authClient.signIn.email({
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (err) {
      setError(err.message || err.statusText);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex bg-neutral-50">

      {/* ─── Left Panel: Brand + Trust (hidden on mobile) ─── */}
      <div className="hidden lg:flex lg:w-5/12 bg-primary-600 relative overflow-hidden flex-col justify-between p-10 xl:p-14">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/30 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-primary-700/40 blur-3xl rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none" />

        {/* Top: Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5 text-2xl font-extrabold text-white tracking-tight">
            <Car className="h-7 w-7" />
            AutoBazaar
          </Link>
        </div>

        {/* Middle: Value proposition */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight">
            Welcome back to<br />
            Hyderabad&apos;s #1 Car Marketplace
          </h2>
          <p className="text-sm text-primary-100 leading-relaxed max-w-sm">
            Access your dashboard, manage listings, track inquiries, and grow your showroom — all from one place.
          </p>

          {/* Trust indicators */}
          <div className="space-y-3 pt-4">
            {[
              { icon: ShieldCheck, text: "100% verified dealer network" },
              { icon: Award, text: "200-point car inspection reports" },
              { icon: Star, text: "4.7★ average dealer rating" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-primary-100">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Tagline */}
        <p className="relative z-10 text-xs text-primary-200 font-medium">
          Trusted by 200+ dealers across Kukatpally, Secunderabad, and Gachibowli.
        </p>
      </div>

      {/* ─── Right Panel: Login Form ─── */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo — visible only when left panel is hidden */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-2xl font-extrabold text-neutral-900 tracking-tight">
              <Car className="h-6 w-6 text-primary-600" />
              Auto<span className="text-primary-600">Bazaar</span>
            </Link>
          </div>

          {/* Form card */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
                Sign in to your account
              </h1>
              <p className="text-sm text-neutral-500 mt-1">
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
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
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
            <p className="text-center text-sm text-neutral-500 pt-2">
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
