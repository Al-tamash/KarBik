"use client";

/**
 * New Listing Page — Dealer-only form to create a car listing
 *
 * Includes detailed fields matching CarDekho/Spinny level.
 */
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const API = process.env.NEXT_PUBLIC_API_URL;

const CAR_DATA = {
  "Maruti Suzuki": {
    "Swift": ["LXi", "VXi", "ZXi", "ZXi+"],
    "Baleno": ["Sigma", "Delta", "Zeta", "Alpha"],
    "Brezza": ["LXi", "VXi", "ZXi", "ZXi+"],
    "Wagon R": ["LXi", "VXi", "ZXi"],
    "Alto K10": ["Std", "LXi", "VXi", "VXi+"],
    "Dzire": ["LXi", "VXi", "ZXi", "ZXi+"],
    "Ertiga": ["LXi", "VXi", "ZXi", "ZXi+"],
    "Grand Vitara": ["Sigma", "Delta", "Zeta", "Alpha", "Alpha+"]
  },
  "Hyundai": {
    "Creta": ["E", "EX", "S", "SX", "SX(O)"],
    "Venue": ["E", "S", "S(O)", "SX", "SX(O)"],
    "i20": ["Era", "Magna", "Sportz", "Asta", "Asta (O)"],
    "Grand i10 Nios": ["Era", "Magna", "Sportz", "Asta"],
    "Verna": ["EX", "S", "SX", "SX(O)"]
  },
  "Tata": {
    "Nexon": ["Smart", "Pure", "Creative", "Fearless"],
    "Punch": ["Pure", "Adventure", "Accomplished", "Creative"],
    "Tiago": ["XE", "XM", "XT", "XZ", "XZ+"],
    "Altroz": ["XE", "XM", "XT", "XZ", "XZ+"],
    "Harrier": ["Smart", "Pure", "Adventure", "Fearless"],
    "Safari": ["Smart", "Pure", "Adventure", "Accomplished"]
  },
  "Mahindra": {
    "Scorpio-N": ["Z2", "Z4", "Z6", "Z8", "Z8L"],
    "Scorpio Classic": ["S", "S11"],
    "XUV700": ["MX", "AX3", "AX5", "AX7", "AX7L"],
    "Thar": ["AX Opt", "LX"],
    "Bolero": ["B4", "B6", "B6(O)"],
    "XUV300": ["W4", "W6", "W8", "W8(O)"]
  },
  "Toyota": {
    "Fortuner": ["4x2", "4x4", "Legender", "GR-S"],
    "Innova Crysta": ["GX", "VX", "ZX"],
    "Innova Hycross": ["G", "GX", "VX", "ZX", "ZX(O)"],
    "Urban Cruiser Hyryder": ["E", "S", "G", "V"],
    "Glanza": ["E", "S", "G", "V"]
  },
  "Kia": {
    "Seltos": ["HTE", "HTK", "HTK+", "HTX", "HTX+", "GTX+", "X-Line"],
    "Sonet": ["HTE", "HTK", "HTK+", "HTX", "HTX+", "GTX+", "X-Line"],
    "Carens": ["Premium", "Prestige", "Prestige Plus", "Luxury", "Luxury Plus"]
  },
  "Honda": {
    "City": ["SV", "V", "VX", "ZX"],
    "Amaze": ["E", "S", "VX"],
    "Elevate": ["SV", "V", "VX", "ZX"]
  }
};

