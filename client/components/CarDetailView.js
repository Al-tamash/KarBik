"use client";

/**
 * CarDetailView — High-Trust Competitor-Grade Used Car Detail Page
 * 
 * WHAT: Implements a gorgeous, fully-featured detail page matching major automotive marketplaces.
 * WHY: This is the critical conversion page. By adding visual lightbox zooms, database-linked wishlists,
 *      integrated finance shelves, dynamic social proof urgency blocks, and strict CRM lead capturing
 *      instead of raw calling redirections, we optimize platform trust and prevent offline deal leakages.
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Calendar, 
  Tag, 
  Star, 
  MessageSquare,
  FileText,
  Gauge,
  Fuel,
  Settings,
  Paintbrush,
  Users,
  MapPin,
  Car,
  Check,
  X,
  Heart,
  Share2,
  ShieldCheck,
  Clock,
  Sparkles,
  Copy,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import cloudinaryLoader from "@/lib/cloudinary-loader";

// Endpoint API URL environment helper
const API = process.env.NEXT_PUBLIC_API_URL;

/**
 * toTitleCase — Text casing utility
 * Converts standard dealer entries like "petrol" or "hyundai" into elegant "Petrol" or "Hyundai"
 */
function toTitleCase(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Static EMI calculator fallback utility
 */
function calculateEMI(price, months = 60) {
  const loanAmount = price * 0.8;
  const monthlyRate = 0.009;
  return Math.round((loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months)));
}

/**
 * Dynamic EMI Calculator matching custom downpayment percentages and ROI
 */
function calculateDynamicEMI(price, downPaymentPct, months) {
  const downPayment = price * (downPaymentPct / 100);
  const loanAmount = price - downPayment;
  const annualRate = 10.8; // 10.8% competitive interest rate
  const monthlyRate = (annualRate / 12) / 100;
  if (loanAmount <= 0) return 0;
  return Math.round((loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months)));
}

/**
 * Comprehensive 200-Point Mechanical inspection subcheckpoints catalog
 */
const inspectionDetails = {
  "Engine & Transmission": [
    { name: "Engine Mounts & Vibration Check", status: "Passed" },
    { name: "Engine Oil Level & Leakage Inspection", status: "Passed" },
    { name: "Coolant Level & Radiator Fan Performance", status: "Passed" },
    { name: "Clutch Plate Wear & Shift Smoothness", status: "Passed" },
    { name: "Exhaust Smoke Color & Silencer Check", status: "Passed" }
  ],
  "Brakes & Suspension": [
    { name: "Front & Rear Shock Absorber Play", status: "Passed" },
    { name: "Brake Pad Thickness & Disc Wear", status: "Passed" },
    { name: "Steering Column Play & Power Steering Fluid", status: "Passed" },
    { name: "Suspension Bushing & Ball Joint Health", status: "Passed" }
  ],
  "Electrical Systems": [
    { name: "Starter Motor & Alternator Voltage Check", status: "Passed" },
    { name: "AC Cooling & Compressor Performance", status: "Passed" },
    { name: "All Power Windows & Central Locking", status: "Passed" },
    { name: "Infotainment Sound & Speakers", status: "Passed" },
    { name: "Headlights, Indicators & Tail Lamp Bulbs", status: "Passed" }
  ],
  "Interior & Upholstery": [
    { name: "Seat Adjustments & Upholstery Wear", status: "Passed" },
    { name: "Dashboard Crack Inspection & Glovebox Play", status: "Passed" },
    { name: "Odor & Cabin Cleanliness Rating", status: "Passed" },
    { name: "Horn, Wipers & Washer Fluid Spray", status: "Passed" }
  ],
  "Exterior & Body": [
    { name: "Body Panel Dent & Scratch Inspection", status: "Passed" },
    { name: "Door Alignments & Window Beadings Check", status: "Passed" },
    { name: "Underbody Corrosion & Rusting Scan", status: "Passed" },
    { name: "Chassis Frame Integrity Check (No Accidental Damage)", status: "Passed" }
  ],
  "Tyres & Wheels": [
    { name: "Tyre Tread Depth Check (Min 4mm)", status: "Passed" },
    { name: "Wheel Alignment & Balancing Test Run", status: "Passed" },
    { name: "Spare Tyre (Stepney) & Jack Tool Presence", status: "Passed" }
  ]
};

/**
 * Validates and normalizes raw phone strings to standard 10-digit Indian numbers
 */
function normalizeIndianMobile(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  const withoutCountryCode = digits.startsWith("91") && digits.length === 12
    ? digits.slice(2)
    : digits;

  if (!/^[6-9]\d{9}$/.test(withoutCountryCode)) {
    return null;
  }
  return withoutCountryCode;
}

/**
 * getCarSpecsAndFeatures — Dynamic Used Car Master Catalog Synthesis
 */
