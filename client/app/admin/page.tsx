"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSession } from "@/lib/auth-client";
import { useToast } from "@/components/ToastProvider";
import { RefreshCw } from "lucide-react";
import AdminDealersTab, { type AdminDealer } from "./AdminDealersTab";
import AdminActivityTab, { type AuditEntry } from "./AdminActivityTab";
import AdminCarsTab, { type AdminCar } from "./AdminCarsTab";
import AdminInquiriesTab, { leadState, type AdminInquiry } from "./AdminInquiriesTab";
import AdminLoansTab, { type AdminLoanLead } from "./AdminLoansTab";

type TabKey = "inquiries" | "dealers" | "cars" | "loans" | "activity";

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

  const [activeTab, setActiveTab] = useState<TabKey>("inquiries");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [dealers, setDealers] = useState<AdminDealer[]>([]);
  const [cars, setCars] = useState<AdminCar[]>([]);
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
  const [loans, setLoans] = useState<AdminLoanLead[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [auditReady, setAuditReady] = useState<boolean | null>(null);
  const [loadingAudit, setLoadingAudit] = useState(false);

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

  const fetchAudit = useCallback(async () => {
    try {
      setLoadingAudit(true);
      const res = await fetch("/api/admin/audit", { credentials: "include" });
      if (res.ok) {
        const data = (await res.json()) as { ready?: boolean; entries?: AuditEntry[] };
        setAuditReady(Boolean(data.ready));
        setAudit(data.entries || []);
      }
    } catch (err) {
      console.error("Failed to load the audit log:", err);
    } finally {
      setLoadingAudit(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.role === "admin") {
      void fetchStats();
      void fetchDealers();
      void fetchCars();
      void fetchInquiries();
      void fetchLoans();
      void fetchAudit();
    }
  }, [session, fetchStats, fetchDealers, fetchCars, fetchInquiries, fetchLoans, fetchAudit]);

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
          data.dealer.isVerified ? "Dealer verified." : "Verification removed.",
          "success"
        );
      } else {
        addToast("Could not update the dealer. Try again.", "error");
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
          addToast(nowBoosted ? "Car is now Featured." : "Featured removed.", "success");
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
        addToast("Listing approved. It is now on the site.", "success");
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
        addToast(!currentVerified ? "RC Verified on." : "RC Verified off.", "success");
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
        addToast("Listing removed from the site. Its lead history is kept.", "success");
      } else {
        addToast("Failed to delete car listing.", "error");
      }
    } catch {
      addToast("Network error deleting vehicle.", "error");
    }
  };

  const selectTab = (key: TabKey) => {
    setActiveTab(key);
    // The log changes with every admin action, so it is read fresh when its tab is opened.
    if (key === "activity") void fetchAudit();
  };

  const refreshAll = () => {
    void fetchStats();
    if (activeTab === "dealers") void fetchDealers();
    if (activeTab === "cars") void fetchCars();
    if (activeTab === "inquiries") void fetchInquiries();
    if (activeTab === "loans") void fetchLoans();
    if (activeTab === "activity") void fetchAudit();
    addToast("Refreshed.", "success");
  };

  // ─── Auth Protection Gate ───
  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-surface">
        <p role="status" className="text-sm text-ink-muted">
          Checking your access…
        </p>
      </div>
    );
  }

  if (!session || session.user.role !== "admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-surface px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink-strong">Admins only</h1>
          <p className="mt-2 text-base text-ink-muted">This page is for KarBik administrators.</p>
          <Link href="/login?next=/admin" className="btn btn-primary btn-md mt-6">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const needsCall = inquiries.filter((i) => leadState(i) === "needs").length;

  const TABS: { key: TabKey; label: string; count: number | null }[] = [
    { key: "inquiries", label: "Leads", count: needsCall },
    { key: "dealers", label: "Dealers", count: dealers.length },
    { key: "cars", label: "Cars", count: cars.length },
    { key: "loans", label: "Loan leads", count: loans.length },
    { key: "activity", label: "Activity", count: null },
  ];

  const stat = (n: number | undefined) => (loadingStats ? "…" : (n ?? 0));

  return (
    <div className="min-h-screen bg-surface pb-20">
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 sm:pt-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-ink-strong sm:text-5xl">Admin</h1>
            <p className="mt-1 text-sm text-ink-muted">Signed in as {session.user.email}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={refreshAll}
              aria-label="Refresh"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-ink-muted hover:bg-surface-alt"
            >
              <RefreshCw className="h-5 w-5" aria-hidden />
            </button>
            <Link
              href="/cars"
              target="_blank"
              className="inline-flex min-h-11 items-center whitespace-nowrap px-2 text-sm font-semibold text-primary-600 underline underline-offset-2"
            >
              Public site
            </Link>
          </div>
        </div>

        <p className="mt-4 text-sm text-ink-muted tabular-nums">
          {needsCall} {needsCall === 1 ? "lead needs" : "leads need"} a call · {stat(stats?.totalDealers)} dealers (
          {stat(stats?.verifiedDealers)} verified) · {stat(stats?.totalCars)} cars · {stat(stats?.totalUsers)} accounts
        </p>

        <div
          role="tablist"
          aria-label="Admin sections"
          className="-mx-4 mt-6 flex overflow-x-auto border-b border-border px-4 scrollbar-hide sm:mx-0 sm:gap-1 sm:px-0"
          onKeyDown={(e) => {
            const keys = TABS.map((t) => t.key);
            const i = keys.indexOf(activeTab);
            let next = -1;
            if (e.key === "ArrowRight") next = (i + 1) % keys.length;
            else if (e.key === "ArrowLeft") next = (i - 1 + keys.length) % keys.length;
            else if (e.key === "Home") next = 0;
            else if (e.key === "End") next = keys.length - 1;
            if (next < 0) return;
            e.preventDefault();
            selectTab(keys[next]);
            document.getElementById(`tab-${keys[next]}`)?.focus();
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              id={`tab-${t.key}`}
              role="tab"
              type="button"
              aria-selected={activeTab === t.key}
              aria-controls={activeTab === t.key ? `panel-${t.key}` : undefined}
              tabIndex={activeTab === t.key ? 0 : -1}
              onClick={() => selectTab(t.key)}
              className={`-mb-px h-12 shrink-0 cursor-pointer whitespace-nowrap border-b-2 px-3 text-sm font-semibold tabular-nums sm:px-4 ${
                activeTab === t.key
                  ? "border-primary-600 text-ink-strong"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              {t.label}
              {t.count !== null ? ` ${t.count}` : ""}
            </button>
          ))}
        </div>

        <div
          id={`panel-${activeTab}`}
          role="tabpanel"
          tabIndex={-1}
          aria-labelledby={`tab-${activeTab}`}
          className="mt-5 outline-none"
        >
          {activeTab === "inquiries" && (
            <AdminInquiriesTab inquiries={inquiries} loading={loadingInquiries} onRefresh={fetchInquiries} />
          )}

          {activeTab === "dealers" && (
            <AdminDealersTab
              dealers={dealers}
              loading={loadingDealers}
              onToggleVerify={handleToggleDealerVerify}
              onChanged={() => {
                void fetchDealers();
                void fetchAudit();
              }}
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

          {activeTab === "loans" && <AdminLoansTab loans={loans} loading={loadingLoans} onRefresh={fetchLoans} />}

          {activeTab === "activity" && <AdminActivityTab entries={audit} ready={auditReady} loading={loadingAudit} />}
        </div>
      </div>
    </div>
  );
}