const MODEL_BODY_TYPES = {
  "Swift": "hatchback",
  "Baleno": "hatchback",
  "Brezza": "suv",
  "Wagon R": "hatchback",
  "Alto K10": "hatchback",
  "Dzire": "sedan",
  "Ertiga": "muv",
  "Grand Vitara": "suv",
  "Creta": "suv",
  "Venue": "suv",
  "i20": "hatchback",
  "Grand i10 Nios": "hatchback",
  "Verna": "sedan",
  "Nexon": "suv",
  "Punch": "suv",
  "Tiago": "hatchback",
  "Altroz": "hatchback",
  "Harrier": "suv",
  "Safari": "suv",
  "Scorpio-N": "suv",
  "Scorpio Classic": "suv",
  "XUV700": "suv",
  "Thar": "suv",
  "Bolero": "suv",
  "XUV300": "suv",
  "Fortuner": "suv",
  "Innova Crysta": "muv",
  "Innova Hycross": "muv",
  "Urban Cruiser Hyryder": "suv",
  "Glanza": "hatchback",
  "Seltos": "suv",
  "Sonet": "suv",
  "Carens": "muv",
  "City": "sedan",
  "Amaze": "sedan",
  "Elevate": "suv"
};

export default function NewListingPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  
  const [isCustom, setIsCustom] = useState({ brand: false, model: false, variant: false });
  
  const [form, setForm] = useState({
    title: '',
    brand: '',
    model: '',
    variant: '',
    bodyType: '',
    year: '',
    color: '',
    mileage: '',
    fuelType: '',
    transmission: '',
    owners: '',
    city: '',
    price: '',
    registrationNumber: '',
    insuranceValid: '',
    rcVerified: false,
    accidentHistory: false,
    serviceHistory: false,
    description: '',
  });

  const [files, setFiles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiLoading, setAiLoading] = useState({ description: false, price: false });
  const [suggestedPriceRange, setSuggestedPriceRange] = useState(null);

  // Redirect non-dealers away
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    } else if (!isPending && session?.user?.role !== "dealer") {
      router.push("/dashboard");
    }
  }, [isPending, session, router]);

  // Title auto-generate
  useEffect(() => {
    if (form.brand && form.model && form.year) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(prev => ({
        ...prev,
        title: `${form.year} ${form.brand} ${form.model}${form.variant ? ' ' + form.variant : ''}`
      }));
    }
  }, [form.brand, form.model, form.year, form.variant]);

  async function generateAIDescription() {
    if (!form.brand || !form.year || !form.model) {
      alert("Please enter at least Brand, Model, and Year to generate a description.");
      return;
    }
    setAiLoading(prev => ({ ...prev, description: true }));
    try {
      const res = await fetch(`${API}/api/ai/description`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          brand: form.brand,
          model: form.model,
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
    if (!form.brand || !form.year || !form.model) {
      alert("Please enter at least Brand, Model, and Year to get a price suggestion.");
      return;
    }
    setAiLoading(prev => ({ ...prev, price: true }));
    setSuggestedPriceRange(null);
    try {
      const res = await fetch(`${API}/api/ai/price-estimate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          brand: form.brand,
          model: form.model,
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

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Validation
    const required = ['brand', 'model', 'bodyType', 'year', 'color', 'mileage', 'fuelType', 'transmission', 'owners', 'city', 'price'];
    const missing = required.filter(k => !form[k]);
    if (missing.length > 0) {
      setError(`Please fill: ${missing.join(', ')}`);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    Object.keys(form).forEach(key => {
      formData.append(key, form[key]);
    });

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
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-neutral-50">
        <div className="h-2.5 w-2.5 rounded-full bg-primary-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-57px)] bg-neutral-50 pb-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        
        <div className="mb-8">
          <a href="/dashboard" className="text-body-sm text-primary-600 hover:underline flex items-center gap-1 mb-4">
            ← Back to Dashboard
          </a>
          <h1 className="heading-page">Create New Listing</h1>
          <p className="text-muted mt-2">
            Providing more details helps your car sell faster. Fields marked with an asterisk (*) are required.
          </p>
        </div>

        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 text-body-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Title - Auto Generated View (Optional display, mostly to show the user what it looks like) */}
          {form.title && (
            <div className="card card-body lg:col-span-2 bg-primary-50 border-primary-100">
              <label className="label">Generated Title <span className="badge-primary ml-2">Auto-generated</span></label>
              <div className="text-heading-md text-primary-900 mt-1">{form.title}</div>
            </div>
          )}

          {/* Section 1: Basic Details */}
          <div className="card card-body">
            <h2 className="heading-sm text-primary-600 mb-4 pb-3 border-b border-neutral-100">
              1. Basic Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="brand">
                  Brand <span className="text-danger-500">*</span>
                </label>
                {!isCustom.brand ? (
                  <select
                    id="brand" className="select"
                    value={form.brand} 
                    onChange={e => {
                      if (e.target.value === "Other") {
                        setIsCustom({ brand: true, model: true, variant: true });
                        setForm({...form, brand: '', model: '', variant: ''});
                      } else {
                        setIsCustom({ brand: false, model: false, variant: false });
                        setForm({...form, brand: e.target.value, model: '', variant: ''});
                      }
                    }} 
                    required
                  >
                    <option value="">Select Brand</option>
                    {Object.keys(CAR_DATA).map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                    <option value="Other" className="font-semibold text-primary-600">Other (Type manually)</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text" className="input" placeholder="Enter Brand"
                      value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} required
                    />
                    <button type="button" onClick={() => {
                      setIsCustom({ brand: false, model: false, variant: false });
                      setForm({...form, brand: '', model: '', variant: ''});
                    }} className="px-3 border border-neutral-300 rounded-md text-neutral-500 hover:bg-neutral-100">
                      ✕
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="label" htmlFor="model">
                  Model <span className="text-danger-500">*</span>
                </label>
                {!isCustom.model ? (
                  <select
                    id="model" className="select"
                    value={form.model} 
                    onChange={e => {
                      if (e.target.value === "Other") {
                        setIsCustom({ ...isCustom, model: true, variant: true });
                        setForm({...form, model: '', variant: ''});
                      } else {
                        setIsCustom({ ...isCustom, model: false, variant: false });
                        const newModel = e.target.value;
                        const autoBodyType = MODEL_BODY_TYPES[newModel] || form.bodyType;
                        setForm({...form, model: newModel, variant: '', bodyType: autoBodyType});
                      }
                    }} 
                    required
                    disabled={!form.brand}
                  >
                    <option value="">Select Model</option>
                    {form.brand && CAR_DATA[form.brand] && Object.keys(CAR_DATA[form.brand]).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                    <option value="Other" className="font-semibold text-primary-600">Other (Type manually)</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text" className="input" placeholder="Enter Model"
                      value={form.model} onChange={e => setForm({...form, model: e.target.value})} required
                    />
                    {!isCustom.brand && (
                      <button type="button" onClick={() => {
                        setIsCustom({ ...isCustom, model: false, variant: false });
                        setForm({...form, model: '', variant: ''});
                      }} className="px-3 border border-neutral-300 rounded-md text-neutral-500 hover:bg-neutral-100">
                        ✕
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="label" htmlFor="variant">
                  Variant
                </label>
                {!isCustom.variant ? (
                  <select
                    id="variant" className="select"
                    value={form.variant} 
                    onChange={e => {
                      if (e.target.value === "Other") {
                        setIsCustom({ ...isCustom, variant: true });
                        setForm({...form, variant: ''});
                      } else {
                        setForm({...form, variant: e.target.value});
                      }
                    }}
                    disabled={!form.model}
                  >
                    <option value="">Select Variant (Optional)</option>
                    {form.brand && form.model && CAR_DATA[form.brand]?.[form.model]?.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                    <option value="Other" className="font-semibold text-primary-600">Other (Type manually)</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text" className="input" placeholder="Enter Variant"
                      value={form.variant} onChange={e => setForm({...form, variant: e.target.value})}
                    />
                    {(!isCustom.model) && (
                      <button type="button" onClick={() => {
                        setIsCustom({ ...isCustom, variant: false });
                        setForm({...form, variant: ''});
                      }} className="px-3 border border-neutral-300 rounded-md text-neutral-500 hover:bg-neutral-100">
                        ✕
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="label" htmlFor="bodyType">
                  Body Type <span className="text-danger-500">*</span>
                </label>
                <select
                  id="bodyType" className="select"
                  value={form.bodyType} onChange={e => setForm({...form, bodyType: e.target.value})} required
                >
                  <option value="">Select body type</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="muv">MUV</option>
                  <option value="coupe">Coupe</option>
                  <option value="convertible">Convertible</option>
                  <option value="pickup">Pickup</option>
                  <option value="van">Van</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="year">
                  Year <span className="text-danger-500">*</span>
                </label>
                <input
                  id="year" type="number" className="input" placeholder="e.g. 2023"
                  min="1990" max={new Date().getFullYear() + 1}
                  value={form.year} onChange={e => setForm({...form, year: e.target.value})} required
                />
              </div>
              <div>
                <label className="label" htmlFor="color">
                  Color <span className="text-danger-500">*</span>
                </label>
                <input
                  id="color" type="text" className="input" placeholder="e.g. White, Silver, Red"
                  value={form.color} onChange={e => setForm({...form, color: e.target.value})} required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Condition & Specs */}
          <div className="card card-body">
            <h2 className="heading-sm text-primary-600 mb-4 pb-3 border-b border-neutral-100">
              2. Condition & Specs
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="mileage">
                  KM Driven <span className="text-danger-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="mileage" type="number" className="input pr-12" placeholder="e.g. 45000" min="0"
                    value={form.mileage} onChange={e => setForm({...form, mileage: e.target.value})} required
                  />
                  <span className="absolute right-4 top-2.5 text-neutral-400 text-body-sm font-medium">km</span>
                </div>
              </div>
              <div>
                <label className="label" htmlFor="fuelType">
                  Fuel Type <span className="text-danger-500">*</span>
                </label>
                <select
                  id="fuelType" className="select"
                  value={form.fuelType} onChange={e => setForm({...form, fuelType: e.target.value})} required
                >
                  <option value="">Select fuel type</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="cng">CNG</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="lpg">LPG</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="transmission">
                  Transmission <span className="text-danger-500">*</span>
                </label>
                <select
                  id="transmission" className="select"
                  value={form.transmission} onChange={e => setForm({...form, transmission: e.target.value})} required
                >
                  <option value="">Select transmission</option>
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                  <option value="cvt">CVT</option>
                  <option value="amt">AMT</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="owners">
                  No. of Owners <span className="text-danger-500">*</span>
                </label>
                <select
                  id="owners" className="select"
                  value={form.owners} onChange={e => setForm({...form, owners: e.target.value})} required
                >
                  <option value="">Select owners</option>
                  <option value="1st owner">1st Owner</option>
                  <option value="2nd owner">2nd Owner</option>
                  <option value="3rd owner">3rd Owner</option>
                  <option value="4th owner or more">4th Owner or more</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="city">
                  City <span className="text-danger-500">*</span>
                </label>
                <input
                  id="city" type="text" className="input" placeholder="e.g. Mumbai, Delhi, Hyderabad"
                  value={form.city} onChange={e => setForm({...form, city: e.target.value})} required
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label !mb-0" htmlFor="price">
                    Price ₹ <span className="text-danger-500">*</span>
                  </label>
                  <button
                    type="button" onClick={suggestAIPrice} disabled={aiLoading.price}
                    className="text-body-xs font-bold text-primary-600 hover:text-primary-700 disabled:opacity-50 cursor-pointer"
                  >
                    {aiLoading.price ? "✨ Thinking..." : "✨ Suggest AI Price"}
                  </button>
                </div>
                <input
                  id="price" type="number" className="input" placeholder="e.g. 500000" min="0"
                  value={form.price} onChange={e => setForm({...form, price: e.target.value})} required
                />
                {suggestedPriceRange && (
                  <div className="mt-2 rounded-lg bg-emerald-50 p-3 border border-emerald-100">
                    <p className="text-sm font-bold text-emerald-800">
                      Suggested: ₹{suggestedPriceRange.min.toLocaleString("en-IN")} - ₹{suggestedPriceRange.max.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-emerald-600 mt-1">{suggestedPriceRange.reason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Trust & Documents */}
          <div className="card card-body">
            <h2 className="heading-sm text-primary-600 mb-4 pb-3 border-b border-neutral-100">
              3. Trust & Documents
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <p className="text-body-sm text-neutral-500 mb-2">
                  These details make your listing more trustworthy. Buyers prefer verified listings.
                </p>
              </div>
              <div>
                <label className="label" htmlFor="registrationNumber">
                  Registration Number
                </label>
                <input
                  id="registrationNumber" type="text" className="input" placeholder="e.g. MH-02-AB-1234"
                  value={form.registrationNumber} onChange={e => setForm({...form, registrationNumber: e.target.value})}
                />
              </div>
              <div>
                <label className="label" htmlFor="insuranceValid">
                  Insurance Valid Till
                </label>
                <input
                  id="insuranceValid" type="text" className="input" placeholder="e.g. March 2026"
                  value={form.insuranceValid} onChange={e => setForm({...form, insuranceValid: e.target.value})}
                />
              </div>
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                <div className="flex items-start gap-3 py-2">
                  <input
                    type="checkbox" id="rcVerified" className="mt-0.5 w-4 h-4 accent-primary-600 cursor-pointer"
                    checked={form.rcVerified} onChange={e => setForm({...form, rcVerified: e.target.checked})}
                  />
                  <label htmlFor="rcVerified" className="text-body-sm text-neutral-700 cursor-pointer">
                    RC transfer is ready
                  </label>
                </div>
                <div className="flex items-start gap-3 py-2">
                  <input
                    type="checkbox" id="accidentHistory" className="mt-0.5 w-4 h-4 accent-primary-600 cursor-pointer"
                    checked={form.accidentHistory} onChange={e => setForm({...form, accidentHistory: e.target.checked})}
                  />
                  <label htmlFor="accidentHistory" className="text-body-sm text-neutral-700 cursor-pointer">
                    No accident history
                  </label>
                </div>
                <div className="flex items-start gap-3 py-2">
                  <input
                    type="checkbox" id="serviceHistory" className="mt-0.5 w-4 h-4 accent-primary-600 cursor-pointer"
                    checked={form.serviceHistory} onChange={e => setForm({...form, serviceHistory: e.target.checked})}
                  />
                  <label htmlFor="serviceHistory" className="text-body-sm text-neutral-700 cursor-pointer">
                    Regular service records are available
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Description & Photos */}
          <div className="card card-body">
            <h2 className="heading-sm text-primary-600 mb-4 pb-3 border-b border-neutral-100">
              4. Description & Photos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label !mb-0" htmlFor="description">Description</label>
                  <button
                    type="button" onClick={generateAIDescription} disabled={aiLoading.description}
                    className="text-body-xs font-bold text-primary-600 hover:text-primary-700 disabled:opacity-50 cursor-pointer"
                  >
                    {aiLoading.description ? "✨ Writing..." : "✨ AI Auto-Write"}
                  </button>
                </div>
                <textarea
                  id="description" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="input min-h-[120px]" rows={6} placeholder="Low mileage, excellent condition, single owner..."
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="images">Images (select multiple)</label>
                <input
                  id="images" type="file" accept="image/*" multiple
                  onChange={e => setFiles(e.target.files)}
                  className="w-full text-body-sm text-neutral-500 file:mr-3 file:rounded-md file:border-0 file:bg-primary-50 file:text-primary-700 file:px-4 file:py-2 file:font-medium file:cursor-pointer hover:file:bg-primary-100 transition-colors"
                />
                <p className="helper-text mt-2">Max 5MB per image. Up to 10 images.</p>
              </div>
            </div>
          </div>

          {/* Submit Area */}
          <div className="lg:col-span-2 flex flex-col sm:flex-row gap-3 mt-2">
            <button type="submit" disabled={loading} className="btn-lg btn-primary flex-1">
              {loading ? 'Creating listing...' : '🚗 Create Listing'}
            </button>
            <a href="/dashboard" className="btn-lg btn-outline text-center flex-1">
              Cancel
            </a>
          </div>

        </form>
      </div>
    </div>
  );
}
