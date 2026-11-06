"use client";

import { useState, useEffect, useCallback, type Dispatch, type SetStateAction } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import cloudinaryLoader from "@/lib/cloudinary-loader";
import { compressImage } from "@/lib/image-compress";
import { useAppSession } from "@/lib/auth-client";
import { useToast } from "@/components/ToastProvider";
import {
  Check, UploadCloud, X, Plus, Car, Sparkles, Shield,
  ChevronRight, ChevronLeft, ImageOff, Video, Link2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createCarSchema } from "@autobazaar/shared";
import type { CloudFile } from "@autobazaar/shared";
import type { VehicleDetails } from "@/lib/vahan";



const CAR_DATA: Record<string, Record<string, string[]>> = {
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

const MODEL_BODY_TYPES: Record<string, string> = {
  "Swift": "hatchback", "Baleno": "hatchback", "Brezza": "suv",
  "Wagon R": "hatchback", "Alto K10": "hatchback", "Dzire": "sedan",
  "Ertiga": "muv", "Grand Vitara": "suv", "Creta": "suv",
  "Venue": "suv", "i20": "hatchback", "Grand i10 Nios": "hatchback",
  "Verna": "sedan", "Nexon": "suv", "Punch": "suv", "Tiago": "hatchback",
  "Altroz": "hatchback", "Harrier": "suv", "Safari": "suv",
  "Scorpio-N": "suv", "Scorpio Classic": "suv", "XUV700": "suv",
  "Thar": "suv", "Bolero": "suv", "XUV300": "suv", "Fortuner": "suv",
  "Innova Crysta": "muv", "Innova Hycross": "muv",
  "Urban Cruiser Hyryder": "suv", "Glanza": "hatchback",
  "Seltos": "suv", "Sonet": "suv", "Carens": "muv",
  "City": "sedan", "Amaze": "sedan", "Elevate": "suv"
};

const STEPS = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Media" },
  { id: 3, label: "Pricing" },
  { id: 4, label: "Review" },
];

const REQUIRED_STEP_1 = ["brand", "model", "bodyType", "year", "color", "city"];
const REQUIRED_STEP_3 = ["price", "mileage", "fuelType", "transmission", "owners"];

type WizardFeatures = { comfort: string[]; safety: string[]; interior: string[]; exterior: string[] };

type WizardFormData = {
  title: string; brand: string; model: string; variant: string; bodyType: string;
  year: string; color: string; mileage: string; fuelType: string; transmission: string;
  owners: string; city: string; price: string; registrationNumber: string;
  insuranceValid: string; rcVerified: boolean; accidentHistory: boolean;
  serviceHistory: boolean; description: string;
  engineCC: string; power: string; groundClearance: string; certifiedMileage: string;
  features: WizardFeatures;
};

type FieldErrors = Record<string, string>;
type CustomFlags = { brand: boolean; model: boolean; variant: boolean };
type Setter<T> = Dispatch<SetStateAction<T>>;

type SuggestedPriceRange = { min: number; max: number; reason?: string };

