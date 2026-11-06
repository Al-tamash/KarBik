"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSession } from "@/lib/auth-client";
import { useToast } from "@/components/ToastProvider";
import {
  ShieldAlert,
  Building2,
  Car,
  MessageSquare,
  Users,
  CheckCircle2,
  RefreshCw,
  Lock,
  ArrowRight,
  Landmark,
} from "lucide-react";
import AdminDealersTab, { type AdminDealer } from "./AdminDealersTab";
import AdminCarsTab, { type AdminCar } from "./AdminCarsTab";
import AdminInquiriesTab, { type AdminInquiry } from "./AdminInquiriesTab";
import AdminLoansTab, { type AdminLoanLead } from "./AdminLoansTab";

interface AdminStats {
  totalDealers: number;
  verifiedDealers: number;
  totalCars: number;
  rcVerifiedCars: number;
  boostedCars: number;
  totalInquiries: number;
  totalUsers: number;
}

export default function AdminPage() {
  const router = useRouter();
  const { data: session, isPending } = useAppSession();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<"dealers" | "cars" | "inquiries" | "loans">("dealers");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [dealers, setDealers] = useState<AdminDealer[]>([]);
  const [cars, setCars] = useState<AdminCar[]>([]);
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
  const [loans, setLoans] = useState<AdminLoanLead[]>([]);

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingDealers, setLoadingDealers] = useState(false);
  const [loadingCars, setLoadingCars] = useState(false);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [loadingLoans, setLoadingLoans] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to load admin stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchDealers = useCallback(async () => {
    try {
      setLoadingDealers(true);
      const res = await fetch("/api/admin/dealers", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setDealers(data.dealers || []);
      }
    } catch (err) {
      console.error("Failed to load dealers:", err);
    } finally {
      setLoadingDealers(false);
    }
  }, []);

  const fetchCars = useCallback(async () => {
    try {
      setLoadingCars(true);
      const res = await fetch("/api/admin/cars", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setCars(data.cars || []);
      }
    } catch (err) {
      console.error("Failed to load cars:", err);
    } finally {
      setLoadingCars(false);
    }
  }, []);

  const fetchInquiries = useCallback(async () => {
    try {
      setLoadingInquiries(true);
      const res = await fetch("/api/admin/inquiries", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.inquiries || []);
      }
    } catch (err) {
      console.error("Failed to load inquiries:", err);
    } finally {
      setLoadingInquiries(false);
    }
  }, []);

  const fetchLoans = useCallback(async () => {
    try {
      setLoadingLoans(true);
      const res = await fetch("/api/admin/loans", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setLoans(data.loans || []);
      }
    } catch (err) {
      console.error("Failed to load loans:", err);
    } finally {
      setLoadingLoans(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.role === "admin") {
      void fetchStats();
      void fetchDealers();
      void fetchCars();
      void fetchInquiries();
      void fetchLoans();
    }
  }, [session, fetchStats, fetchDealers, fetchCars, fetchInquiries, fetchLoans]);

  // Dealer Verification toggle
  const handleToggleDealerVerify = async (dealerId: string, currentVerified: boolean) => {
    try {
      const res = await fetch(`/api/admin/dealers/${dealerId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isVerified: !currentVerified }),
      });

      if (res.ok) {
        const data = await res.json();
        setDealers((prev) =>
          prev.map((d) => (d.id === dealerId ? { ...d, isVerified: data.dealer.isVerified } : d))
        );
        void fetchStats();
        addToast(
          data.dealer.isVerified ? "Dealership successfully verified!" : "Verification revoked.",
          "success"
        );
      } else {
        addToast("Failed to update dealer verification.", "error");
      }
    } catch {
      addToast("Network error updating verification.", "error");
    }
  };

  // Car Boost toggle
  const handleToggleCarBoost = async (carId: string, currentBoosted: boolean) => {
    try {
      const res = await fetch(`/api/admin/cars/${carId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isBoosted: !currentBoosted }),
      });

      if (res.ok) {
        // Trust the server: a dealer-paid boost can keep the car featured even
        // after the admin's own grant is removed.
        const data = (await res.json()) as { isBoosted?: boolean };
        const nowBoosted = data.isBoosted ?? !currentBoosted;
        setCars((prev) =>
          prev.map((c) => (c.id === carId ? { ...c, isBoosted: nowBoosted } : c))
        );
        void fetchStats();
        if (currentBoosted && nowBoosted) {
          addToast("Admin feature removed. The car stays featured by the dealer's paid boost.", "success");
        } else {
          addToast(nowBoosted ? "Car promoted to Featured!" : "Feature boost removed.", "success");
        }
      } else {
        addToast("Failed to update car boost.", "error");
      }
    } catch {
      addToast("Failed to update car boost.", "error");
    }
  };

  // Release a listing that is waiting beyond an unverified dealer's live quota
  const handleApproveCar = async (carId: string) => {
    try {
      const res = await fetch(`/api/admin/cars/${carId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ approved: true }),
      });
      if (res.ok) {
        setCars((prev) => prev.map((c) => (c.id === carId ? { ...c, pendingApproval: false } : c)));
        addToast("Listing approved and now public.", "success");
      } else {
        addToast("Failed to approve listing.", "error");
      }
    } catch {
      addToast("Network error approving listing.", "error");
    }
  };

  // Car RC Verified toggle
  const handleToggleCarRc = async (carId: string, currentVerified: boolean) => {
    try {
      const res = await fetch(`/api/admin/cars/${carId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rcVerified: !currentVerified }),
      });

      if (res.ok) {
        setCars((prev) =>
          prev.map((c) => (c.id === carId ? { ...c, rcVerified: !currentVerified } : c))
        );
        addToast(!currentVerified ? "Vehicle RC verified!" : "RC verification status removed.", "success");
      }
    } catch {
      addToast("Failed to update RC status.", "error");
    }
  };

  // Delete Car
  const handleDeleteCar = async (carId: string) => {
    try {
      const res = await fetch(`/api/admin/cars/${carId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setCars((prev) => prev.filter((c) => c.id !== carId));
        void fetchStats();
        addToast("Vehicle listing permanently removed.", "success");
      } else {
        addToast("Failed to delete car listing.", "error");
      }
    } catch {
      addToast("Network error deleting vehicle.", "error");
    }
  };

  // ─── Auth Protection Gate ───
  if (isPending) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-ink-muted">Checking administrator access...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "admin") {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-bg px-4 py-12">
        <div className="max-w-md w-full bg-surface rounded-3xl border border-border p-8 text-center shadow-lg">
          <div className="h-16 w-16 rounded-2xl bg-danger-50 text-danger-600 border border-danger-100 flex items-center justify-center mx-auto mb-5">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black text-ink-strong tracking-tight">Super Admin Restricted</h1>
          <p className="text-sm text-ink-muted mt-2 leading-relaxed">
            This portal is strictly reserved for KarBik platform administrators to manage dealers, verify legal papers, and oversee marketplace inventory.
          </p>

          <div className="mt-6 pt-6 border-t border-border space-y-3">
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 transition-colors shadow-sm"
            >
              Sign In as Admin <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg antialiased pb-20">
      {/* Top Header */}
      <header className="border-b border-border bg-surface sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-sm">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black font-display text-ink-strong tracking-tight">
                  Super Admin Portal
                </h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-primary-50 text-primary-700 border border-primary-200">
                  Hyderabad HQ
                </span>
              </div>
              <p className="text-xs text-ink-muted mt-0.5">
                Marketplace control center • Signed in as <strong className="text-ink">{session.user.email}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                void fetchStats();
                if (activeTab === "dealers") void fetchDealers();
                if (activeTab === "cars") void fetchCars();
                if (activeTab === "inquiries") void fetchInquiries();
                if (activeTab === "loans") void fetchLoans();
                addToast("Refreshed platform data.", "success");
              }}
              className="p-2 rounded-xl border border-border text-ink-muted hover:text-ink hover:bg-surface-alt transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <Link
              href="/cars"
              target="_blank"
              className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline px-2 py-1"
            >
              View Public Marketplace →
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Metric Cards Row */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Dealerships */}
          <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-subtle">Dealerships</span>
              <span className="p-2 rounded-xl bg-primary-50 text-primary-600">
                <Building2 className="h-4 w-4" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-ink-strong mt-3 font-display">
              {loadingStats ? "..." : stats?.totalDealers ?? 0}
            </p>
            <p className="text-xs text-ink-muted mt-1 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5 text-success-600" />
              {stats?.verifiedDealers ?? 0} verified showrooms
            </p>
          </div>

          {/* Card 2: Inventory */}
          <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-subtle">Hyderabad Cars</span>
              <span className="p-2 rounded-xl bg-success-50 text-success-600">
                <Car className="h-4 w-4" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-ink-strong mt-3 font-display">
              {loadingStats ? "..." : stats?.totalCars ?? 0}
            </p>
            <p className="text-xs text-ink-muted mt-1 font-semibold">
              {loadingStats ? "..." : stats?.rcVerifiedCars ?? 0} with RC checked
            </p>
          </div>

          {/* Card 3: Inquiries */}
          <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-subtle">Buyer Leads</span>
              <span className="p-2 rounded-xl bg-accent-50 text-accent-600">
                <MessageSquare className="h-4 w-4" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-ink-strong mt-3 font-display">
              {loadingStats ? "..." : stats?.totalInquiries ?? 0}
            </p>
            <p className="text-xs text-ink-muted mt-1 font-semibold">
              Inquiries dispatched to dealers
            </p>
          </div>

          {/* Card 4: Total Users */}
          <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-subtle">Accounts</span>
              <span className="p-2 rounded-xl bg-surface-alt text-ink">
                <Users className="h-4 w-4" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-ink-strong mt-3 font-display">
              {loadingStats ? "..." : stats?.totalUsers ?? 0}
            </p>
            <p className="text-xs text-ink-muted mt-1 font-semibold">
              Buyers & verified dealers
            </p>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-px overflow-x-auto select-none">
            <button
              onClick={() => setActiveTab("dealers")}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "dealers"
                  ? "border-primary-600 text-primary-600 bg-primary-50/30 rounded-t-xl"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              <Building2 className="h-4 w-4" />
              Dealerships Directory
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-surface-alt text-ink border border-border">
                {dealers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("cars")}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "cars"
                  ? "border-primary-600 text-primary-600 bg-primary-50/30 rounded-t-xl"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              <Car className="h-4 w-4" />
              Inventory Moderation
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-surface-alt text-ink border border-border">
                {cars.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("inquiries")}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "inquiries"
                  ? "border-primary-600 text-primary-600 bg-primary-50/30 rounded-t-xl"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Buyer Inquiries & Leads
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-surface-alt text-ink border border-border">
                {inquiries.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("loans")}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "loans"
                  ? "border-primary-600 text-primary-600 bg-primary-50/30 rounded-t-xl"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              <Landmark className="h-4 w-4" />
              Car Finance & Loan Leads
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-success-50 text-success-700 border border-success-200">
                {loans.length}
              </span>
            </button>
          </div>

          {/* Active Tab View */}
          {activeTab === "dealers" && (
            <AdminDealersTab
              dealers={dealers}
              loading={loadingDealers}
              onToggleVerify={handleToggleDealerVerify}
            />
          )}

          {activeTab === "cars" && (
            <AdminCarsTab
              cars={cars}
              loading={loadingCars}
              onToggleBoost={handleToggleCarBoost}
              onToggleRcVerified={handleToggleCarRc}
              onApproveCar={handleApproveCar}
              onDeleteCar={handleDeleteCar}
            />
          )}

          {activeTab === "inquiries" && (
            <AdminInquiriesTab
              inquiries={inquiries}
              loading={loadingInquiries}
              onRefresh={fetchInquiries}
            />
          )}

          {activeTab === "loans" && (
            <AdminLoansTab
              loans={loans}
              loading={loadingLoans}
              onRefresh={fetchLoans}
            />
          )}
        </section>
      </main>
    </div>
  );
}