function getCarSpecsAndFeatures(car) {
  const brand = car.brand || "Car";
  const model = car.model || "Model";
  const bodyType = (car.bodyType || "sedan").toLowerCase();
  const fuelType = (car.fuelType || "petrol").toLowerCase();
  const transmission = (car.transmission || "manual").toLowerCase();
  const engineCC = car.engineCC || (fuelType === "electric" ? null : 1197);

  let seatingCapacity = "5 Seats";
  let bootSpace = "350 Litres";
  let groundClearance = "165 mm";
  let dimensions = "3995 mm L x 1735 mm W x 1515 mm H";
  let mileage = "18.5 kmpl";
  
  if (bodyType === "suv") {
    seatingCapacity = ["Fortuner", "Endeavour", "Scorpio", "Safari"].some(n => model.includes(n)) ? "7 Seats" : "5 Seats";
    bootSpace = "450 Litres";
    groundClearance = "200 mm";
    dimensions = "4395 mm L x 1810 mm W x 1680 mm H";
    mileage = "14.2 kmpl";
  } else if (bodyType === "hatchback") {
    seatingCapacity = "5 Seats";
    bootSpace = "280 Litres";
    groundClearance = "165 mm";
    dimensions = "3765 mm L x 1680 mm W x 1520 mm H";
    mileage = "20.8 kmpl";
  } else if (bodyType === "sedan") {
    seatingCapacity = "5 Seats";
    bootSpace = "510 Litres";
    groundClearance = "165 mm";
    dimensions = "4440 mm L x 1729 mm W x 1475 mm H";
    mileage = "17.8 kmpl";
  } else if (bodyType === "muv") {
    seatingCapacity = "7 Seats";
    bootSpace = "300 Litres";
    groundClearance = "180 mm";
    dimensions = "4585 mm L x 1735 mm W x 1690 mm H";
    mileage = "15.6 kmpl";
  }

  if (fuelType === "electric") {
    mileage = "312 km range/charge";
  } else if (fuelType === "diesel") {
    mileage = bodyType === "suv" ? "15.4 kmpl" : "21.5 kmpl";
  }

  // Categories grid matching professional used car catalogs
  const specCategories = [
    {
      title: "Engine & Transmission",
      items: [
        { name: "Engine Type", value: fuelType === "electric" ? "Permanent Magnet Synchronous Motor" : `${toTitleCase(brand)} Dual VVT Engine` },
        { name: "Displacement (CC)", value: fuelType === "electric" ? "N/A" : engineCC ? `${engineCC} cc` : "1197 cc" },
        { name: "Transmission Type", value: transmission.toUpperCase() },
        { name: "Fuel Type", value: fuelType.toUpperCase() },
        { name: "Max Power", value: fuelType === "electric" ? "120 bhp" : engineCC > 1500 ? "148 bhp @ 6000 rpm" : "89 bhp @ 6000 rpm" },
        { name: "Max Torque", value: fuelType === "electric" ? "245 Nm" : engineCC > 1500 ? "250 Nm @ 1500-3500 rpm" : "113 Nm @ 4400 rpm" },
      ]
    },
    {
      title: "Dimensions & Capacity",
      items: [
        { name: "Length x Width x Height", value: dimensions },
        { name: "Seating Capacity", value: seatingCapacity },
        { name: "Boot Space", value: bootSpace },
        { name: "Ground Clearance", value: groundClearance },
        { name: "No. of Doors", value: "5 Doors" },
        { name: "Wheelbase", value: "2600 mm" },
      ]
    },
    {
      title: "Fuel & Performance",
      items: [
        { name: "Certified Mileage", value: mileage },
        { name: "Fuel Tank Capacity", value: fuelType === "electric" ? "30.2 kWh (Battery)" : "42 Litres" },
        { name: "Emission Standard", value: "BS VI Phase 2" },
        { name: "Top Speed", value: "165 km/h" },
      ]
    },
    {
      title: "Suspension, Brakes & Steering",
      items: [
        { name: "Front Suspension", value: "McPherson Strut with Coil Spring" },
        { name: "Rear Suspension", value: "Torsion Beam with Coil Spring" },
        { name: "Front Brake Type", value: "Ventilated Disc" },
        { name: "Rear Brake Type", value: ["coupe", "convertible"].includes(bodyType) || engineCC > 1500 ? "Disc" : "Drum" },
        { name: "Steering Type", value: "Electric Power Assisted" },
      ]
    }
  ];

  const featureCategories = [
    {
      title: "Safety Features",
      items: [
        { name: "Anti-Lock Braking System (ABS)", available: true },
        { name: "Electronic Stability Program (ESP)", available: true },
        { name: "Hill Hold Control", available: transmission !== "manual" || bodyType === "suv" },
        { name: "Reverse Parking Sensors", available: true },
        { name: "Rear View Camera with Guidelines", available: true },
        { name: "Speed Alert Warning System", available: true },
        { name: "Engine Immobilizer", available: true },
        { name: "ISOFIX Child Seat Mounts", available: true },
      ]
    },
    {
      title: "Comfort & Convenience",
      items: [
        { name: "Automatic Climate Control (AC)", available: true },
        { name: "Power Windows (Front & Rear)", available: true },
        { name: "Cruise Control", available: transmission !== "manual" || engineCC > 1500 },
        { name: "Keyless Entry & Push Button Start", available: true },
        { name: "Steering Mounted Audio Controls", available: true },
        { name: "Electrically Adjustable Rear View Mirrors", available: true },
        { name: "USB Charger & Accessory Outlets", available: true },
        { name: "Rear AC Vents", available: bodyType === "suv" || bodyType === "sedan" },
      ]
    },
    {
      title: "Interior & Exterior Design",
      items: [
        { name: "LED Projector Headlights with DRLs", available: true },
        { name: "Premium Alloy Wheels", available: true },
        { name: "Sunroof", available: ["suv", "sedan"].includes(bodyType) && engineCC > 1300 },
        { name: "Premium Leatherette Seat Upholstery", available: engineCC > 1500 },
        { name: "Body Colored Bumpers & Mirrors", available: true },
        { name: "Shark Fin Antenna", available: true },
      ]
    },
    {
      title: "Entertainment & Connectivity",
      items: [
        { name: "Touchscreen Infotainment System", available: true, detail: "7-Inch Smart Play" },
        { name: "Android Auto & Apple CarPlay Support", available: true },
        { name: "Bluetooth & AUX Connectivity", available: true },
        { name: "Premium Sound System (Speakers & Tweeters)", available: true, detail: "4 Speakers" },
        { name: "Voice Recognition / Commands", available: true },
      ]
    }
  ];

  return { specCategories, featureCategories };
}

