"use client";

/**
 * Edit Listing Page — Pre-fills the form with existing car data
 *
 * Fetches the car by ID, populates the form, and submits changes
 * via PUT /api/cars/:id. Optionally replaces images if new ones are selected.
 */
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAppSession } from "@/lib/auth-client";
import { Sparkles, AlertTriangle, ShieldCheck } from "lucide-react";
// Optimized next/image and custom cloudinaryLoader for dashboard media previews
import Image from "next/image";
import cloudinaryLoader from "@/lib/cloudinary-loader";
import { compressImage, compressImages } from "@/lib/image-compress";
import { updateCarSchema } from "@autobazaar/shared";
import type { CloudFile } from "@autobazaar/shared";
import type { VehicleDetails } from "@/lib/vahan";

type SuggestedPriceRange = { min: number; max: number; reason?: string };

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session, isPending } = useAppSession();
  const [form, setForm] = useState({
    title: "", brand: "", year: "", price: "", description: "",
    registrationNumber: "", rcVerified: false,
  });
  const [existingImages, setExistingImages] = useState<CloudFile[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [inspectionDoc, setInspectionDoc] = useState<File | null>(null);
  const [isInspected, setIsInspected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [aiLoading, setAiLoading] = useState({ description: false, price: false });
  const [suggestedPriceRange, setSuggestedPriceRange] = useState<SuggestedPriceRange | null>(null);

  // RTO Verification States to track search status and hold retrieved details
  const [rtoData, setRtoData] = useState<VehicleDetails | null>(null);
  const [rtoLoading, setRtoLoading] = useState(false);
  const [rtoError, setRtoError] = useState("");

  // Auth guard
  useEffect(() => {
    if (!isPending && !session) router.push("/login");
    else if (!isPending && session?.user?.role !== "dealer") router.push("/dashboard");
  }, [isPending, session, router]);

  async function generateAIDescription() {
    if (!form.brand || !form.year) {
      alert("Please enter at least the Brand and Year to generate a description.");
      return;
    }
    setAiLoading(prev => ({ ...prev, description: true }));
    try {
      const res = await fetch(`/api/ai/description`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          brand: form.brand,
          model: form.title,
          year: form.year,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({ ...prev, description: data.description }));
      } else {
        const data = await res.json();
        alert(data.message || "Failed to generate description");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while reaching AI service.");
    }
    setAiLoading(prev => ({ ...prev, description: false }));
  }

  async function suggestAIPrice() {
    if (!form.brand || !form.year) {
      alert("Please enter at least the Brand and Year to get a price suggestion.");
      return;
    }
    setAiLoading(prev => ({ ...prev, price: true }));
    setSuggestedPriceRange(null);
    try {
      const res = await fetch(`/api/ai/price-estimate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          brand: form.brand,
          model: form.title,
          year: form.year,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSuggestedPriceRange(data);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to suggest price");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while reaching AI service.");
    }
    setAiLoading(prev => ({ ...prev, price: false }));
  }

  // Verifies the vehicle registration number with our Live Vahan/RTO API
  async function verifyRtoDetails() {
    if (!form.registrationNumber) {
      alert("Please enter a registration number first.");
      return;
    }
    setRtoLoading(true);
    setRtoError("");
    setRtoData(null);

    try {
      // Normalize registration number by stripping spaces and hyphens
      const cleanReg = form.registrationNumber.replace(/[\s-]/g, "").toUpperCase();
      const res = await fetch(`/api/cars/verify-vehicle/${cleanReg}`, {
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setRtoData(data);
      } else {
        setRtoError(data.message || "Failed to verify vehicle. Please check plate format.");
      }
    } catch (err) {
      console.error(err);
      setRtoError("Network error checking vehicle registration.");
    } finally {
      setRtoLoading(false);
    }
  }

  // Auto-fills form fields using data fetched from Vahan/RTO database
  function autoFillFromRto() {
    if (!rtoData) return;

    // Populate form state fields symmetrically with our custom templates
    setForm(prev => ({
      ...prev,
      brand: rtoData.brand,
      title: `${rtoData.year} ${rtoData.brand} ${rtoData.model}${rtoData.variant ? ' ' + rtoData.variant : ''}`,
      year: rtoData.year.toString(),
      registrationNumber: rtoData.registrationNumber,
      rcVerified: true, // Auto-sets RC verified to true since it came from RTO
    }));
  }

  // Fetch car data to pre-fill the form
  useEffect(() => {
    async function fetchCar() {
      try {
        const res = await fetch(`/api/cars/${id}`);
        if (!res.ok) {
          setError("Car not found");
          setFetching(false);
          return;
        }
        const car = (await res.json()) as {
          title: string; brand: string; year: number; price: number;
          description?: string; registrationNumber?: string; rcVerified?: boolean;
          images?: CloudFile[]; isInspected?: boolean;
        };
        setForm({
          title: car.title,
          brand: car.brand,
          year: String(car.year),
          price: String(car.price),
          description: car.description || "",
          registrationNumber: car.registrationNumber || "",
          rcVerified: car.rcVerified || false,
        });
        setExistingImages(car.images || []);
        setIsInspected(car.isInspected || false);
      } catch (err) {
        setError("Failed to load car data");
      }
      setFetching(false);
    }
    if (id) fetchCar();
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    // Validate the editing form inputs with Zod updateCarSchema (partial)
    const result = updateCarSchema.safeParse(form);
    if (!result.success) {
      const firstError = result.error.issues[0];
      const fieldName = String(firstError.path[0] ?? "Field");
      // Format to capital case for fields
      const formattedField = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
      setError(`${formattedField}: ${firstError.message}`);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("brand", form.brand);
    formData.append("year", form.year);
    formData.append("price", form.price);
    formData.append("description", form.description);
    formData.append("registrationNumber", form.registrationNumber);
    formData.append("rcVerified", form.rcVerified ? "true" : "false");

    // Only append images if user selected new ones (otherwise keep existing)
    // Compress in the browser: Vercel rejects request bodies over ~4.5 MB.
    if (files && files.length > 0) {
      for (const file of await compressImages(Array.from(files))) {
        formData.append("images", file);
      }
    }

    if (inspectionDoc) {
      formData.append("inspectionReport", await compressImage(inspectionDoc));
    }

    try {
      const res = await fetch(`/api/cars/${id}`, {
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
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-surface-alt">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-primary-600 animate-pulse" />
          <p className="text-sm font-medium text-ink-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-57px)] bg-surface-alt">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">

        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm font-medium text-ink-muted hover:text-ink-strong transition-colors mb-6 cursor-pointer"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-2xl font-bold text-ink-strong mb-6">Edit Listing</h1>

        {error && (
          <div className="mb-4 rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink-strong mb-1.5">Title *</label>
              <input
                type="text" required value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-ink-strong focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-strong mb-1.5">Brand *</label>
              <input
                type="text" required value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-ink-strong focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-strong mb-1.5">Year *</label>
              <input
                type="number" required value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-ink-strong focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-ink-strong">Price (₹) *</label>
                <button
                  type="button"
                  onClick={suggestAIPrice}
                  disabled={aiLoading.price}
                  className="text-xs font-bold text-primary-600 hover:text-primary-700 disabled:opacity-50 flex items-center gap-1"
                >
                  {aiLoading.price ? (
                    <>
                      <Sparkles className="h-3 w-3 animate-spin" /> Thinking...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" /> Suggest AI Price
                    </>
                  )}
                </button>
              </div>
              <input
                type="number" required value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-ink-strong focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
              {suggestedPriceRange && (
                <div className="mt-2 rounded-lg bg-success-50 p-3 border border-success-100">
                  <p className="text-sm font-bold text-success-800">
                    Suggested: ₹{suggestedPriceRange.min.toLocaleString("en-IN")} - ₹{suggestedPriceRange.max.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-success-600 mt-1">{suggestedPriceRange.reason}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-ink-strong">Description</label>
              <button
                type="button"
                onClick={generateAIDescription}
                disabled={aiLoading.description}
                className="text-xs font-bold text-primary-600 hover:text-primary-700 disabled:opacity-50 flex items-center gap-1"
              >
                {aiLoading.description ? (
                  <>
                    <Sparkles className="h-3 w-3 animate-spin" /> Writing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" /> AI Auto-Write
                  </>
                )}
              </button>
            </div>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-ink-strong focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              rows={4}
            />
          </div>

          {/* Current images preview */}
          {existingImages.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-ink-strong mb-1.5">Current Images</label>
              <div className="flex gap-2 flex-wrap">
                {existingImages.map((img, i) => (
                  // Wrapped in a relative box with defined width/height constraints so that the
                  // Next.js optimized Image can absolute-position it inside the boundaries.
                  <div key={i} className="relative h-20 w-28 rounded-lg overflow-hidden border border-border shadow-sm shrink-0">
                    <Image
                      loader={cloudinaryLoader}
                      src={img.url}
                      alt={`Image ${i + 1}`}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-ink-strong mb-1.5">
              Replace Images <span className="text-ink-muted font-normal">(optional — select new to replace all)</span>
            </label>
            <input
              type="file" accept="image/*" multiple
              onChange={(e) => setFiles(e.target.files)}
              className="w-full text-sm text-ink-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-700 file:cursor-pointer transition-all"
            />
          </div>

          <div className="pt-4 border-t border-border space-y-4">
            <h3 className="text-sm font-bold text-ink-strong mb-2">Trust System</h3>
            
            {/* RTO Vehicle History Verification Section */}
            <div>
              <label className="block text-sm font-semibold text-ink-strong mb-1.5">
                Registration Number <span className="text-xs text-ink-muted font-normal">(e.g., MH12DE5678 or DL3CAA1111)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. MH-12-DE-5678"
                  value={form.registrationNumber}
                  onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                  className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-ink-strong uppercase focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
                <button
                  type="button"
                  onClick={verifyRtoDetails}
                  disabled={rtoLoading || !form.registrationNumber}
                  className="rounded-lg border border-primary-600 bg-surface px-4 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-50/50 disabled:opacity-50 cursor-pointer transition-colors"
                >
                  {rtoLoading ? "Checking..." : "Verify RTO"}
                </button>
              </div>

              {/* RTO Verification error feedback */}
              {rtoError && (
                <p className="text-xs text-danger-600 mt-1.5 font-semibold flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> {rtoError}
                </p>
              )}

              {/* Verified Details Panel */}
              {rtoData && (
                <div className="mt-3 rounded-xl border border-success-200 bg-success-50/50 p-4 shadow-sm animate-fade-in text-ink-strong">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-success-100">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-success-100 px-2 py-0.5 text-xs font-bold text-success-800 uppercase tracking-wide">
                        <ShieldCheck className="h-3 w-3" aria-hidden />
                        RTO Verified
                      </span>
                      <span className="text-sm font-bold tracking-wide uppercase">
                        {rtoData.registrationNumber}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={autoFillFromRto}
                      className="rounded bg-success-700 px-2.5 py-1 text-xs font-bold text-white shadow hover:bg-success-700 cursor-pointer transition-all duration-200 flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3 text-white animate-pulse" /> Auto-Fill Form
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div>
                      <span className="block text-xs text-success-700 uppercase font-semibold">Registered Owner</span>
                      <span className="font-bold">{rtoData.ownerName}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-success-700 uppercase font-semibold">Make & Model</span>
                      <span className="font-bold">{rtoData.brand} {rtoData.model} {rtoData.variant}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-success-700 uppercase font-semibold">Year</span>
                      <span className="font-bold">{rtoData.year}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-success-700 uppercase font-semibold">Fuel / Transmission</span>
                      <span className="font-bold capitalize">{rtoData.fuelType} / {rtoData.transmission}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-success-700 uppercase font-semibold">RC Status</span>
                      <span className="font-bold">{rtoData.rcStatus}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-success-700 uppercase font-semibold">Insurance Till</span>
                      <span className="font-bold">{rtoData.insuranceValid}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Checkbox for RC status */}
            <div className="flex items-start gap-3 py-1">
              <input
                type="checkbox"
                id="rcVerified"
                checked={form.rcVerified}
                onChange={(e) => setForm({ ...form, rcVerified: e.target.checked })}
                className="mt-0.5 w-4 h-4 accent-primary-600 cursor-pointer"
              />
              <label htmlFor="rcVerified" className="text-sm font-semibold text-ink cursor-pointer">
                RC transfer is ready (the &quot;RTO Verified&quot; badge is added by KarBik after review)
              </label>
            </div>

            {/* Existing Inspection fields */}
            <div className="flex items-center gap-4 py-1">
              <label className="text-sm font-semibold text-ink-strong">Car Inspected?</label>
              <div className={`px-2 py-1 rounded text-xs font-bold ${isInspected ? "bg-success-100 text-success-700" : "bg-surface-alt text-ink-muted"}`}>
                {isInspected ? "Yes" : "No"}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-ink-strong mb-1.5">
                Upload Inspection Report <span className="text-ink-muted font-normal">(PDF/Image)</span>
              </label>
              <input
                type="file" accept="image/*,.pdf"
                onChange={(e) => setInspectionDoc(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-ink-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-700 file:cursor-pointer transition-all"
              />
              <p className="text-xs text-ink-muted mt-1.5">Your report is saved with the listing. The Inspected badge is added by KarBik after it reviews the report.</p>
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
          >
            {loading ? "Updating listing..." : "Update Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}
