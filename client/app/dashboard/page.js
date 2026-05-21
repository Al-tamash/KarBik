"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/components/ToastProvider";
import {
  Menu, X, Car,
  TrendingUp, Award, LogOut, Users, Calendar, Settings,
  CircleHelp, CirclePlus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BoostModal from "@/components/BoostModal";
import ListingsTab from "./ListingsTab";
import InquiriesTab from "./InquiriesTab";
import AnalyticsTab from "./AnalyticsTab";
import ProfileTab from "./ProfileTab";
import BuyerDashboard from "./BuyerDashboard";
import ScheduleTab from "./ScheduleTab";

const API = process.env.NEXT_PUBLIC_API_URL;

const CRM_STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "interested", label: "Interested" },
  { value: "test_drive", label: "Test Drive" },
  { value: "closed", label: "Closed" },
  { value: "lost", label: "Lost" },
  { value: "fake", label: "Fake Lead" },
];

const CRM_PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { data: session, isPending } = authClient.useSession();

  const [cars, setCars] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loadingCars, setLoadingCars] = useState(false);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [activeTab, setActiveTab] = useState("inventory");
  const [selectedBoostCar, setSelectedBoostCar] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [dealerProfile, setDealerProfile] = useState(null);
  const [businessName, setBusinessName] = useState("");
  const [verificationDoc, setVerificationDoc] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [profileSlug, setProfileSlug] = useState("");
  const [profileAbout, setProfileAbout] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profileCity, setProfileCity] = useState("");
  const [profileSocial, setProfileSocial] = useState({ whatsapp: "", instagram: "", facebook: "" });
  const [bannerFile, setBannerFile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [slugStatus, setSlugStatus] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [isPending, session, router]);

  useEffect(() => {
    if (session?.user?.role === "dealer") {
      fetchMyCars();
      fetchMyInquiries();
      fetchAnalytics();
      fetchDealerProfile();
    } else if (session?.user?.role === "buyer" || (session && !session.user.role)) {
      fetchSentInquiries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function fetchDealerProfile() {
    try {
      const res = await fetch(`${API}/api/trust/profile/${session.user.id}`);
      if (res.ok) {
        const data = await res.json();
        setDealerProfile(data);
        if (data.businessName) setBusinessName(data.businessName);
        if (data.slug) setProfileSlug(data.slug);
        if (data.about) setProfileAbout(data.about);
        if (data.phone) setProfilePhone(data.phone);
        if (data.address) setProfileAddress(data.address);
        if (data.city) setProfileCity(data.city);
        if (data.socialLinks) setProfileSocial({
          whatsapp: data.socialLinks.whatsapp || "",
          instagram: data.socialLinks.instagram || "",
          facebook: data.socialLinks.facebook || "",
        });
      }
    } catch (err) { console.error("Error fetching dealer profile:", err); }
  }

  async function handleVerificationSubmit(e) {
    e.preventDefault();
    setUploadingDoc(true);
    try {
      const formData = new FormData();
      if (businessName) formData.append("businessName", businessName);
      if (verificationDoc) formData.append("verificationDoc", verificationDoc);

      const res = await fetch(`${API}/api/trust/verify`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (res.ok) {
        addToast("Verification submitted successfully.", "success");
        fetchDealerProfile();
      } else {
        addToast("Failed to submit verification.", "error");
      }
    } catch (err) {
      addToast("Network error. Please try again.", "error");
    }
    setUploadingDoc(false);
  }

  async function handleMicroWebsiteSave(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const formData = new FormData();
      if (profileSlug) formData.append("slug", profileSlug);
      formData.append("about", profileAbout);
      formData.append("phone", profilePhone);
      formData.append("address", profileAddress);
      formData.append("city", profileCity);
      formData.append("socialLinks", JSON.stringify(profileSocial));
      if (bannerFile) formData.append("bannerImage", bannerFile);

      const res = await fetch(`${API}/api/dealers/profile`, {
        method: "PATCH",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        addToast("Micro-website updated.", "success");
        fetchDealerProfile();
      } else {
        addToast(data.message || "Failed to save profile.", "error");
      }
    } catch (err) {
      addToast("Network error. Please try again.", "error");
    }
    setSavingProfile(false);
  }

  async function checkSlug(value) {
    const slug = value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    setProfileSlug(slug);
    setSlugStatus("");
    if (slug.length < 3) return;
    try {
      const res = await fetch(`${API}/api/dealers/check-slug/${slug}?userId=${session.user.id}`);
      const data = await res.json();
      setSlugStatus(data.available ? "available" : "taken");
    } catch (err) { setSlugStatus(""); }
  }

  async function fetchAnalytics() {
    setLoadingAnalytics(true);
    try {
      const res = await fetch(`${API}/api/analytics/dashboard`, { credentials: "include" });
      if (res.ok) setAnalyticsData(await res.json());
    } catch (err) { console.error("Error fetching analytics:", err); }
    setLoadingAnalytics(false);
  }

  async function fetchMyCars() {
    setLoadingCars(true);
    try {
      const res = await fetch(`${API}/api/cars/mine`, { credentials: "include" });
      setCars(await res.json());
    } catch (err) { console.error("Error fetching cars:", err); }
    setLoadingCars(false);
  }

  async function fetchMyInquiries() {
    setLoadingInquiries(true);
    try {
      const res = await fetch(`${API}/api/inquiries/mine`, { credentials: "include" });
      setInquiries(await res.json());
    } catch (err) { console.error("Error fetching inquiries:", err); }
    setLoadingInquiries(false);
  }

  async function fetchSentInquiries() {
    setLoadingInquiries(true);
    try {
      const res = await fetch(`${API}/api/inquiries/sent`, { credentials: "include" });
      setInquiries(await res.json());
    } catch (err) { console.error("Error fetching sent inquiries:", err); }
    setLoadingInquiries(false);
  }

  async function handleDelete(carId) {
    if (!confirm("Delete this listing?")) return;
    try {
      const res = await fetch(`${API}/api/cars/${carId}`, {
        method: "DELETE", credentials: "include",
      });
      if (res.ok) {
        setCars((prev) => prev.filter((c) => c._id !== carId));
        addToast("Listing deleted.", "success");
      }
    } catch (err) { console.error("Error deleting car:", err); }
  }

  function handleBoostSuccess() {
    setSelectedBoostCar(null);
    addToast("Listing boosted.", "success");
    fetchMyCars();
  }

  function updateInquiryLocal(updatedInquiry) {
    setInquiries((prev) => prev.map((inq) => (
      inq._id === updatedInquiry._id ? updatedInquiry : inq
    )));
  }

  async function patchInquiry(inquiryId, path, body = {}) {
    const res = await fetch(`${API}/api/inquiries/${inquiryId}/${path}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Failed to update inquiry");
    }

    const updatedInquiry = await res.json();
    updateInquiryLocal(updatedInquiry);
    return updatedInquiry;
  }

  const handleInquiryStatusChange = useCallback(async (inquiryId, status) => {
    try {
      await patchInquiry(inquiryId, "status", { status });
    } catch (err) { addToast(err.message, "error"); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addToast]);

  const handleInquiryPriorityChange = useCallback(async (inquiryId, priority) => {
    const inquiry = inquiries.find((inq) => inq._id === inquiryId);
    try {
      await patchInquiry(inquiryId, "status", {
        status: inquiry?.status || "new",
        priority,
      });
    } catch (err) { addToast(err.message, "error"); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inquiries, addToast]);

  const handleInquiryNotesSave = useCallback(async (inquiryId, notes) => {
    try {
      await patchInquiry(inquiryId, "notes", { notes });
    } catch (err) { addToast(err.message, "error"); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addToast]);

  const handleInquiryFollowUpChange = useCallback(async (inquiryId, followUpAt) => {
    try {
      await patchInquiry(inquiryId, "follow-up", { followUpAt: followUpAt || null });
    } catch (err) { addToast(err.message, "error"); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addToast]);

  function normalizeWhatsAppPhone(phone) {
    const digits = String(phone || "").replace(/\D/g, "");
    if (digits.length === 10) return `91${digits}`;
    if (digits.length === 12 && digits.startsWith("91")) return digits;
    return digits;
  }

  function getWhatsAppHref(inquiry) {
    const phone = normalizeWhatsAppPhone(inquiry.phone);
    if (!/^91[6-9]\d{9}$/.test(phone)) return null;
    const carTitle = inquiry.car?.title || "your car inquiry";
    const message = `Hi ${inquiry.name}, thanks for your inquiry on AutoBazaar about ${carTitle}. Is this car still of interest to you?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  async function handleWhatsAppClick(e, inquiry) {
    if (!getWhatsAppHref(inquiry)) {
      e.preventDefault();
      addToast("No valid phone number for this inquiry.", "error");
      return;
    }
    try {
      await patchInquiry(inquiry._id, "whatsapp");
    } catch (err) { console.error(err); }
  }

  async function handleMarkSpam(inquiryId) {
    try {
      await patchInquiry(inquiryId, "status", { status: "fake" });
      addToast("Lead marked as spam.", "info");
    } catch (err) { addToast(err.message, "error"); }
  }

  function dateInputValue(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().slice(0, 10);
  }

  async function handleLogout() {
    if (confirm("Log out?")) {
      await authClient.signOut();
      router.push("/login");
    }
  }

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
          <p className="text-sm text-neutral-500">Loading...</p>
        </div>
      </div>
    );
  }

  const isDealer = session.user.role === "dealer";

  const sidebarLinks = isDealer ? [
    { id: "inventory", label: "Inventory", icon: Car },
    { id: "leads", label: "Leads", icon: Users },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "profile", label: "Profile", icon: Award },
  ] : [];

  return (
    <div className="min-h-screen bg-neutral-50 font-sans flex antialiased">

      {/* ─── Sidebar (desktop) ─── */}
      {isDealer && (
        <aside className="hidden lg:flex wizard-sidebar">
          <div>
            {/* Dealer info */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-primary-900">
                {dealerProfile?.businessName || session.user.name}
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                {dealerProfile?.isVerified ? "Premium Verified Partner" : "Dealer"}
              </p>
            </div>

            {/* Add New Car button */}
            <Link
              href="/dashboard/new"
              className="wizard-add-btn mb-6"
            >
              <CirclePlus className="w-4 h-4" /> Add New Car
            </Link>

            {/* Navigation */}
            <nav className="space-y-1">
              {sidebarLinks.map((link) => {
                const IconComponent = link.icon;
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => setActiveTab(link.id)}
                    className={`wizard-nav-item ${
                      isActive ? "wizard-nav-item-active" : "wizard-nav-item-inactive"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {link.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom: Settings, Support, Log Out */}
          <div className="space-y-1 pt-4 border-t border-primary-100">
            <Link
              href="/dashboard/settings"
              className="wizard-nav-item wizard-nav-item-inactive"
            >
              <Settings className="w-4 h-4" /> Settings
            </Link>
            <Link
              href="/dashboard/support"
              className="wizard-nav-item wizard-nav-item-inactive"
            >
              <CircleHelp className="w-4 h-4" /> Support
            </Link>
            <button
              onClick={handleLogout}
              className="wizard-nav-item text-danger-600 hover:bg-danger-50 hover:text-danger-700"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </div>
        </aside>
      )}

      {/* ─── Mobile header ─── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-200 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary-600 text-white">
              <Car className="w-4.5 h-4.5" />
            </span>
            <span className="font-display font-bold text-lg tracking-tight text-neutral-900">
              AutoBazaar
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-600 text-white font-semibold text-sm flex items-center justify-center">
            {session.user.name ? session.user.name[0].toUpperCase() : "A"}
          </div>
        </div>
      </div>

      {/* ─── Mobile drawer ─── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-primary-50 p-5 shadow-xl flex flex-col justify-between lg:hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-primary-100">
                  <span className="font-display font-bold text-primary-900">Menu</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 rounded-lg text-neutral-400 hover:bg-primary-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Dealer info */}
                <div>
                  <h3 className="text-sm font-bold text-primary-900">
                    {dealerProfile?.businessName || session.user.name}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {dealerProfile?.isVerified ? "Premium Verified Partner" : "Dealer"}
                  </p>
                </div>

                <Link
                  href="/dashboard/new"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="wizard-add-btn"
                >
                  <CirclePlus className="w-4 h-4" /> Add New Car
                </Link>

                {isDealer && (
                  <nav className="space-y-1">
                    {sidebarLinks.map((link) => {
                      const IconComponent = link.icon;
                      const isActive = activeTab === link.id;
                      return (
                        <button
                          key={link.id}
                          onClick={() => {
                            setActiveTab(link.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`wizard-nav-item ${
                            isActive ? "wizard-nav-item-active" : "wizard-nav-item-inactive"
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                          {link.label}
                        </button>
                      );
                    })}
                  </nav>
                )}
              </div>

              <div className="space-y-1 pt-4 border-t border-primary-100">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="wizard-nav-item wizard-nav-item-inactive"
                >
                  <Settings className="w-4 h-4" /> Settings
                </Link>
                <Link
                  href="/dashboard/support"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="wizard-nav-item wizard-nav-item-inactive"
                >
                  <CircleHelp className="w-4 h-4" /> Support
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="wizard-nav-item text-danger-600 hover:bg-danger-50 hover:text-danger-700"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Main content ─── */}
      <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 lg:pt-8 pt-16">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-neutral-900 tracking-tight">
              {isDealer ? "Dashboard" : "My Account"}
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              {isDealer ? `Welcome back, ${session.user.name}` : session.user.name}
            </p>
          </div>
        </div>

        {isDealer ? (
          <>
            {activeTab === "inventory" && (
              <ListingsTab
                cars={cars}
                loadingCars={loadingCars}
                analyticsData={analyticsData}
                inquiries={inquiries}
                onNewListing={() => router.push("/dashboard/new")}
                onEdit={(carId) => router.push(`/dashboard/edit/${carId}`)}
                onDelete={handleDelete}
                onBoost={setSelectedBoostCar}
              />
            )}

            {activeTab === "leads" && (
              <InquiriesTab
                inquiries={inquiries}
                loadingInquiries={loadingInquiries}
                onStatusChange={handleInquiryStatusChange}
                onPriorityChange={handleInquiryPriorityChange}
                onNotesSave={handleInquiryNotesSave}
                onFollowUpChange={handleInquiryFollowUpChange}
                onWhatsAppClick={handleWhatsAppClick}
                onMarkSpam={handleMarkSpam}
              />
            )}

            {activeTab === "analytics" && (
              <AnalyticsTab
                cars={cars}
                inquiries={inquiries}
                analyticsData={analyticsData}
                loadingAnalytics={loadingAnalytics}
              />
            )}

            {activeTab === "schedule" && (
              <ScheduleTab inquiries={inquiries} />
            )}

            {activeTab === "profile" && (
              <ProfileTab
                dealerProfile={dealerProfile}
                businessName={businessName}
                onBusinessNameChange={(e) => setBusinessName(e.target.value)}
                verificationDoc={verificationDoc}
                onVerificationDocChange={(e) => setVerificationDoc(e.target.files?.[0])}
                uploadingDoc={uploadingDoc}
                onVerificationSubmit={handleVerificationSubmit}
                profileSlug={profileSlug}
                onProfileSlugChange={(e) => checkSlug(e.target.value)}
                profileAbout={profileAbout}
                onProfileAboutChange={(e) => setProfileAbout(e.target.value)}
                profilePhone={profilePhone}
                onProfilePhoneChange={(e) => setProfilePhone(e.target.value)}
                profileAddress={profileAddress}
                onProfileAddressChange={(e) => setProfileAddress(e.target.value)}
                profileCity={profileCity}
                onProfileCityChange={(e) => setProfileCity(e.target.value)}
                profileSocial={profileSocial}
                onProfileSocialChange={(platform, value) => setProfileSocial({ ...profileSocial, [platform]: value })}
                bannerFile={bannerFile}
                onBannerFileChange={(e) => setBannerFile(e.target.files?.[0])}
                savingProfile={savingProfile}
                onMicroWebsiteSave={handleMicroWebsiteSave}
                slugStatus={slugStatus}
              />
            )}
          </>
        ) : (
          <BuyerDashboard session={session} inquiries={inquiries} />
        )}
      </main>

      {selectedBoostCar && (
        <BoostModal
          car={selectedBoostCar}
          user={session.user}
          onClose={() => setSelectedBoostCar(null)}
          onBoostSuccess={handleBoostSuccess}
        />
      )}
    </div>
  );
}