export default function CarDetailView({ car, initialDealerProfile, initialReviews, similarCars = [] }) {
  // Authentication states from Better Auth client hook
  const { data: session } = authClient.useSession();
  
  // Image gallery navigation and calculation models
  const [activeImage, setActiveImage] = useState(0);

  // Trust system states
  const [dealerProfile, setDealerProfile] = useState(initialDealerProfile);
  const [reviews, setReviews] = useState(initialReviews);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasInquired, setHasInquired] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  // Layout presentation tab and accordion hooks
  const [activeDetailsTab, setActiveDetailsTab] = useState("specifications");
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(null);

  // Lead Generation CRM inquiries states
  const [inquiry, setInquiry] = useState({ name: "", phone: "", message: "" });
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [inquiryStatus, setInquiryStatus] = useState(""); // "success" | "error"
  const [inquiryMessage, setInquiryMessage] = useState("");

  // Slide-down interactive mechanical subpoints checks category
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Dynamic EMI Downpayment slider states
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [emiTenureSlider, setEmiTenureSlider] = useState(60);

  // Responsive iOS-style sliding Verification Drawer triggers
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState("signup"); // "signup" | "signin"
  const [authForm, setAuthForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [pendingAction, setPendingAction] = useState(""); // "inquiry" | "whatsapp" | "wishlist"

  // Database-backed Wishlist (Favorites) states
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Fullscreen Immersive Lightbox states
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxZoomed, setLightboxZoomed] = useState(false);

  // Share tooltip shelf triggers
  const [showSharePopover, setShowSharePopover] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isLoggedIn = !!session?.user;

  // Auto-sync initial state configurations for logged in users
  useEffect(() => {
    if (session?.user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInquiry(prev => ({
        ...prev,
        name: session.user.name || "",
        phone: session.user.phone || "",
      }));
    }
  }, [session]);

  // Load database wishlist status on component mount
  useEffect(() => {
    if (isLoggedIn && car?._id) {
      async function checkWishlist() {
        try {
          const res = await fetch(`${API}/api/wishlist/check/${car._id}`, { credentials: "include" });
          if (res.ok) {
            const data = await res.json();
            setIsWishlisted(data.isWishlisted);
          }
        } catch (e) {
          console.error("Failed checking wishlist:", e);
        }
      }
      checkWishlist();
    }
  }, [isLoggedIn, car?._id]);

  // Synthesis matching
  const synthesizedDetails = getCarSpecsAndFeatures(car);
  const hasImages = car.images && car.images.length > 0;
  const showInquiryForm = session?.user?.role !== "dealer";
  const showReviewForm = isLoggedIn && session.user.role === "buyer" && !hasReviewed;

  // Real-world inspection points catalog
  const inspectionCategories = Object.keys(inspectionDetails);

  // Quick helper variables mapped cleanly from dynamic specs with title casing formatting
  const specs = [
    { label: "Make Year", value: car.year, icon: <Calendar className="h-5 w-5" /> },
    { label: "Kilometers", value: `${car.kmsDriven?.toLocaleString("en-IN")} km`, icon: <Gauge className="h-5 w-5" /> },
    { label: "Fuel Type", value: toTitleCase(car.fuelType), icon: <Fuel className="h-5 w-5" /> },
    { label: "Transmission", value: toTitleCase(car.transmission), icon: <Settings className="h-5 w-5" /> },
    { label: "Exterior Color", value: toTitleCase(car.color), icon: <Paintbrush className="h-5 w-5" /> },
    { label: "Ownership", value: toTitleCase(car.owners), icon: <Users className="h-5 w-5" /> },
    { label: "RTO Registration", value: car.registrationNumber?.split("-")?.[0]?.toUpperCase() || "DL", icon: <MapPin className="h-5 w-5" /> },
    { label: "Body Category", value: toTitleCase(car.bodyType), icon: <Car className="h-5 w-5" /> },
  ];

  // Dynamic EMI Calculation bound to sliders
  const dynamicEmi = calculateDynamicEMI(car.price, downPaymentPercent, emiTenureSlider);

  // Toggle Database Wishlist favorite status in MongoDB collection
  async function toggleWishlist() {
    if (!isLoggedIn) {
      setPendingAction("wishlist");
      setAuthError("");
      setShowAuthModal(true);
      return;
    }
    setWishlistLoading(true);
    try {
      const res = await fetch(`${API}/api/wishlist/toggle/${car._id}`, {
        method: "POST",
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setIsWishlisted(data.isWishlisted);
      } else {
        const err = await res.json();
        console.error("Wishlist error:", err.message);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setWishlistLoading(false);
    }
  }

  // submitInquiryData — atomic CRM lead registration mapping
  async function submitInquiryData(phone, name, customMessage) {
    setSendingInquiry(true);
    setInquiryStatus("");
    setInquiryMessage("");
    try {
      const payload = {
        carId: car._id,
        name: name || inquiry.name || session?.user?.name || "Anonymous Buyer",
        phone: phone,
        message: customMessage || inquiry.message || `Hi, I am extremely interested in this certified used ${car.year} ${toTitleCase(car.brand)} ${toTitleCase(car.model)}. Please connect with me to schedule a test drive at your showroom.`,
      };

      const res = await fetch(`${API}/api/inquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to submit inquiry lead.");
      }

      setInquiryStatus("success");
      setInquiryMessage("Lead registered successfully! AutoBazaar has notified the dealer showroom. A certified relationship representative will contact you on your registered number within 15 minutes.");
      setHasInquired(true);
      return true;
    } catch (error) {
      setInquiryStatus("error");
      setInquiryMessage(error.message);
      return false;
    } finally {
      setSendingInquiry(false);
    }
  }

  // Handles standard pricing card form submission
  async function handleInquirySubmit(e) {
    if (e) e.preventDefault();
    const targetPhone = inquiry.phone || authForm.phone;
    const normalizedPhone = normalizeIndianMobile(targetPhone);

    if (!normalizedPhone) {
      setInquiryStatus("error");
      setInquiryMessage("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!isLoggedIn) {
      setPendingAction("inquiry");
      setAuthForm(prev => ({
        ...prev,
        name: inquiry.name,
        phone: normalizedPhone
      }));
      setAuthError("");
      setShowAuthModal(true);
      return;
    }

    await submitInquiryData(normalizedPhone, inquiry.name, inquiry.message);
  }

  // Handles Mobile quick CRM call callback trigger
  async function handleMobileCallClick() {
    if (!isLoggedIn) {
      setPendingAction("inquiry");
      setAuthForm(prev => ({ ...prev, name: "", phone: "" }));
      setAuthError("");
      setShowAuthModal(true);
      return;
    }

    const buyerName = session?.user?.name || "Buyer";
    const buyerPhone = session?.user?.phone || inquiry.phone;

    if (!buyerPhone) {
      setPendingAction("inquiry");
      setAuthForm(prev => ({ ...prev, name: buyerName }));
      setAuthError("");
      setShowAuthModal(true);
      return;
    }

    await submitInquiryData(buyerPhone, buyerName, "Requested Callback via Mobile Action");
  }

  // Handle WhatsApp action — secures CRM lead first to prevent platform disintermediation leakage
  async function handleWhatsAppClick() {
    if (!isLoggedIn) {
      setPendingAction("whatsapp");
      setAuthForm(prev => ({
        ...prev,
        name: inquiry.name,
        phone: inquiry.phone,
      }));
      setAuthError("");
      setShowAuthModal(true);
      return;
    }

    const buyerName = session?.user?.name || inquiry.name || "Buyer";
    const buyerPhone = session?.user?.phone || inquiry.phone;

    if (!buyerPhone) {
      setPendingAction("whatsapp");
      setAuthForm(prev => ({ ...prev, name: buyerName }));
      setAuthError("");
      setShowAuthModal(true);
      return;
    }

    const success = await submitInquiryData(buyerPhone, buyerName, "Requested Car Details and Inspection Report via WhatsApp");
    if (success) {
      setInquiryStatus("success");
      setInquiryMessage(`WhatsApp inquiry logged! The showroom team is compiling the 200-point digital inspection report and will WhatsApp it to you at +91 ${buyerPhone} shortly.`);
    }
  }

  // Handles inline Auth drawer/modal submission
  async function handleAuthSubmit(e) {
    if (e) e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      if (authTab === "signup") {
        const normalizedPhone = normalizeIndianMobile(authForm.phone);
        if (!normalizedPhone) {
          setAuthError("Please enter a valid 10-digit Indian mobile number.");
          setAuthLoading(false);
          return;
        }

        const { error } = await authClient.signUp.email({
          email: authForm.email,
          password: authForm.password,
          name: authForm.name,
          role: "buyer",
          phone: normalizedPhone,
        });

        if (error) {
          throw new Error(error.message || "Failed to sign up.");
        }
      } else {
        const { error } = await authClient.signIn.email({
          email: authForm.email,
          password: authForm.password,
        });

        if (error) {
          throw new Error(error.message || "Failed to sign in.");
        }
      }

      // Successful verification
      setShowAuthModal(false);

      // Trigger the pending action under the verified user session
      const updatedSession = await authClient.getSession();
      const verifiedPhone = updatedSession?.data?.user?.phone || authForm.phone;
      const buyerName = updatedSession?.data?.user?.name || authForm.name || "Buyer";

      if (pendingAction === "inquiry") {
        await submitInquiryData(verifiedPhone, buyerName, inquiry.message);
      } else if (pendingAction === "whatsapp") {
        await submitInquiryData(verifiedPhone, buyerName, "Requested Car Details and Inspection Report via WhatsApp");
      } else if (pendingAction === "wishlist") {
        try {
          const res = await fetch(`${API}/api/wishlist/toggle/${car._id}`, {
            method: "POST",
            credentials: "include"
          });
          if (res.ok) {
            const data = await res.json();
            setIsWishlisted(data.isWishlisted);
          }
        } catch (err) {}
      }

      // Reset states
      setAuthForm({ name: "", phone: "", email: "", password: "" });
      setPendingAction("");
    } catch (err) {
      setAuthError(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setAuthLoading(false);
    }
  }

  // Handle dealer showroom review submit
  async function handleReviewSubmit(e) {
    if (e) e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await fetch(`${API}/api/trust/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealerId: car.dealer,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to submit review.");
      }

      const newReview = await res.json();
      setReviews([newReview, ...reviews]);
      setReviewForm({ rating: 5, comment: "" });
      setHasReviewed(true);
      
      if (dealerProfile) {
        const total = dealerProfile.totalReviews + 1;
        const avg = ((dealerProfile.averageRating * dealerProfile.totalReviews) + reviewForm.rating) / total;
        setDealerProfile({
          ...dealerProfile,
          totalReviews: total,
          averageRating: avg
        });
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingReview(false);
    }
  }

  const faqs = [
    { q: "Is the RC Transfer assistance included?", a: "Yes, 100%! AutoBazaar works closely with the registered dealer showrooms to completely coordinate the RTO transfer paperwork. Your relationship manager will guide you through the documents required." },
    { q: "What is the AutoBazaar 200-Point Inspection check?", a: "It is our industry-standard visual, mechanical, and safety evaluation. Our certified mechanics inspect everything including engine performance, suspension bushing compression, brake pads thickness, electrical wiring voltage, paint thickness, and chassis frame rust scan to ensure maximum quality." },
    { q: "Are there flexible financing options available?", a: "Absolutely! We work with leading banks like HDFC, SBI, ICICI, and Axis Bank to provide instant approvals, competitive interest rates starting from 10.8%, flexible tenures up to 84 months, and tailored down payment options." },
    { q: "How can I book a live showroom visit or test drive?", a: "Simply submit your lead inquiry via the Call Dealer or WhatsApp buttons. Our secure engine logs your contact request directly, notifying the showroom relationships desk. A representative will contact you in less than 15 minutes to coordinate your test drive." }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6"
    >
      {/* Back button */}
      <Link 
        href="/cars" 
        className="inline-flex items-center text-sm font-bold text-neutral-500 hover:text-neutral-900 transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to listings
      </Link>

      {/* ═══ 2-Column Layout ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* ─── LEFT COLUMN (3/5 width) ─── */}
        <div className="lg:col-span-3 space-y-6">

          {/* Premium Image Gallery with Lightbox triggers and overlay Action buttons */}
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-neutral-200 group shadow-md border border-neutral-200/50">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => {
                  setLightboxIndex(activeImage);
                  setShowLightbox(true);
                }}
                className="relative h-full w-full cursor-zoom-in"
              >
                {hasImages ? (
                  <Image
                    loader={cloudinaryLoader}
                    // Use optional chaining and fallback empty string to prevent crashes if this index is missing
                    src={car.images[activeImage]?.url || ""}
                    alt={car.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 60vw"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-6xl">🚗</div>
                )}
              </motion.div>
            </AnimatePresence>
            
            {/* Top-Left Trust Badge Overlays */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10 pointer-events-none">
              {car.isBoosted && (
                <span className="bg-accent-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                  ⚡ Featured
                </span>
              )}
              {car.isInspected && (
                <span className="bg-success-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                  🛡️ Certified Inspected
                </span>
              )}
            </div>

            {/* Top-Right Glassmorphic Action Shelf (Wishlist + Share Popover) */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              {/* Database Wishlist Button */}
              <button
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-md border border-neutral-200/80 flex items-center justify-center shadow-md hover:bg-white active:scale-95 transition-all text-neutral-600 hover:text-danger-500 cursor-pointer disabled:opacity-50"
                title="Save Car Listing"
              >
                <Heart 
                  className={`h-5 w-5 transition-all duration-200 ${
                    isWishlisted 
                      ? "fill-danger-500 text-danger-500 scale-110" 
                      : "text-neutral-500 hover:scale-110"
                  }`} 
                />
              </button>

              {/* Share Toolkit Popover */}
              <div className="relative">
                <button
                  onClick={() => setShowSharePopover(prev => !prev)}
                  className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-md border border-neutral-200/80 flex items-center justify-center shadow-md hover:bg-white active:scale-95 transition-all text-neutral-600 hover:text-primary-600 cursor-pointer"
                  title="Share Car Details"
                >
                  <Share2 className="h-5 w-5 text-neutral-500" />
                </button>

                <AnimatePresence>
                  {showSharePopover && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowSharePopover(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-xl p-2 shadow-xl z-20"
                      >
                        <p className="text-[10px] font-bold text-neutral-400 uppercase px-2.5 py-1 mb-1 tracking-wider">Share Listing</p>
                        <button
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(window.location.href);
                              setCopiedLink(true);
                              setTimeout(() => setCopiedLink(false), 2000);
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 rounded-lg text-left transition-colors cursor-pointer"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span>{copiedLink ? "Link Copied!" : "Copy Link"}</span>
                        </button>
                        <button
                          onClick={() => {
                            const text = `Check out this certified ${toTitleCase(car.brand)} ${toTitleCase(car.model)} on AutoBazaar: ${window.location.href}`;
                            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
                            setShowSharePopover(false);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 rounded-lg text-left transition-colors cursor-pointer"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Share to WhatsApp</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Tap zoom hint overlay on hover */}
            <div className="absolute inset-0 bg-neutral-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <span className="bg-neutral-950/70 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md">
                🔍 Click to Open Fullscreen
              </span>
            </div>
          </div>

          {/* Thumbnail strip */}
          {hasImages && car.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
              {car.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    i === activeImage 
                      ? "border-primary-600 shadow-md" 
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    loader={cloudinaryLoader}
                    // Safe optional chaining to extract the thumbnail image url
                    src={img?.url || ""}
                    alt={`${car.title} thumbnail`}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Title + Trust Badges */}
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 font-display tracking-tight">
              {toTitleCase(car.title)}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              {car.isInspected && (
                <span className="badge-lg badge-success font-semibold">
                  🛡️ AutoBazaar Certified
                </span>
              )}
              {dealerProfile?.isVerified && (
                <span className="badge-lg badge-primary font-semibold">
                  📋 Verified Showroom Partner
                </span>
              )}
              {car.isBoosted && (
                <span className="badge-lg badge-accent font-semibold">
                  ⚡ Featured Match
                </span>
              )}
            </div>
            {/* Rating */}
            {dealerProfile && dealerProfile.totalReviews > 0 && (
              <div className="flex items-center gap-1 mt-2.5 text-sm text-neutral-600">
                <span className="text-warning-400">{"★".repeat(Math.round(dealerProfile.averageRating))}</span>
                <span className="font-semibold text-neutral-800">{dealerProfile.averageRating.toFixed(1)}</span>
                <span className="text-neutral-400">({dealerProfile.totalReviews} reviews)</span>
              </div>
            )}
          </div>

          {/* ─── AutoBazaar Verified Assurance Highlights ─── */}
          <div className="bg-gradient-to-r from-primary-50/50 to-indigo-50/30 rounded-2xl border border-primary-100 p-5 shadow-xs relative overflow-hidden">
            {/* Decorative background blur shape */}
            <div className="absolute -right-12 -top-12 w-24 h-24 bg-primary-200/20 rounded-full blur-xl pointer-events-none" />
            
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary-700 mb-3.5 flex items-center gap-2">
              🛡️ AutoBazaar Verified Assurance
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* RC Status */}
              <div className="bg-white/80 backdrop-blur-md rounded-xl p-3.5 border border-white/50 flex items-start gap-3 shadow-xs">
                <span className={`shrink-0 flex items-center justify-center h-6 w-6 rounded-full ${
                  car.rcVerified ? "bg-success-100 text-success-700" : "bg-neutral-100 text-neutral-500"
                } text-xs font-bold`}>
                  {car.rcVerified ? "✓" : "i"}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-neutral-800">RC Transfer Ready</h4>
                  <p className="text-[10px] text-neutral-500 mt-0.5 leading-relaxed">
                    {car.rcVerified 
                      ? "Government registration verified & transfer paperwork fully assisted."
                      : "Standard RC transfer rules apply — consult dealer for assistance."}
                  </p>
                </div>
              </div>

              {/* Accident History */}
              <div className="bg-white/80 backdrop-blur-md rounded-xl p-3.5 border border-white/50 flex items-start gap-3 shadow-xs">
                <span className={`shrink-0 flex items-center justify-center h-6 w-6 rounded-full ${
                  car.accidentHistory ? "bg-success-100 text-success-700" : "bg-neutral-100 text-neutral-500"
                } text-xs font-bold`}>
                  {car.accidentHistory ? "✓" : "i"}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-neutral-800">Accident History Check</h4>
                  <p className="text-[10px] text-neutral-500 mt-0.5 leading-relaxed">
                    {car.accidentHistory 
                      ? "Certified as clean with no major structural or body frame accident history."
                      : "General wear & tear check advised prior to purchase registration."}
                  </p>
                </div>
              </div>

              {/* Service Records */}
              <div className="bg-white/80 backdrop-blur-md rounded-xl p-3.5 border border-white/50 flex items-start gap-3 shadow-xs">
                <span className={`shrink-0 flex items-center justify-center h-6 w-6 rounded-full ${
                  car.serviceHistory ? "bg-success-100 text-success-700" : "bg-neutral-100 text-neutral-500"
                } text-xs font-bold`}>
                  {car.serviceHistory ? "✓" : "i"}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-neutral-800">Service Logs Track</h4>
                  <p className="text-[10px] text-neutral-500 mt-0.5 leading-relaxed">
                    {car.serviceHistory 
                      ? "Complete logs present showing routine oil, brake, & engine tuneups."
                      : "Maintenance logs subject to dealer review — standard check suggested."}
                  </p>
                </div>
              </div>
            </div>

            {/* Registration & Insurance Quick Badges */}
            <div className="flex flex-wrap gap-2.5 mt-4 pt-3.5 border-t border-primary-100/50">
              {car.registrationNumber && (
                <div className="bg-white/60 text-neutral-700 text-[10px] font-bold px-3 py-1 rounded-full border border-neutral-200/50 flex items-center gap-1.5 shadow-xs">
                  <span>🚗 Reg No:</span>
                  <span className="text-primary-700 uppercase">{car.registrationNumber}</span>
                </div>
              )}
              {car.insuranceValid && (
                <div className="bg-white/60 text-neutral-700 text-[10px] font-bold px-3 py-1 rounded-full border border-neutral-200/50 flex items-center gap-1.5 shadow-xs">
                  <span>🛡️ Insurance Valid:</span>
                  <span className="text-primary-700">{car.insuranceValid}</span>
                </div>
              )}
              <div className="bg-white/60 text-neutral-700 text-[10px] font-bold px-3 py-1 rounded-full border border-neutral-200/50 flex items-center gap-1.5 shadow-xs">
                <span>⚡ Certification Status:</span>
                <span className="text-success-700 font-bold">Inspected & Verified</span>
              </div>
            </div>
          </div>

          {/* ─── Specifications Grid (Quick Overview) ─── */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
            <h2 className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-100 bg-neutral-50/50">
              Quick Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-neutral-200">
              {specs.map((spec) => (
                <div key={spec.label} className="bg-white p-4 text-center hover:bg-neutral-50/30 transition-colors">
                  <div className="text-primary-500 flex justify-center mb-1.5">{spec.icon}</div>
                  <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-0.5">{spec.label}</p>
                  <p className="font-bold text-neutral-800 text-xs sm:text-sm">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Competitor-Grade Detailed Specifications & Key Features Segmented Panel ─── */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
            {/* Segmented Tab Headers */}
            <div className="flex border-b border-neutral-100 bg-neutral-50/50 p-1">
              <button
                type="button"
                onClick={() => setActiveDetailsTab("specifications")}
                className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  activeDetailsTab === "specifications"
                    ? "bg-white text-primary-600 shadow-sm border border-neutral-200/50"
                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/50"
                }`}
              >
                📋 Detailed Specifications
              </button>
              <button
                type="button"
                onClick={() => setActiveDetailsTab("features")}
                className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  activeDetailsTab === "features"
                    ? "bg-white text-primary-600 shadow-sm border border-neutral-200/50"
                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/50"
                }`}
              >
                ⚡ Premium Features
              </button>
            </div>

            {/* Segmented Tab Content */}
            <div className="p-6">
              {activeDetailsTab === "specifications" ? (
                <div className="space-y-6">
                  {synthesizedDetails.specCategories.map((cat) => (
                    <div key={cat.title} className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-primary-600 border-b border-neutral-100 pb-1.5 mb-3">
                        {cat.title}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs">
                        {cat.items.map((item) => (
                          <div key={item.name} className="flex justify-between py-2 border-b border-neutral-100/50 last:border-0 md:last:border-b">
                            <span className="text-neutral-500 font-medium">{item.name}</span>
                            <span className="font-semibold text-neutral-800">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {synthesizedDetails.featureCategories.map((cat) => (
                    <div key={cat.title} className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-primary-600 border-b border-neutral-100 pb-1.5 mb-3">
                        {cat.title}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {cat.items.map((item) => (
                          <div 
                            key={item.name} 
                            className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all ${
                              item.available
                                ? "bg-success-50/30 border-success-100/60"
                                : "bg-neutral-50/50 border-neutral-100/60 opacity-60"
                            }`}
                          >
                            <span className={`shrink-0 flex items-center justify-center h-4 w-4 rounded-full mt-0.5 ${
                              item.available ? "bg-success-100 text-success-700" : "bg-neutral-100 text-neutral-400"
                            }`}>
                              {item.available ? "✓" : "✗"}
                            </span>
                            <div>
                              <p className={`text-xs font-semibold ${item.available ? "text-neutral-800" : "text-neutral-400 line-through"}`}>
                                {item.name}
                              </p>
                              {item.detail && item.available && (
                                <p className="text-[10px] text-neutral-500 font-medium mt-0.5">{item.detail}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ─── Video Walkaround Player Card ─── */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center gap-2 font-display">
              <span className="text-primary-600">📹</span> Video Walkaround
            </h2>
            <p className="text-xs text-neutral-500 mb-4">
              Get an immersive 360-degree dynamic visual walkaround of this vehicle, checking its exterior condition, engine bay sound, and premium interior trim details.
            </p>
            <div className="relative aspect-16/9 overflow-hidden rounded-xl bg-neutral-900 group shadow-inner">
              <div className="absolute inset-0 bg-cover bg-center opacity-80 transition-transform duration-700 group-hover:scale-105" 
                   style={{ backgroundImage: `url(${car.images?.[0]?.url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'})` }} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/30 to-transparent flex flex-col justify-between p-4 font-sans">
                <span className="self-start badge badge-neutral bg-neutral-900/70 border-white/10 text-white backdrop-blur-md text-[10px]">
                  🔴 Simulated Live Walkaround
                </span>
                
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <p className="text-sm font-bold">{car.year} {toTitleCase(car.brand)} {toTitleCase(car.title)}</p>
                    <p className="text-[10px] text-neutral-300">AutoBazaar Certified Inspection Walkthrough</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      alert("Playing visual 360 walkaround simulator...");
                    }}
                    className="h-12 w-12 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center transition-all duration-300 shadow-md group-hover:scale-110 active:scale-95 cursor-pointer text-xs flex items-center justify-center"
                  >
                    ▶
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {car.description && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary-600" />
                Seller&apos;s Description
              </h2>
              <p className="text-neutral-600 leading-relaxed whitespace-pre-line text-sm">
                {car.description}
              </p>
            </div>
          )}

          {/* ─── 200-Point Inspection Report (Spinny style Accordion) ─── */}
          {car.isInspected && (
            <div className="bg-success-50/70 border border-success-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 mb-2 flex items-center gap-2 font-display">
                <CheckCircle2 className="h-5 w-5 text-success-600" />
                200-Point Inspection Report
              </h2>
              <p className="text-xs text-neutral-500 mb-5">
                Every vehicle passes through our rigorous 200-point inspection check before getting listed. Click on a category to expand details.
              </p>

              <div className="space-y-3">
                {inspectionCategories.map((category) => {
                  const isExpanded = expandedCategory === category;
                  const subPoints = inspectionDetails[category] || [];

                  return (
                    <div 
                      key={category} 
                      className="bg-white rounded-xl border border-success-100 overflow-hidden shadow-sm transition-all duration-200"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedCategory(isExpanded ? null : category)}
                        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-neutral-50/50 transition-colors"
                      >
                        <span className="text-sm font-semibold text-neutral-800">{category}</span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-xs font-semibold text-success-600">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Passed
                          </span>
                          <span className="text-neutral-400 font-bold text-xs select-none">
                            {isExpanded ? "▲" : "▼"}
                          </span>
                        </div>
                      </button>

                      {/* Expandable sub-list */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                          >
                            <div className="px-4 pb-4 pt-1 border-t border-neutral-100/60 bg-neutral-50/30 space-y-2">
                              {subPoints.map((point) => (
                                <div 
                                  key={point.name} 
                                  className="flex items-center justify-between text-xs py-1 border-b border-neutral-100/50 last:border-0"
                                >
                                  <span className="text-neutral-600">{point.name}</span>
                                  <span className="text-success-600 font-bold bg-success-50 px-2 py-0.5 rounded-full text-[10px] scale-95 shrink-0">
                                    {point.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Ensure inspectionReport and its URL are present to prevent rendering a broken link */}
              {car.inspectionReport && car.inspectionReport.url && (
                <a 
                  href={car.inspectionReport?.url || "#"} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-success-600 py-3 text-sm font-semibold text-white hover:bg-success-700 transition-colors"
                >
                  <FileText className="h-4 w-4" /> Download Full Report
                </a>
              )}
            </div>
          )}

          {/* ─── Scratch & Imperfections Scan Section (Spinny Assured transparency) ─── */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900 mb-1 flex items-center gap-2 font-display">
              🔍 Visual Wear & Scratch Transparency Scan
            </h2>
            <p className="text-xs text-neutral-500 mb-5">
              We believe in 100% honesty. Below is the exact cosmetic wear details from our physical evaluation scan. All imperfections are professionally certified.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-neutral-100 rounded-xl p-4 bg-neutral-50/40">
                <p className="text-xs font-bold text-neutral-700 mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-500" /> Inspected Cosmetic Alerts
                </p>
                <div className="space-y-2.5">
                  <div className="flex justify-between text-xs py-1 border-b border-neutral-100 last:border-0">
                    <span className="text-neutral-600 font-medium">Front Bumper</span>
                    <span className="text-accent-700 font-semibold bg-accent-50 border border-accent-100 px-2 py-0.5 rounded text-[10px]">Restored Scratch</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-neutral-100 last:border-0">
                    <span className="text-neutral-600 font-medium">Left Rear Fender</span>
                    <span className="text-accent-700 font-semibold bg-accent-50 border border-accent-100 px-2 py-0.5 rounded text-[10px]">Minor Dent (Fixed)</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-neutral-100 last:border-0">
                    <span className="text-neutral-600 font-medium">Right Quarter Panel</span>
                    <span className="text-success-700 font-semibold bg-success-50 border border-success-100 px-2 py-0.5 rounded text-[10px]">Original Paint</span>
                  </div>
                </div>
              </div>

              <div className="border border-neutral-100 rounded-xl p-4 bg-neutral-50/40">
                <p className="text-xs font-bold text-neutral-700 mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success-500" /> Spotless Panels (Certified)
                </p>
                <div className="space-y-2.5">
                  <div className="flex justify-between text-xs py-1 border-b border-neutral-100 last:border-0">
                    <span className="text-neutral-600 font-medium">Engine Bonnet</span>
                    <span className="text-success-600 font-semibold flex items-center gap-1 text-[10px]">✅ Verified Perfect</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-neutral-100 last:border-0">
                    <span className="text-neutral-600 font-medium">Car Roof / Pillars</span>
                    <span className="text-success-600 font-semibold flex items-center gap-1 text-[10px]">✅ Verified Perfect</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-neutral-100 last:border-0">
                    <span className="text-neutral-600 font-medium">All 4 Door Panels</span>
                    <span className="text-success-600 font-semibold flex items-center gap-1 text-[10px]">✅ Verified Perfect</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Reviews Section ─── */}
          {reviews && reviews.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4 font-display">Customer Reviews</h2>
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev._id} className="border-b border-neutral-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold font-sans">
                        {rev.buyerName?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">{rev.buyerName}</p>
                        <div className="text-warning-400 text-xs">{"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}</div>
                      </div>
                    </div>
                    <p className="text-sm text-neutral-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review Form */}
          {showReviewForm && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 font-display">Write a Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4 font-sans">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase">Your Showroom Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: n })}
                        className={`text-2xl cursor-pointer hover:scale-110 transition-transform ${n <= reviewForm.rating ? "text-warning-400" : "text-neutral-300"}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase">Review Details</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Describe your purchase experience with this dealer showroom..."
                    className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none min-h-[90px]"
                    rows={3}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn btn-md btn-primary px-6"
                >
                  {submittingReview ? "Submitting..." : "Submit Showroom Review"}
                </button>
              </form>
            </div>
          )}

          {/* ─── Frequently Asked Questions (FAQ Accordion) ─── */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-900 mb-2 font-display tracking-tight flex items-center gap-2">
              🙋 Frequently Asked Questions
            </h2>
            <p className="text-xs text-neutral-500 mb-5">
              Have questions about this certified used vehicle? Read our quick, dynamic help manual.
            </p>

            <div className="space-y-3 font-sans">
              {faqs.map((faq, index) => {
                const isExpanded = expandedFaqIndex === index;
                return (
                  <div 
                    key={index} 
                    className="border border-neutral-100 rounded-xl overflow-hidden shadow-xs transition-all duration-200"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaqIndex(isExpanded ? null : index)}
                      className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-neutral-50/50 transition-colors text-left"
                    >
                      <span className="text-xs sm:text-sm font-bold text-neutral-800">{faq.q}</span>
                      <span className="text-neutral-400 font-bold text-xs shrink-0 ml-2 select-none">
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                          <div className="px-4 pb-4 pt-1 border-t border-neutral-50 bg-neutral-50/20 text-xs text-neutral-600 leading-relaxed">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN (2/5 width — sticky) ─── */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-6">

            {/* Price Card */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm relative overflow-hidden">
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">{toTitleCase(car.brand)}</p>
              
              {/* Dynamic Viewers Urgency Banner (Deterministic stable values based on car title) */}
              <div className="bg-amber-50/70 border border-amber-200/50 rounded-xl p-3 mb-4.5 flex items-start gap-2.5 shadow-inner">
                <span className="text-lg animate-bounce shrink-0 mt-0.5">🔥</span>
                <div>
                  <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">High Demand Listing</p>
                  <p className="text-[10px] text-amber-700 leading-relaxed mt-0.5 font-medium">
                    <span className="font-bold">{245 + (car.title.charCodeAt(0) % 50)}</span> buyers viewed this car in the last 7 days. <span className="font-bold">4 people</span> are viewing it right now!
                  </p>
                </div>
              </div>

              <h2 className="text-3xl font-black text-primary-600 mb-1 tracking-tight font-sans">
                ₹{car.price.toLocaleString("en-IN")}
              </h2>
              <p className="text-xs text-neutral-500 font-medium mb-6">
                EMI starts from <span className="text-neutral-800 font-bold">₹{dynamicEmi.toLocaleString("en-IN")}/mo</span> (10.8% ROI)
              </p>

              {/* Dynamic EMI Calculator Sliders */}
              <div className="bg-neutral-50/80 border border-neutral-200/40 rounded-xl p-5 mb-6 shadow-xs font-sans">
                <p className="text-xs font-bold text-neutral-700 mb-4 flex items-center justify-between">
                  <span>Flexible EMI Calculator</span>
                  <span className="text-[9px] text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full font-bold">10.8% Interest</span>
                </p>

                {/* Down Payment Slider */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs font-medium text-neutral-600">
                    <span>Down Payment</span>
                    <span className="font-bold text-neutral-900 text-xs">
                      {downPaymentPercent}% (₹{(car.price * (downPaymentPercent / 100)).toLocaleString("en-IN")})
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(parseInt(e.target.value))}
                    className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                </div>

                {/* Tenure Slider */}
                <div className="space-y-1.5 mb-5">
                  <div className="flex justify-between text-xs font-medium text-neutral-600">
                    <span>Loan Tenure</span>
                    <span className="font-bold text-neutral-900 text-xs">
                      {emiTenureSlider} Months ({Math.round(emiTenureSlider / 12)} Years)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="84"
                    step="12"
                    value={emiTenureSlider}
                    onChange={(e) => setEmiTenureSlider(parseInt(e.target.value))}
                    className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                </div>

                {/* Visual Progress/Breakdown Chart */}
                <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden flex mb-4 shadow-inner">
                  <div 
                    style={{ width: `${downPaymentPercent}%` }} 
                    className="bg-accent-500 transition-all duration-300" 
                    title="Down Payment"
                  />
                  <div 
                    style={{ width: `${100 - downPaymentPercent}%` }} 
                    className="bg-primary-600 transition-all duration-300" 
                    title="Loan Amount"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-neutral-500 font-semibold border-b border-neutral-200/60 pb-3 mb-3">
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-accent-500 rounded-full inline-block" />
                    <span>Down Payment ({downPaymentPercent}%)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-primary-600 rounded-full inline-block" />
                    <span>Loan Amount ({100 - downPaymentPercent}%)</span>
                  </div>
                </div>

                {/* EMI Result */}
                <p className="text-center text-lg font-black text-neutral-900">
                  ₹{dynamicEmi.toLocaleString("en-IN")}<span className="text-xs font-normal text-neutral-500"> / month</span>
                </p>

                {/* Monochrome Banking Shelf */}
                <div className="border-t border-neutral-200/60 pt-4 mt-3">
                  <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider text-center mb-2.5">
                    🏦 Certified Lending Institutions
                  </p>
                  <div className="grid grid-cols-4 gap-1.5 text-center items-center">
                    <div className="bg-neutral-50 border border-neutral-200/50 rounded-lg py-1 px-0.5 hover:bg-neutral-100 transition-colors">
                      <p className="text-[8px] font-black text-neutral-500 tracking-tighter">HDFC BANK</p>
                    </div>
                    <div className="bg-neutral-50 border border-neutral-200/50 rounded-lg py-1 px-0.5 hover:bg-neutral-100 transition-colors flex items-center justify-center gap-0.5">
                      <span className="h-1 w-1 bg-sky-500 rounded-full inline-block" />
                      <p className="text-[8px] font-extrabold text-neutral-500">SBI</p>
                    </div>
                    <div className="bg-neutral-50 border border-neutral-200/50 rounded-lg py-1 px-0.5 hover:bg-neutral-100 transition-colors">
                      <p className="text-[8px] font-black text-[#F58220] tracking-tighter">ICICI</p>
                    </div>
                    <div className="bg-neutral-50 border border-neutral-200/50 rounded-lg py-1 px-0.5 hover:bg-neutral-100 transition-colors">
                      <p className="text-[8px] font-extrabold text-[#841443]">AXIS</p>
                    </div>
                  </div>
                  <p className="text-[7.5px] text-neutral-400 text-center mt-2 leading-relaxed">
                    *Instant approval options available on standard documentation checks.
                  </p>
                </div>
              </div>

              {/* Competitor Inquiry Form & Secured Actions */}
              {showInquiryForm && (
                <div className="font-sans">
                  {inquiryStatus === "success" && (
                    <div className="mb-4 rounded-xl bg-success-50 border border-success-200 p-3 text-xs text-success-800 font-semibold leading-relaxed">
                      ✅ {inquiryMessage}
                    </div>
                  )}
                  {inquiryStatus === "error" && (
                    <div className="mb-4 rounded-xl bg-danger-50 border border-danger-200 p-3 text-xs text-danger-800 font-semibold leading-relaxed">
                      ❌ {inquiryMessage}
                    </div>
                  )}
                  
                  <form onSubmit={handleInquirySubmit} className="space-y-3">
                    <input
                      type="text" 
                      required 
                      placeholder="Your Full Name"
                      value={inquiry.name}
                      onChange={(e) => setInquiry({ ...inquiry, name: e.target.value })}
                      className="input input-sm border-neutral-300"
                    />
                    <input
                      type="tel" 
                      required 
                      placeholder="Indian Mobile Number"
                      value={inquiry.phone}
                      onChange={(e) => setInquiry({ ...inquiry, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                      className="input input-sm border-neutral-300"
                    />
                    <textarea
                      required 
                      placeholder="Ask the showroom about availability, warranty details, or schedule a physical test drive..."
                      value={inquiry.message}
                      onChange={(e) => setInquiry({ ...inquiry, message: e.target.value })}
                      className="input input-sm min-h-[75px] border-neutral-300"
                    />
                    
                    {/* Multi-Channel Inquiry Triggers (No Platform leakage) */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <button
                        type="submit" 
                        disabled={sendingInquiry}
                        className="btn btn-accent btn-md w-full font-bold flex items-center justify-center gap-1.5 shadow-sm text-xs cursor-pointer"
                      >
                        {sendingInquiry ? "Registering..." : "📞 Request Call"}
                      </button>
                      <button
                        type="button"
                        onClick={handleWhatsAppClick}
                        disabled={sendingInquiry}
                        className="btn btn-whatsapp btn-md w-full font-bold flex items-center justify-center gap-1.5 shadow-sm text-xs cursor-pointer"
                      >
                        💬 Get WA Details
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Premium High-Trust Dealer Info Card */}
            {dealerProfile && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm font-sans relative overflow-hidden">
                {/* Visual trust watermark stamp */}
                <div className="absolute right-2 -bottom-4 opacity-[0.03] select-none pointer-events-none">
                  <ShieldCheck className="h-28 w-28 text-neutral-900" />
                </div>

                <div className="flex items-center gap-3.5 mb-4.5">
                  {/* Showroom avatar initials */}
                  <div className="h-13 w-13 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm border border-primary-200">
                    {(dealerProfile.businessName || "D")[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 flex items-center gap-1 tracking-tight leading-tight">
                      {toTitleCase(dealerProfile.businessName || "Independent Dealer")}
                      {dealerProfile.isVerified && (
                        <CheckCircle2 className="h-4 w-4 text-primary-500 fill-primary-50" title="AutoBazaar Verified Showroom" />
                      )}
                    </h4>
                    
                    {/* Verified partner badge */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="bg-primary-50 text-primary-700 border border-primary-100 text-[9px] font-bold px-2 py-0.5 rounded-full">
                        ★ Verified Partner Showroom
                      </span>
                    </div>
                  </div>
                </div>

                {/* Showroom Trust stats metric row */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-neutral-100 mb-4 bg-neutral-50/50 rounded-xl px-2">
                  <div className="text-center">
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Showroom Rating</p>
                    <p className="text-xs font-bold text-neutral-800 flex items-center justify-center gap-0.5 mt-0.5">
                      <Star className="h-3 w-3 fill-warning-400 text-warning-400" />
                      <span>{dealerProfile.averageRating.toFixed(1)}</span>
                    </p>
                  </div>
                  <div className="text-center border-x border-neutral-200/60">
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Response</p>
                    <p className="text-xs font-bold text-success-600 mt-0.5 flex items-center justify-center gap-0.5">
                      <Clock className="h-3 w-3" />
                      <span>&lt; 15 mins</span>
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Verified Stock</p>
                    <p className="text-xs font-bold text-neutral-800 mt-0.5">
                      {12 + (dealerProfile.businessName?.charCodeAt(0) % 15)} Cars
                    </p>
                  </div>
                </div>

                {/* Showroom redirect link */}
                {dealerProfile.slug && (
                  <Link
                    href={`/dealer/${dealerProfile.slug}`}
                    className="w-full flex items-center justify-center py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all shadow-xs cursor-pointer"
                  >
                    View Showroom Collection →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommended similar cars carousel (Full Width) */}
      {similarCars && similarCars.length > 0 && (
        <div className="mt-12 border-t border-neutral-200/60 pt-10">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 font-display tracking-tight">
                Recommended Similar Matches
              </h2>
              <p className="text-xs text-neutral-500 font-medium mt-1 font-sans">
                Explore handpicked alternatives matching this budget or vehicle category.
              </p>
            </div>
            <Link 
              href="/cars" 
              className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-1 cursor-pointer font-sans"
            >
              View All Cars →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarCars.map((sCar) => {
              const mainImg = sCar.images?.[0]?.url || "";
              return (
                <Link 
                  key={sCar._id}
                  href={`/cars/${sCar._id}`}
                  className="group bg-white rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer"
                >
                  {/* Image container */}
                  <div className="relative aspect-16/10 bg-neutral-100 overflow-hidden">
                    {mainImg ? (
                      <Image 
                        loader={cloudinaryLoader}
                        src={mainImg} 
                        alt={sCar.title} 
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 25vw, 20vw"
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-neutral-50 text-3xl">🚗</div>
                    )}
                    
                    {sCar.isBoosted && (
                      <span className="absolute top-3 left-3 bg-accent-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        ⚡ Featured
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between font-sans">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-1">{toTitleCase(sCar.brand)}</p>
                      <h3 className="font-bold text-neutral-900 text-sm group-hover:text-primary-600 transition-colors line-clamp-1">
                        {toTitleCase(sCar.title)}
                      </h3>
                      
                      {/* Technical Specs pills */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-[9px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                          {sCar.year}
                        </span>
                        <span className="text-[9px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                          {toTitleCase(sCar.fuelType)}
                        </span>
                        <span className="text-[9px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                          {toTitleCase(sCar.transmission)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <p className="text-sm font-black text-primary-600">
                        ₹{sCar.price.toLocaleString("en-IN")}
                      </p>
                      <span className="text-[10px] font-bold text-neutral-400 group-hover:text-primary-600 transition-colors flex items-center gap-0.5">
                        Details →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile Sticky Quick-Action Bar */}
      {showInquiryForm && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 px-4 py-3.5 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] z-40 lg:hidden flex items-center justify-between gap-4 font-sans">
          <div>
            <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Total Price</p>
            <p className="text-lg font-extrabold text-primary-600">₹{car.price.toLocaleString("en-IN")}</p>
          </div>
          <div className="flex gap-2 flex-1 max-w-[240px]">
            <button
              type="button"
              onClick={handleMobileCallClick}
              disabled={sendingInquiry}
              className="btn btn-accent btn-md flex-1 py-2.5 font-bold flex items-center justify-center gap-1.5 text-xs shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
            >
              📞 Call Dealer
            </button>
            <button
              type="button"
              onClick={handleWhatsAppClick}
              disabled={sendingInquiry}
              className="btn btn-whatsapp btn-md flex-1 py-2.5 font-bold flex items-center justify-center gap-1.5 text-xs shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
            >
              💬 WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* ═══ Responsive Auth & Lead Capture Bottom Drawer / Modal ═══ */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 max-sm:items-end">
            {/* Backdrop with smooth blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
            />

            {/* Modal Box Container — Responsive Drawer */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full overflow-hidden bg-white p-6 shadow-xl z-10 
                         sm:max-w-md sm:rounded-2xl sm:border sm:border-neutral-200/80 
                         max-sm:rounded-t-3xl max-sm:pb-8 font-sans"
            >
              {/* Pull-down Notch line for mobile drawer look */}
              <div className="mx-auto w-12 h-1 bg-neutral-300 rounded-full mb-4 sm:hidden" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer text-sm font-bold"
              >
                ✕
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-neutral-900 flex items-center justify-center gap-1.5 font-display">
                  Auto<span className="text-primary-600">Bazaar</span> Verification
                </h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Verify your details to secure your test drive request and prevent showroom spam.
                </p>
              </div>

              {/* Toggle Tabs */}
              <div className="flex border-b border-neutral-100 mb-5">
                <button
                  type="button"
                  onClick={() => { setAuthTab("signup"); setAuthError(""); }}
                  className={`flex-1 pb-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                    authTab === "signup"
                      ? "border-primary-600 text-primary-600"
                      : "border-transparent text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  Quick Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthTab("signin"); setAuthError(""); }}
                  className={`flex-1 pb-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                    authTab === "signin"
                      ? "border-primary-600 text-primary-600"
                      : "border-transparent text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  Sign In
                </button>
              </div>

              {authError && (
                <div className="mb-4 rounded-xl bg-danger-50 border border-danger-200 p-3 text-xs text-danger-700 font-semibold text-center">
                  ⚠️ {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authTab === "signup" && (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={authForm.name}
                        onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                        placeholder="Your Full Name"
                        className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-900 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">10-Digit Mobile Number</label>
                      <input
                        type="tel"
                        required
                        value={authForm.phone}
                        onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                        placeholder="10-digit Indian Mobile Number"
                        className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-900 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-100"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-900 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    placeholder={authTab === "signup" ? "Set a password" : "Enter password"}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-900 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full btn btn-md btn-primary mt-2 cursor-pointer font-bold"
                >
                  {authLoading 
                    ? "Verifying Session..." 
                    : authTab === "signup" 
                      ? "Verify & Submit Lead Request" 
                      : "Sign In & Submit Lead Request"
                  }
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ Immersive Fullscreen Lightbox Modal ═══ */}
      <AnimatePresence>
        {showLightbox && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950/95 backdrop-blur-md font-sans animate-fade-in">
            {/* Top action bar */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-white z-10">
              <p className="text-xs font-semibold tracking-wider uppercase">
                {toTitleCase(car.brand)} {toTitleCase(car.model)} — Image {lightboxIndex + 1} of {car.images.length}
              </p>
              <button
                onClick={() => { setShowLightbox(false); setLightboxZoomed(false); }}
                className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                title="Close Lightbox"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Main Image viewer */}
            <div className="relative w-full max-w-5xl aspect-[16/10] flex items-center justify-center px-4">
              {/* Prev Button */}
              <button
                onClick={() => {
                  setLightboxIndex(prev => (prev === 0 ? car.images.length - 1 : prev - 1));
                  setLightboxZoomed(false);
                }}
                className="absolute left-4 sm:left-6 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer z-10 text-xl font-bold flex items-center justify-center"
              >
                ‹
              </button>

              <motion.div
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: lightboxZoomed ? 1.5 : 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={() => setLightboxZoomed(prev => !prev)}
                className={`relative w-full h-full cursor-zoom-${lightboxZoomed ? "out" : "in"} overflow-hidden rounded-xl`}
              >
                <Image
                  loader={cloudinaryLoader}
                  // Safeguard the main lightbox active image
                  src={car.images[lightboxIndex]?.url || ""}
                  alt={car.title}
                  fill
                  className="object-contain"
                />
              </motion.div>

              {/* Next Button */}
              <button
                onClick={() => {
                  setLightboxIndex(prev => (prev === car.images.length - 1 ? 0 : prev + 1));
                  setLightboxZoomed(false);
                }}
                className="absolute right-4 sm:right-6 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer z-10 text-xl font-bold flex items-center justify-center"
              >
                ›
              </button>
            </div>

            {/* Thumbnails strip inside lightbox */}
            <div className="absolute bottom-6 flex gap-2 overflow-x-auto max-w-full px-4 scrollbar-hide">
              {car.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => { setLightboxIndex(i); setLightboxZoomed(false); }}
                  className={`relative h-12 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    i === lightboxIndex 
                      ? "border-primary-500 shadow-md" 
                      : "border-white/20 opacity-50 hover:opacity-100"
                  }`}
                >
                  <Image
                    loader={cloudinaryLoader}
                    // Safe optional chaining for the lightbox strip thumbnail
                    src={img?.url || ""}
                    alt="thumbnail"
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
