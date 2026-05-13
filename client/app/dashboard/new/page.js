"use client";

/**
 * New Listing Page — Dealer-only form to create a car listing
 *
 * Includes fields for title, brand, year, price, description, and image upload.
 * Submits as FormData (multipart) because of the file attachments.
 * Redirects to dashboard on success.
 */
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function NewListingPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [form, setForm] = useState({
    title: "", brand: "", year: "", price: "", description: "",
  });
  const [files, setFiles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect non-dealers away
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    } else if (!isPending && session?.user?.role !== "dealer") {
      router.push("/dashboard");
    }
  }, [isPending, session, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Build FormData for multipart upload
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("brand", form.brand);
    formData.append("year", form.year);
    formData.append("price", form.price);
    formData.append("description", form.description);

    if (files) {
      for (const file of files) {
        formData.append("images", file);
      }
    }

    try {
      const res = await fetch(`${API}/api/cars`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create listing");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError("Network error — is the server running?");
      setLoading(false);
    }
  }

  if (isPending || !session || session.user.role !== "dealer") {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-slate-50">
        <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-57px)] bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">

        {/* Back link */}
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm font-medium text-muted hover:text-foreground transition-colors mb-6 cursor-pointer"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-2xl font-bold text-foreground mb-6">Create New Listing</h1>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-white p-6 shadow-sm space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Title *</label>
              <input
                type="text" required value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="2023 Honda Civic EX"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Brand *</label>
              <input
                type="text" required value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Honda"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Year *</label>
              <input
                type="number" required value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="2023"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Price (₹) *</label>
              <input
                type="number" required value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="2500000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              rows={3}
              placeholder="Low mileage, excellent condition, single owner..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Images (select multiple)</label>
            <input
              type="file" accept="image/*" multiple
              onChange={(e) => setFiles(e.target.files)}
              className="w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground file:cursor-pointer"
            />
            <p className="text-xs text-muted mt-1">Max 5MB per image. Up to 10 images.</p>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-opacity"
          >
            {loading ? "Creating listing..." : "Create Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}
