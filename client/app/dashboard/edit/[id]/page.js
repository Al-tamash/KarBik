"use client";

/**
 * Edit Listing Page — Pre-fills the form with existing car data
 *
 * Fetches the car by ID, populates the form, and submits changes
 * via PUT /api/cars/:id. Optionally replaces images if new ones are selected.
 */
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function EditListingPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [form, setForm] = useState({
    title: "", brand: "", year: "", price: "", description: "",
  });
  const [existingImages, setExistingImages] = useState([]);
  const [files, setFiles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // Auth guard
  useEffect(() => {
    if (!isPending && !session) router.push("/login");
    else if (!isPending && session?.user?.role !== "dealer") router.push("/dashboard");
  }, [isPending, session, router]);

  // Fetch car data to pre-fill the form
  useEffect(() => {
    async function fetchCar() {
      try {
        const res = await fetch(`${API}/api/cars/${id}`);
        if (!res.ok) {
          setError("Car not found");
          setFetching(false);
          return;
        }
        const car = await res.json();
        setForm({
          title: car.title,
          brand: car.brand,
          year: String(car.year),
          price: String(car.price),
          description: car.description || "",
        });
        setExistingImages(car.images || []);
      } catch (err) {
        setError("Failed to load car data");
      }
      setFetching(false);
    }
    if (id) fetchCar();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("brand", form.brand);
    formData.append("year", form.year);
    formData.append("price", form.price);
    formData.append("description", form.description);

    // Only append images if user selected new ones (otherwise keep existing)
    if (files && files.length > 0) {
      for (const file of files) {
        formData.append("images", file);
      }
    }

    try {
      const res = await fetch(`${API}/api/cars/${id}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to update listing");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError("Network error — is the server running?");
      setLoading(false);
    }
  }

  if (isPending || fetching || !session) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
          <p className="text-sm font-medium text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-57px)] bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">

        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm font-medium text-muted hover:text-foreground transition-colors mb-6 cursor-pointer"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-2xl font-bold text-foreground mb-6">Edit Listing</h1>

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
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Brand *</label>
              <input
                type="text" required value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Year *</label>
              <input
                type="number" required value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Price (₹) *</label>
              <input
                type="number" required value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
            />
          </div>

          {/* Current images preview */}
          {existingImages.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Current Images</label>
              <div className="flex gap-2 flex-wrap">
                {existingImages.map((img, i) => (
                  <img
                    key={i}
                    src={img.url}
                    alt={`Image ${i + 1}`}
                    className="h-20 w-28 rounded-lg object-cover border border-border"
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Replace Images <span className="text-muted font-normal">(optional — select new to replace all)</span>
            </label>
            <input
              type="file" accept="image/*" multiple
              onChange={(e) => setFiles(e.target.files)}
              className="w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground file:cursor-pointer"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-opacity"
          >
            {loading ? "Updating listing..." : "Update Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}
