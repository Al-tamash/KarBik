"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "buyer" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: err } = await authClient.signUp.email({
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
    });

    setLoading(false);

    if (err) {
      setError(err.message || err.statusText);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <h2 className="text-center text-2xl font-bold tracking-tight text-foreground mb-8">
          Auto<span className="text-primary">Bazaar</span>
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-border bg-white p-8 shadow-sm"
        >
          <h1 className="text-xl font-bold text-foreground text-center">Create Account</h1>
          <p className="text-sm text-muted text-center -mt-2">
            Join AutoBazaar as a buyer or dealer
          </p>

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-center">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              {/* Buyer option */}
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "buyer" })}
                className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all cursor-pointer ${
                  form.role === "buyer"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-white text-muted hover:border-slate-300"
                }`}
              >
                🛒 Buyer
              </button>
              {/* Dealer option */}
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "dealer" })}
                className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all cursor-pointer ${
                  form.role === "dealer"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-white text-muted hover:border-slate-300"
                }`}
              >
                🏪 Dealer
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 active:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-muted">
            Already have an account?{" "}
            <a href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