export default function AddCarWizard() {
  const router = useRouter();
  const { addToast } = useToast();
  const { data: session, isPending } = useAppSession();

  const [currentStep, setCurrentStep] = useState(1);
  const [isCustom, setIsCustom] = useState({ brand: false, model: false, variant: false });
  const [formData, setFormData] = useState<WizardFormData>({
    title: "", brand: "", model: "", variant: "", bodyType: "",
    year: "", color: "", mileage: "", fuelType: "", transmission: "",
    owners: "", city: "", price: "", registrationNumber: "",
    insuranceValid: "", rcVerified: false, accidentHistory: false,
    serviceHistory: false, description: "",
    // Pre-populated mechanical details & equipment categories (Phase 13)
    engineCC: "", power: "", groundClearance: "", certifiedMileage: "",
    features: { comfort: [], safety: [], interior: [], exterior: [] }
  });
  const [uploadedImages, setUploadedImages] = useState<CloudFile[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stepErrors, setStepErrors] = useState<Record<number, Record<string, string>>>({});
  const [aiLoading, setAiLoading] = useState({ description: false, price: false, specs: false });
  const [suggestedPriceRange, setSuggestedPriceRange] = useState<SuggestedPriceRange | null>(null);
  const [rtoData, setRtoData] = useState<VehicleDetails | null>(null);
  const [rtoLoading, setRtoLoading] = useState(false);
  const [rtoError, setRtoError] = useState("");

  useEffect(() => {
    if (formData.brand && formData.model && formData.year) {
      setFormData(prev => ({
        ...prev,
        title: `${formData.year} ${formData.brand} ${formData.model}${formData.variant ? ' ' + formData.variant : ''}`
      }));
    }
  }, [formData.brand, formData.model, formData.year, formData.variant]);

  const validateStep1 = useCallback(() => {
    const step1Schema = createCarSchema.pick({
      brand: true,
      model: true,
      bodyType: true,
      year: true,
      color: true,
      city: true
    });
    const result = step1Schema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        errors[String(issue.path[0])] = issue.message;
      });
      setStepErrors(prev => ({ ...prev, 1: errors }));
      return false;
    }
    setStepErrors(prev => ({ ...prev, 1: {} }));
    return true;
  }, [formData]);

  const validateStep2 = useCallback(() => {
    const errors: Record<string, string> = {};
    if (uploadedImages.length === 0) errors.images = "At least one image is required";
    setStepErrors(prev => ({ ...prev, 2: errors }));
    return Object.keys(errors).length === 0;
  }, [uploadedImages]);

  const validateStep3 = useCallback(() => {
    const step3Schema = createCarSchema.pick({
      price: true,
      mileage: true,
      fuelType: true,
      transmission: true,
      owners: true
    });
    const result = step3Schema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        errors[String(issue.path[0])] = issue.message;
      });
      setStepErrors(prev => ({ ...prev, 3: errors }));
      return false;
    }
    setStepErrors(prev => ({ ...prev, 3: {} }));
    return true;
  }, [formData]);

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleImageUpload = async (files: File[]) => {
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    // One photo per request, compressed first: Vercel rejects request bodies
    // over ~4.5 MB, so sending a batch of phone photos together would fail.
    let uploaded = 0;
    let lastError = "";
    for (const original of files) {
      try {
        const file = await compressImage(original);
        const formData = new FormData();
        formData.append("images", file);

        const res = await fetch(`/api/cars/upload`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        const data = (await res.json().catch(() => ({}))) as { images?: CloudFile[]; message?: string };
        if (res.ok && data.images) {
          setUploadedImages(prev => [...prev, ...(data.images ?? [])]);
          uploaded += data.images.length;
        } else {
          lastError = data.message || (res.status === 413 ? "Photo is too large" : "Upload failed");
        }
      } catch (err) {
        lastError = "Network error during upload";
      }
    }
    if (uploaded > 0) addToast(`${uploaded} image(s) uploaded`, "success");
    if (lastError) addToast(lastError, "error");
    setUploadingImages(false);
  };

  const handleRemoveImage = async (index: number) => {
    const image = uploadedImages[index];
    try {
      await fetch(`/api/cars/upload/${encodeURIComponent(image.publicId)}`, {
        method: "DELETE",
        credentials: "include",
      });
      setUploadedImages(prev => prev.filter((_, i) => i !== index));
    } catch (err) {
      setUploadedImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length + uploadedImages.length > 10) {
      addToast("Maximum 10 images allowed", "error");
      return;
    }
    handleImageUpload(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith("image/"));
    if (files.length + uploadedImages.length > 10) {
      addToast("Maximum 10 images allowed", "error");
      return;
    }
    handleImageUpload(files);
    e.target.value = "";
  };

  async function generateAIDescription() {
    if (!formData.brand || !formData.year || !formData.model) {
      addToast("Please enter Brand, Model, and Year first", "error");
      return;
    }
    setAiLoading(prev => ({ ...prev, description: true }));
    try {
      const res = await fetch(`/api/ai/description`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ brand: formData.brand, model: formData.model, year: formData.year }),
      });
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, description: data.description }));
      } else {
        const data = await res.json();
        addToast(data.message || "Failed to generate description", "error");
      }
    } catch (err) {
      addToast("Network error while reaching AI service", "error");
    }
    setAiLoading(prev => ({ ...prev, description: false }));
  }

  async function suggestAIPrice() {
    if (!formData.brand || !formData.year || !formData.model) {
      addToast("Please enter Brand, Model, and Year first", "error");
      return;
    }
    setAiLoading(prev => ({ ...prev, price: true }));
    setSuggestedPriceRange(null);
    try {
      const res = await fetch(`/api/ai/price-estimate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ brand: formData.brand, model: formData.model, year: formData.year }),
      });
      if (res.ok) {
        const data = await res.json();
        setSuggestedPriceRange(data);
      } else {
        const data = await res.json();
        addToast(data.message || "Failed to suggest price", "error");
      }
    } catch (err) {
      addToast("Network error while reaching AI service", "error");
    }
    setAiLoading(prev => ({ ...prev, price: false }));
  }

  // Calls backend Google Gemini API to dynamically retrieve specifications & features
  async function generateAISpecs() {
    if (!formData.brand || !formData.year || !formData.model) {
      addToast("Please enter Brand, Model, and Year first", "error");
      return;
    }
    setAiLoading(prev => ({ ...prev, specs: true }));
    try {
      const res = await fetch(`/api/ai/specs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          brand: formData.brand,
          model: formData.model,
          variant: formData.variant,
          year: formData.year,
          fuelType: formData.fuelType,
          transmission: formData.transmission
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({
          ...prev,
          engineCC: data.engineCC || "",
          power: data.power || "",
          groundClearance: data.groundClearance || "",
          certifiedMileage: data.certifiedMileage || "",
          features: data.features || { comfort: [], safety: [], interior: [], exterior: [] }
        }));
        addToast("Specifications & features auto-populated by AI!", "success");
      } else {
        const data = await res.json();
        addToast(data.message || "Failed to auto-populate specifications", "error");
      }
    } catch (err) {
      addToast("Network error while reaching AI specifications service", "error");
    }
    setAiLoading(prev => ({ ...prev, specs: false }));
  }

  async function verifyRtoDetails() {
    if (!formData.registrationNumber) {
      addToast("Please enter a registration number first", "error");
      return;
    }
    setRtoLoading(true);
    setRtoError("");
    setRtoData(null);
    try {
      const cleanReg = formData.registrationNumber.replace(/[\s-]/g, "").toUpperCase();
      const res = await fetch(`/api/cars/verify-vehicle/${cleanReg}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setRtoData(data);
      } else {
        setRtoError(data.message || "Failed to verify vehicle");
      }
    } catch (err) {
      setRtoError("Network error checking vehicle registration");
    }
    setRtoLoading(false);
  }

  function autoFillFromRto() {
    if (!rtoData) return;
    const isBrandPredefined = Object.keys(CAR_DATA).includes(rtoData.brand);
    const isModelPredefined = isBrandPredefined && Object.keys(CAR_DATA[rtoData.brand]).includes(rtoData.model);
    const isVariantPredefined = isModelPredefined && CAR_DATA[rtoData.brand][rtoData.model].includes(rtoData.variant);

    setIsCustom({
      brand: !isBrandPredefined,
      model: !isModelPredefined,
      variant: !isVariantPredefined
    });

    setFormData(prev => ({
      ...prev,
      brand: rtoData.brand,
      model: rtoData.model,
      variant: rtoData.variant || "",
      year: rtoData.year.toString(),
      fuelType: rtoData.fuelType.toLowerCase(),
      transmission: rtoData.transmission.toLowerCase(),
      owners: rtoData.owners,
      color: rtoData.color,
      insuranceValid: rtoData.insuranceValid,
      rcVerified: true,
    }));
  }

  async function handleSubmit() {
    const result = createCarSchema.safeParse(formData);
    if (!result.success) {
      const step1Errors: Record<string, string> = {};
      const step3Errors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        const field = String(issue.path[0]);
        const msg = issue.message;
        if ((REQUIRED_STEP_1 as string[]).includes(field)) {
          step1Errors[field] = msg;
        } else if ((REQUIRED_STEP_3 as string[]).includes(field)) {
          step3Errors[field] = msg;
        }
      });
      setStepErrors(prev => ({ ...prev, 1: step1Errors, 3: step3Errors }));
      addToast("Please correct the validation errors on the form.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const submitData = new FormData();
      (Object.keys(formData) as Array<keyof typeof formData>).forEach(key => {
        // Correctly serialize the nested features object as a JSON string
        if (key === "features") {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key === "rcVerified" || key === "accidentHistory" || key === "serviceHistory") {
          submitData.append(key, formData[key] ? "true" : "false");
        } else {
          submitData.append(key, String(formData[key]));
        }
      });

      uploadedImages.forEach((img, idx) => {
        submitData.append(`images[${idx}][url]`, img.url);
        submitData.append(`images[${idx}][publicId]`, img.publicId);
      });

      const res = await fetch(`/api/cars`, {
        method: "POST",
        credentials: "include",
        body: submitData,
      });

      const data = (await res.json()) as { message?: string; upgradeRequired?: boolean };
      if (res.ok) {
        addToast("Listing created successfully!", "success");
        router.push("/dashboard");
      } else {
        addToast(data.message || "Failed to create listing", "error");
        if (res.status === 403 && data.upgradeRequired) {
          router.push("/dashboard/billing");
        }
      }
    } catch (err) {
      addToast("Network error — is the server running?", "error");
    }
    setSubmitting(false);
  }

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-alt">
        {/* Unified spinner loader to core bg-primary-600 to prevent visual jumpiness */}
        <div className="h-2.5 w-2.5 rounded-full bg-primary-600 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

        {/* Back link */}
        <a href="/dashboard" className="text-sm text-primary-600 hover:underline flex items-center gap-1 mb-6">
          ← Back to Dashboard
        </a>

        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-ink-strong tracking-tight">Add New Car</h1>
          <p className="text-sm text-ink-muted mt-1">Complete all steps to create your listing.</p>
        </div>

        {/* Step indicator */}
        <div className="wizard-step-indicator">
          {STEPS.map((step, idx) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;
            const isConnectorActive = currentStep > step.id;

            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <div className="wizard-step">
                  <div className={`wizard-step-circle ${
                    isCompleted ? "wizard-step-circle-completed" :
                    isActive ? "wizard-step-circle-active" :
                    "wizard-step-circle-inactive"
                  }`}>
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className={`wizard-step-label ${
                    isActive ? "wizard-step-label-active" : "wizard-step-label-inactive"
                  }`}>
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`wizard-step-connector ${
                    isConnectorActive ? "wizard-step-connector-active" : "wizard-step-connector-inactive"
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Step1BasicInfo
                formData={formData}
                setFormData={setFormData}
                isCustom={isCustom}
                setIsCustom={setIsCustom}
                errors={stepErrors[1] || {}}
              />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Step2Media
                uploadedImages={uploadedImages}
                isDragging={isDragging}
                setIsDragging={setIsDragging}
                uploadingImages={uploadingImages}
                onDrop={handleDrop}
                onFileSelect={handleFileSelect}
                onRemoveImage={handleRemoveImage}
                videoUrl={videoUrl}
                setVideoUrl={setVideoUrl}
                errors={stepErrors[2] || {}}
                onClearAll={() => setUploadedImages([])}
              />
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Step3Pricing
                formData={formData}
                setFormData={setFormData}
                aiLoading={aiLoading}
                suggestedPriceRange={suggestedPriceRange}
                rtoData={rtoData}
                rtoLoading={rtoLoading}
                rtoError={rtoError}
                onGenerateDescription={generateAIDescription}
                onSuggestPrice={suggestAIPrice}
                onVerifyRto={verifyRtoDetails}
                onAutoFillRto={autoFillFromRto}
                onGenerateSpecs={generateAISpecs}
                errors={stepErrors[3] || {}}
              />
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Step4Review
                formData={formData}
                uploadedImages={uploadedImages}
                videoUrl={videoUrl}
                onGoToStep={setCurrentStep}
                onSubmit={handleSubmit}
                submitting={submitting}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="btn-md btn-outline inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-md btn-primary inline-flex items-center gap-2"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-lg btn-primary inline-flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Listing"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Step1BasicInfo({ formData, setFormData, isCustom, setIsCustom, errors }: {
  formData: WizardFormData;
  setFormData: Setter<WizardFormData>;
  isCustom: CustomFlags;
  setIsCustom: Setter<CustomFlags>;
  errors: FieldErrors;
}) {
  return (
    <div className="card p-6">
      <h2 className="text-lg font-bold text-ink-strong mb-6">Basic Information</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Brand */}
        <div>
          <label className="label">Brand <span className="text-danger-500">*</span></label>
          {!isCustom.brand ? (
            <select
              className={`select ${errors.brand ? "input-error" : ""}`}
              value={formData.brand}
              onChange={e => {
                if (e.target.value === "Other") {
                  setIsCustom({ brand: true, model: true, variant: true });
                  setFormData({ ...formData, brand: "", model: "", variant: "" });
                } else {
                  setIsCustom({ brand: false, model: false, variant: false });
                  setFormData({ ...formData, brand: e.target.value, model: "", variant: "" });
                }
              }}
            >
              <option value="">Select Brand</option>
              {Object.keys(CAR_DATA).map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
              <option value="Other">Other (Type manually)</option>
            </select>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                className={`input ${errors.brand ? "input-error" : ""}`}
                placeholder="Enter Brand"
                value={formData.brand}
                onChange={e => setFormData({ ...formData, brand: e.target.value })}
              />
              <button type="button" onClick={() => {
                setIsCustom({ brand: false, model: false, variant: false });
                setFormData({ ...formData, brand: "", model: "", variant: "" });
              }} className="px-3 border border-border-strong rounded-lg text-ink-muted hover:bg-surface-alt">
                <X className="h-4 w-4" aria-label="Clear" />
              </button>
            </div>
          )}
          {errors.brand && <p className="error-text">{errors.brand}</p>}
        </div>

        {/* Model */}
        <div>
          <label className="label">Model <span className="text-danger-500">*</span></label>
          {!isCustom.model ? (
            <select
              className={`select ${errors.model ? "input-error" : ""}`}
              value={formData.model}
              onChange={e => {
                if (e.target.value === "Other") {
                  setIsCustom({ ...isCustom, model: true, variant: true });
                  setFormData({ ...formData, model: "", variant: "" });
                } else {
                  setIsCustom({ ...isCustom, model: false, variant: false });
                  const newModel = e.target.value;
                  const autoBodyType = MODEL_BODY_TYPES[newModel] || formData.bodyType;
                  setFormData({ ...formData, model: newModel, variant: "", bodyType: autoBodyType });
                }
              }}
              disabled={!formData.brand}
            >
              <option value="">Select Model</option>
              {formData.brand && CAR_DATA[formData.brand] && Object.keys(CAR_DATA[formData.brand]).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
              <option value="Other">Other (Type manually)</option>
            </select>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                className={`input ${errors.model ? "input-error" : ""}`}
                placeholder="Enter Model"
                value={formData.model}
                onChange={e => setFormData({ ...formData, model: e.target.value })}
              />
              {!isCustom.brand && (
                <button type="button" onClick={() => {
                  setIsCustom({ ...isCustom, model: false, variant: false });
                  setFormData({ ...formData, model: "", variant: "" });
                }} className="px-3 border border-border-strong rounded-lg text-ink-muted hover:bg-surface-alt">
                  <X className="h-4 w-4" aria-label="Clear" />
                </button>
              )}
            </div>
          )}
          {errors.model && <p className="error-text">{errors.model}</p>}
        </div>

        {/* Variant */}
        <div>
          <label className="label">Variant</label>
          {!isCustom.variant ? (
            <select
              className="select"
              value={formData.variant}
              onChange={e => {
                if (e.target.value === "Other") {
                  setIsCustom({ ...isCustom, variant: true });
                  setFormData({ ...formData, variant: "" });
                } else {
                  setFormData({ ...formData, variant: e.target.value });
                }
              }}
              disabled={!formData.model}
            >
              <option value="">Select Variant (Optional)</option>
              {formData.brand && formData.model && CAR_DATA[formData.brand]?.[formData.model]?.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
              <option value="Other">Other (Type manually)</option>
            </select>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                className="input"
                placeholder="Enter Variant"
                value={formData.variant}
                onChange={e => setFormData({ ...formData, variant: e.target.value })}
              />
              {(!isCustom.model) && (
                <button type="button" onClick={() => {
                  setIsCustom({ ...isCustom, variant: false });
                  setFormData({ ...formData, variant: "" });
                }} className="px-3 border border-border-strong rounded-lg text-ink-muted hover:bg-surface-alt">
                  <X className="h-4 w-4" aria-label="Clear" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Body Type */}
        <div>
          <label className="label">Body Type <span className="text-danger-500">*</span></label>
          <select
            className={`select ${errors.bodyType ? "input-error" : ""}`}
            value={formData.bodyType}
            onChange={e => setFormData({ ...formData, bodyType: e.target.value })}
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
          {errors.bodyType && <p className="error-text">{errors.bodyType}</p>}
        </div>

        {/* Year */}
        <div>
          <label className="label">Year <span className="text-danger-500">*</span></label>
          <input
            type="number"
            className={`input ${errors.year ? "input-error" : ""}`}
            placeholder="e.g. 2023"
            min="1990"
            max={new Date().getFullYear() + 1}
            value={formData.year}
            onChange={e => setFormData({ ...formData, year: e.target.value })}
          />
          {errors.year && <p className="error-text">{errors.year}</p>}
        </div>

        {/* Color */}
        <div>
          <label className="label">Color <span className="text-danger-500">*</span></label>
          <input
            type="text"
            className={`input ${errors.color ? "input-error" : ""}`}
            placeholder="e.g. White, Silver, Red"
            value={formData.color}
            onChange={e => setFormData({ ...formData, color: e.target.value })}
          />
          {errors.color && <p className="error-text">{errors.color}</p>}
        </div>

        {/* City */}
        <div className="sm:col-span-2">
          <label className="label">City <span className="text-danger-500">*</span></label>
          <input
            type="text"
            className={`input ${errors.city ? "input-error" : ""}`}
            placeholder="e.g. Mumbai, Delhi, Hyderabad"
            value={formData.city}
            onChange={e => setFormData({ ...formData, city: e.target.value })}
          />
          {errors.city && <p className="error-text">{errors.city}</p>}
        </div>
      </div>
    </div>
  );
}

function Step2Media({ uploadedImages, isDragging, setIsDragging, uploadingImages, onDrop, onFileSelect, onRemoveImage, videoUrl, setVideoUrl, errors, onClearAll }: {
  uploadedImages: CloudFile[];
  isDragging: boolean;
  setIsDragging: Setter<boolean>;
  uploadingImages: boolean;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => Promise<void>;
  videoUrl: string;
  setVideoUrl: Setter<string>;
  errors: FieldErrors;
  onClearAll: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-lg font-bold text-ink-strong mb-2">Upload Vehicle Media</h2>
        <p className="text-sm text-ink-muted mb-6">High-quality photos increase lead generation by up to 40%.</p>

        {/* Drop zone */}
        <div
          className={`drop-zone ${isDragging ? "drop-zone-active" : ""}`}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary-600 text-white flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-ink-strong">Drag & Drop high-res photos here</p>
              <p className="text-sm text-ink-muted mt-1">Upload up to 10 images. Supported formats: JPG, PNG, HEIC.</p>
              <p className="text-xs text-ink-subtle mt-0.5">Minimum resolution recommended: 1920×1080.</p>
            </div>
            <label className="btn-md btn-outline-primary cursor-pointer mt-2">
              Browse Files
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={onFileSelect}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {uploadingImages && (
          <div className="flex items-center gap-2 mt-4 text-sm text-primary-600">
            <div className="h-4 w-4 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
            Uploading images...
          </div>
        )}

        {/* Image preview grid */}
        {uploadedImages.length > 0 && (
          <>
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm font-medium text-ink">Uploaded ({uploadedImages.length}/10)</p>
              <button
                type="button"
                onClick={() => {
                  uploadedImages.forEach(img => {
                    fetch(`/api/cars/upload/${encodeURIComponent(img.publicId)}`, { method: "DELETE", credentials: "include" });
                  });
                  onClearAll();
                }}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700"
              >
                Clear All
              </button>
            </div>

            <div className="image-preview-grid">
              {uploadedImages.map((img, idx) => (
                <div key={img.publicId} className="image-preview-item group">
                  <Image src={img.url} alt={`Upload ${idx + 1}`} fill sizes="240px" loader={cloudinaryLoader} className="w-full h-full object-cover" />
                  {idx === 0 && <span className="image-preview-hero-badge">Hero</span>}
                  <button
                    type="button"
                    onClick={() => onRemoveImage(idx)}
                    className="image-preview-remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {uploadedImages.length < 10 && (
                <label className="image-preview-item flex items-center justify-center border-dashed border-2 border-border-strong cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                  <div className="text-center">
                    <Plus className="w-5 h-5 text-ink-subtle mx-auto" />
                    <p className="text-xs text-ink-muted mt-1">Add More</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onFileSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </>
        )}

        {errors.images && <p className="error-text mt-3">{errors.images}</p>}
      </div>

      {/* 360° Video Walkthrough */}
      <div className="video-upload-section">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-surface-alt text-ink-muted flex items-center justify-center">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink-strong">360° Video Walkthrough (Optional)</h3>
            <p className="text-xs text-ink-muted mt-0.5">Paste a YouTube link or upload a short clip.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="input py-2 text-sm w-64"
            placeholder="https://youtube.com/..."
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
          />
          <button type="button" className="btn-sm btn-outline whitespace-nowrap">
            <Link2 className="w-3.5 h-3.5" /> Add Video
          </button>
        </div>
      </div>
    </div>
  );
}

function Step3Pricing({ formData, setFormData, aiLoading, suggestedPriceRange, rtoData, rtoLoading, rtoError, onGenerateDescription, onSuggestPrice, onVerifyRto, onAutoFillRto, onGenerateSpecs, errors }: {
  formData: WizardFormData;
  setFormData: Setter<WizardFormData>;
  aiLoading: { description: boolean; price: boolean; specs: boolean };
  suggestedPriceRange: SuggestedPriceRange | null;
  rtoData: VehicleDetails | null;
  rtoLoading: boolean;
  rtoError: string;
  onGenerateDescription: () => void | Promise<void>;
  onSuggestPrice: () => void | Promise<void>;
  onVerifyRto: () => void | Promise<void>;
  onAutoFillRto: () => void;
  onGenerateSpecs: () => void | Promise<void>;
  errors: FieldErrors;
}) {
  return (
    <div className="space-y-6">
      {/* Dynamic AI-Powered Technical Specifications & Features Auto-Population */}
      <div className="card p-6 border-dashed border-2 border-primary-200 bg-primary-50/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-ink-strong flex items-center gap-2 font-display">
              <Sparkles className="w-5 h-5 text-primary-600 animate-pulse shrink-0" />
              AI Technical Specifications & Features
            </h2>
            <p className="text-xs text-ink-muted mt-1">
              Google Gemini automatically finds Engine CC, Max Power, Ground Clearance, ARAI mileage, and standard comfort/safety equipment for this exact variant trim.
            </p>
          </div>
          <button
            type="button"
            onClick={onGenerateSpecs}
            disabled={aiLoading.specs || !formData.brand || !formData.model || !formData.year}
            className="btn-md btn-primary flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200 shrink-0"
          >
            {aiLoading.specs ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Populating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Auto-Populate Specs
              </>
            )}
          </button>
        </div>

        {/* Display populated specs review block */}
        {(formData.engineCC || formData.power || formData.groundClearance || formData.certifiedMileage) && (
          <div className="mt-4 rounded-xl border border-border bg-surface p-4">
            <h3 className="text-xs font-bold text-ink-subtle uppercase tracking-wider mb-3">AI Pre-populated Specs</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-ink-muted uppercase">Engine Displacement</label>
                <div className="relative mt-1">
                  <input
                    type="number"
                    className="input py-1.5 px-3 text-sm pr-9"
                    value={formData.engineCC || ""}
                    onChange={e => setFormData({ ...formData, engineCC: e.target.value })}
                  />
                  <span className="absolute right-3 top-2 text-xs text-ink-subtle">cc</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-muted uppercase">Engine Max Power</label>
                <input
                  type="text"
                  className="input py-1.5 px-3 text-sm mt-1"
                  placeholder="e.g. 118 bhp"
                  value={formData.power || ""}
                  onChange={e => setFormData({ ...formData, power: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-muted uppercase">Ground Clearance</label>
                <input
                  type="text"
                  className="input py-1.5 px-3 text-sm mt-1"
                  placeholder="e.g. 209 mm"
                  value={formData.groundClearance || ""}
                  onChange={e => setFormData({ ...formData, groundClearance: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-muted uppercase">ARAI Fuel Mileage</label>
                <input
                  type="text"
                  className="input py-1.5 px-3 text-sm mt-1"
                  placeholder="e.g. 17.5 kmpl"
                  value={formData.certifiedMileage || ""}
                  onChange={e => setFormData({ ...formData, certifiedMileage: e.target.value })}
                />
              </div>
            </div>
            
            {/* Populated lists counts summary */}
            <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-2">
              <span className="badge badge-primary flex items-center gap-1"><Sparkles className="h-3 w-3" /> Comfort ({formData.features?.comfort?.length || 0})</span>
              <span className="badge badge-success flex items-center gap-1"><Shield className="h-3 w-3" /> Safety ({formData.features?.safety?.length || 0})</span>
              <span className="badge badge-warning flex items-center gap-1"><Car className="h-3 w-3" /> Interior ({formData.features?.interior?.length || 0})</span>
              <span className="badge badge-neutral flex items-center gap-1"><Sparkles className="h-3 w-3" /> Exterior ({formData.features?.exterior?.length || 0})</span>
            </div>
          </div>
        )}
      </div>

      {/* Pricing & Specs */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-ink-strong mb-6">Pricing & Specifications</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Price */}
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0!">Price ₹ <span className="text-danger-500">*</span></label>
              <button
                type="button"
                onClick={onSuggestPrice}
                disabled={aiLoading.price}
                className="text-xs font-bold text-primary-600 hover:text-primary-700 disabled:opacity-50"
              >
                {aiLoading.price ? "Thinking..." : "Suggest AI Price"}
              </button>
            </div>
            <input
              type="number"
              className={`input ${errors.price ? "input-error" : ""}`}
              placeholder="e.g. 500000"
              min="0"
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: e.target.value })}
            />
            {errors.price && <p className="error-text">{errors.price}</p>}
            {suggestedPriceRange && (
              <div className="mt-2 rounded-lg bg-success-50 p-3 border border-success-100">
                <p className="text-sm font-bold text-success-800">
                  Suggested: ₹{suggestedPriceRange.min.toLocaleString("en-IN")} - ₹{suggestedPriceRange.max.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-success-600 mt-1">{suggestedPriceRange.reason}</p>
              </div>
            )}
          </div>

          {/* KM Driven */}
          <div>
            <label className="label">KM Driven <span className="text-danger-500">*</span></label>
            <div className="relative">
              <input
                type="number"
                className={`input pr-12 ${errors.mileage ? "input-error" : ""}`}
                placeholder="e.g. 45000"
                min="0"
                value={formData.mileage}
                onChange={e => setFormData({ ...formData, mileage: e.target.value })}
              />
              <span className="absolute right-4 top-2.5 text-ink-subtle text-sm font-medium">km</span>
            </div>
            {errors.mileage && <p className="error-text">{errors.mileage}</p>}
          </div>

          {/* Fuel Type */}
          <div>
            <label className="label">Fuel Type <span className="text-danger-500">*</span></label>
            <select
              className={`select ${errors.fuelType ? "input-error" : ""}`}
              value={formData.fuelType}
              onChange={e => setFormData({ ...formData, fuelType: e.target.value })}
            >
              <option value="">Select fuel type</option>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="cng">CNG</option>
              <option value="hybrid">Hybrid</option>
              <option value="lpg">LPG</option>
            </select>
            {errors.fuelType && <p className="error-text">{errors.fuelType}</p>}
          </div>

          {/* Transmission */}
          <div>
            <label className="label">Transmission <span className="text-danger-500">*</span></label>
            <select
              className={`select ${errors.transmission ? "input-error" : ""}`}
              value={formData.transmission}
              onChange={e => setFormData({ ...formData, transmission: e.target.value })}
            >
              <option value="">Select transmission</option>
              <option value="manual">Manual</option>
              <option value="automatic">Automatic</option>
              <option value="cvt">CVT</option>
              <option value="amt">AMT</option>
            </select>
            {errors.transmission && <p className="error-text">{errors.transmission}</p>}
          </div>

          {/* Owners */}
          <div>
            <label className="label">No. of Owners <span className="text-danger-500">*</span></label>
            <select
              className={`select ${errors.owners ? "input-error" : ""}`}
              value={formData.owners}
              onChange={e => setFormData({ ...formData, owners: e.target.value })}
            >
              <option value="">Select owners</option>
              <option value="1st owner">1st Owner</option>
              <option value="2nd owner">2nd Owner</option>
              <option value="3rd owner">3rd Owner</option>
              <option value="4th owner or more">4th Owner or more</option>
            </select>
            {errors.owners && <p className="error-text">{errors.owners}</p>}
          </div>

          {/* Insurance */}
          <div>
            <label className="label">Insurance Valid Till</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. March 2026"
              value={formData.insuranceValid}
              onChange={e => setFormData({ ...formData, insuranceValid: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Trust & Documents */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-ink-strong mb-2 flex items-center gap-2">
          {/* Unified icon color to core text-primary-600 shade */}
          <Shield className="w-5 h-5 text-primary-600" />
          Trust & Documents
        </h2>
        <p className="text-sm text-ink-muted mb-5">These details make your listing more trustworthy.</p>

        {/* Registration Number */}
        <div className="mb-5">
          <label className="label">Registration Number</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="input uppercase"
              placeholder="e.g. MH-12-DE-5678"
              value={formData.registrationNumber}
              onChange={e => setFormData({ ...formData, registrationNumber: e.target.value })}
            />
            <button
              type="button"
              onClick={onVerifyRto}
              disabled={rtoLoading || !formData.registrationNumber}
              className="btn-md btn-outline-primary whitespace-nowrap disabled:opacity-50"
            >
              {rtoLoading ? "Checking..." : "Verify RTO"}
            </button>
          </div>
          {rtoError && <p className="error-text mt-1.5">{rtoError}</p>}

          {rtoData && (
            <div className="mt-4 rounded-xl border border-success-200 bg-success-50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="badge badge-success text-xs font-bold px-2 py-0.5">RTO Verified</span>
                  <span className="text-sm font-bold text-success-800">{rtoData.registrationNumber}</span>
                </div>
                <button
                  type="button"
                  onClick={onAutoFillRto}
                  className="btn-sm btn-success text-white"
                >
                  Auto-Fill Form
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 pt-2 border-t border-success-100">
                <div>
                  <span className="block text-xs text-success-700 font-semibold">Owner</span>
                  <span className="text-sm font-bold text-ink">{rtoData.ownerName}</span>
                </div>
                <div>
                  <span className="block text-xs text-success-700 font-semibold">Vehicle</span>
                  <span className="text-sm font-bold text-ink">{rtoData.brand} {rtoData.model}</span>
                </div>
                <div>
                  <span className="block text-xs text-success-700 font-semibold">Year</span>
                  <span className="text-sm font-bold text-ink">{rtoData.year}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Checkboxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex items-start gap-3 py-2 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 w-4 h-4 accent-primary-600 cursor-pointer"
              checked={formData.rcVerified}
              onChange={e => setFormData({ ...formData, rcVerified: e.target.checked })}
            />
            <span className="text-sm text-ink">RC transfer is ready <span className="text-ink-muted">(the &quot;RTO Verified&quot; badge is added by KarBik after review)</span></span>
          </label>
          <label className="flex items-start gap-3 py-2 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 w-4 h-4 accent-primary-600 cursor-pointer"
              checked={formData.accidentHistory}
              onChange={e => setFormData({ ...formData, accidentHistory: e.target.checked })}
            />
            <span className="text-sm text-ink">No accident history</span>
          </label>
          <label className="flex items-start gap-3 py-2 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 w-4 h-4 accent-primary-600 cursor-pointer"
              checked={formData.serviceHistory}
              onChange={e => setFormData({ ...formData, serviceHistory: e.target.checked })}
            />
            <span className="text-sm text-ink">Service records available</span>
          </label>
        </div>
      </div>

      {/* Description */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-ink-strong">Description</h2>
          <button
            type="button"
            onClick={onGenerateDescription}
            disabled={aiLoading.description}
            className="text-xs font-bold text-primary-600 hover:text-primary-700 disabled:opacity-50"
          >
            {aiLoading.description ? "Writing..." : "AI Auto-Write"}
          </button>
        </div>
        <textarea
          className="input min-h-[120px] resize-none text-sm leading-relaxed"
          rows={5}
          placeholder="Low mileage, excellent condition, single owner..."
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
    </div>
  );
}

function Step4Review({ formData, uploadedImages, videoUrl, onGoToStep, onSubmit, submitting }: {
  formData: WizardFormData;
  uploadedImages: CloudFile[];
  videoUrl: string;
  onGoToStep: (step: number) => void;
  onSubmit: () => void | Promise<void>;
  submitting: boolean;
}) {
  const sections = [
    {
      label: "Basic Info",
      step: 1,
      fields: [
        { label: "Brand", value: formData.brand },
        { label: "Model", value: formData.model },
        { label: "Variant", value: formData.variant || "—" },
        { label: "Body Type", value: formData.bodyType },
        { label: "Year", value: formData.year },
        { label: "Color", value: formData.color },
        { label: "City", value: formData.city },
      ],
    },
    {
      label: "Media",
      step: 2,
      fields: [
        { label: "Images", value: `${uploadedImages.length} uploaded` },
        { label: "Video", value: videoUrl || "—" },
      ],
    },
    {
      label: "Pricing & Specs",
      step: 3,
      fields: [
        { label: "Price", value: `₹${Number(formData.price).toLocaleString("en-IN")}` },
        { label: "KM Driven", value: `${formData.mileage} km` },
        { label: "Fuel Type", value: formData.fuelType },
        { label: "Transmission", value: formData.transmission },
        { label: "Owners", value: formData.owners },
        { label: "Insurance", value: formData.insuranceValid || "—" },
        { label: "Engine CC", value: formData.engineCC ? `${formData.engineCC} cc` : "—" },
        { label: "Max Power", value: formData.power || "—" },
        { label: "Ground Clearance", value: formData.groundClearance || "—" },
        { label: "Certified Mileage", value: formData.certifiedMileage || "—" },
        { 
          label: "Populated Features", 
          value: formData.features 
            ? `${(formData.features.comfort?.length || 0) + (formData.features.safety?.length || 0) + (formData.features.interior?.length || 0) + (formData.features.exterior?.length || 0)} equipment items` 
            : "0 features" 
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-lg font-bold text-ink-strong mb-6">Review Your Listing</h2>

        {sections.map((section) => (
          <div key={section.label} className="mb-6 last:mb-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-ink">{section.label}</h3>
              <button
                type="button"
                onClick={() => onGoToStep(section.step)}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700"
              >
                Edit
              </button>
            </div>
            <div className="rounded-xl bg-surface-alt border border-border p-4">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {section.fields.map((field) => (
                  <div key={field.label}>
                    <dt className="text-xs text-ink-subtle">{field.label}</dt>
                    <dd className="text-sm font-semibold text-ink mt-0.5">{field.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        ))}

        {/* Image thumbnails */}
        {uploadedImages.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-ink mb-3">Images</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {uploadedImages.map((img, idx) => (
                <div key={idx} className="relative w-20 h-14 rounded-lg overflow-hidden bg-surface-alt shrink-0">
                  <Image src={img.url} alt={`Preview ${idx + 1}`} fill sizes="80px" loader={cloudinaryLoader} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="card p-6 bg-primary-50 border-primary-200">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shrink-0">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-primary-900">Ready to publish?</h3>
            <p className="text-xs text-primary-700 mt-1">
              Your listing will be visible to buyers immediately after submission. You can edit or delete it anytime from your dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
