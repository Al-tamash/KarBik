"use client";

/**
 * WHAT: Redesigned Register page with split-layout.
 * WHY: Same reasoning as login — the previous version was a bare centered card.
 *      Split-layout improves conversion by showing trust and value while the
 *      user fills in the form. The left panel is tailored for registration
 *      (highlights "Join 200+ dealers" and "Free buyer account").
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Car, ShoppingCart, Store, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "buyer" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: err } = await authClient.signUp.email({
      name: form.name,
      email: form.email,
      password: form.password,
      // `role` is consumed by the server's user-create hook; the client
      // type doesn't declare it, hence the explicit widening.
      role: form.role,
    } as Parameters<typeof authClient.signUp.email>[0]);

    setLoading(false);

    if (err) {
      setError(err.message || err.statusText);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex bg-bg">

      {/* ─── Left Panel: Brand + Value Props (hidden on mobile) ─── */}
      <div className="hidden lg:flex lg:w-5/12 bg-neutral-900 relative overflow-hidden flex-col justify-between p-10 xl:p-14">

        {/* Top: Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5 text-2xl font-extrabold text-white tracking-tight">
            <Car className="h-7 w-7 text-primary-400" />
            <span>Kar<span className="text-primary-400">Bik</span></span>
          </Link>
        </div>

        {/* Middle: Why join */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight">
            Join Hyderabad&apos;s Fastest Growing Car Network
          </h2>
          <p className="text-sm text-neutral-400 leading-relaxed max-w-sm">
            Whether you&apos;re buying your next car or growing your dealership, KarBik gives you the tools to succeed.
          </p>

          {/* Benefits */}
          <div className="space-y-3 pt-4">
            {[
              { icon: ShieldCheck, text: "Free buyer account — no credit card needed" },
              { icon: TrendingUp, text: "Digital tools for dealers — CRM, analytics, micro-website" },
              { icon: Sparkles, text: "AI-powered price suggestions and auto-descriptions" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-primary-400" />
                </div>
                <span className="text-sm font-medium text-neutral-300">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="relative z-10 text-xs text-neutral-400 font-medium">
          Free to join — start browsing cars or listing your inventory today.
        </p>
      </div>

      {/* ─── Right Panel: Register Form ─── */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-2xl font-extrabold text-ink-strong tracking-tight">
              <Car className="h-6 w-6 text-primary-600" />
              <span>Kar<span className="text-primary-600">Bik</span></span>
            </Link>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-ink-strong tracking-tight">
                Create your account
              </h1>
              <p className="text-sm text-ink-muted mt-1">
                Join KarBik as a buyer or dealer — it&apos;s free to get started.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-danger-700 bg-danger-50 border border-danger-100 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="reg-name" className="block text-sm font-semibold text-ink mb-1.5">Full Name</label>
                <input id="reg-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink-strong placeholder:text-ink-subtle focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-sm font-semibold text-ink mb-1.5">Email</label>
                <input id="reg-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink-strong placeholder:text-ink-subtle focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="reg-password" className="block text-sm font-semibold text-ink mb-1.5">Password</label>
                <input id="reg-password"
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink-strong placeholder:text-ink-subtle focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
                  placeholder="At least 8 characters"
                />
              </div>

              {/* Role selector */}
              <div>
                <p className="block text-sm font-semibold text-ink mb-2">I want to...</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, role: "buyer" })}
                    className={`rounded-xl border-2 px-4 py-3.5 text-sm font-semibold transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      form.role === "buyer"
                        ? "border-primary-600 bg-primary-50 text-primary-700 shadow-sm"
                        : "border-border bg-surface text-ink-muted hover:border-border-strong"
                    }`}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Buy a Car</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, role: "dealer" })}
                    className={`rounded-xl border-2 px-4 py-3.5 text-sm font-semibold transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      form.role === "dealer"
                        ? "border-primary-600 bg-primary-50 text-primary-700 shadow-sm"
                        : "border-border bg-surface text-ink-muted hover:border-border-strong"
                    }`}
                  >
                    <Store className="h-5 w-5" />
                    <span>Sell Cars</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary-600 py-3 text-sm font-bold text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="text-center text-sm text-ink-muted pt-2">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-primary-600 hover:text-primary-700 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
