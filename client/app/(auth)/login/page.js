"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

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
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <h2 className="text-center text-2xl font-bold tracking-tight text-neutral-900 mb-8">
          Auto<span className="text-primary">Bazaar</span>
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm"
        >
          <h1 className="text-xl font-bold text-neutral-900 text-center">Sign In</h1>
          <p className="text-sm text-neutral-500 text-center -mt-2">
            Welcome back — enter your credentials
          </p>

          {/* Error message — only shows when there's an error */}
          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-center">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder-muted-neutral-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder-muted-neutral-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-neutral-900 hover:opacity-90 active:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-sm text-neutral-500">
            Don&apos;t have an account?{" "}
            <a href="/register" className="font-semibold text-primary hover:underline">
              Register
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
