"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Landmark,
  Search,
  Phone,
  Car,
  Download,
  Calendar,
  IndianRupee,
  Briefcase,
  CheckCircle2,
} from "lucide-react";

export interface AdminLoanLead {
  id: string;
  name: string;
  phone: string;
  city: string;
  employmentType: string;
  monthlyIncome: number;
  loanAmountRequested: number;
  status: string;
  notes: string;
  createdAt: string;
  carId: string | null;
  carTitle: string | null;
  carBrand: string | null;
  carPrice: number | null;
  userEmail: string | null;
}

interface AdminLoansTabProps {
  loans: AdminLoanLead[];
  loading: boolean;
  onRefresh?: () => void;
}

export default function AdminLoansTab({
  loans: initialLoans,
  loading,
  onRefresh,
}: AdminLoansTabProps) {
  const [loansList, setLoansList] = useState<AdminLoanLead[]>(initialLoans);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Keep state synced with props
  useState(() => {
    setLoansList(initialLoans);
  });

  const filteredLoans = loansList.filter((item) => {
    const term = search.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(term) ||
      item.phone.toLowerCase().includes(term) ||
      item.city.toLowerCase().includes(term) ||
      (item.carTitle && item.carTitle.toLowerCase().includes(term));
    const matchesStatus =
      statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  async function handleStatusChange(loanId: string, newStatus: string) {
    setUpdatingId(loanId);
    try {
      const res = await fetch("/api/admin/loans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: loanId, status: newStatus }),
      });
      if (res.ok) {
        setLoansList((prev) =>
          prev.map((l) => (l.id === loanId ? { ...l, status: newStatus } : l))
        );
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error("Failed to update loan status:", err);
    } finally {
      setUpdatingId(null);
    }
  }

  function exportToCSV() {
    if (loansList.length === 0) return;
    const headers = [
      "ID",
      "Customer Name",
      "Phone",
      "City",
      "Employment Type",
      "Monthly Income",
      "Loan Requested",
      "Car",
      "Status",
      "Notes",
      "Date",
    ];
    const rows = filteredLoans.map((l) => [
      l.id,
      `"${l.name.replace(/"/g, '""')}"`,
      l.phone,
      l.city,
      l.employmentType,
      l.monthlyIncome,
      l.loanAmountRequested,
      `"${(l.carTitle || "").replace(/"/g, '""')}"`,
      l.status,
      `"${(l.notes || "").replace(/"/g, '""')}"`,
      new Date(l.createdAt).toISOString().slice(0, 10),
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `KarBik_Loan_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-subtle" />
          <input
            type="text"
            placeholder="Search loan leads by customer, phone, car, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-alt/60 border border-border rounded-xl text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select py-2 text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="in_process">In Process</option>
            <option value="approved">Approved</option>
            <option value="disbursed">Disbursed (Paid)</option>
            <option value="rejected">Rejected</option>
          </select>

          <button
            type="button"
            onClick={exportToCSV}
            className="btn btn-outline btn-sm text-xs font-bold gap-1.5"
            title="Download CSV for DSA/Bank Upload"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-surface rounded-2xl border border-border">
          <div className="h-7 w-7 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
        </div>
      ) : filteredLoans.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl border border-border">
          <Landmark className="h-10 w-10 text-ink-subtle mx-auto mb-3" />
          <p className="text-sm font-semibold text-ink-strong">No finance applications found</p>
          <p className="text-xs text-ink-muted mt-1">
            Applications submitted via the car detail EMI calculator will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-alt/40 text-xs font-bold text-ink-subtle uppercase tracking-wider select-none">
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Profile & Income</th>
                  <th className="py-3 px-4">Car & Loan Requested</th>
                  <th className="py-3 px-4 text-center">Pipeline Status</th>
                  <th className="py-3 px-4 text-right">Applied Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLoans.map((loan) => {
                  const dateFormatted = new Date(loan.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <tr key={loan.id} className="hover:bg-surface-alt/40 transition-colors">
                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-bold text-ink-strong block">{loan.name}</span>
                          <span className="text-xs text-primary-600 font-medium inline-flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3" /> {loan.phone}
                          </span>
                          <span className="block text-xs text-ink-subtle mt-0.5">
                            City: {loan.city}
                          </span>
                        </div>
                      </td>

                      {/* Employment & Income */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs">
                          <span className="inline-flex items-center gap-1 font-semibold text-ink capitalize">
                            <Briefcase className="h-3 w-3 text-ink-subtle" />
                            {loan.employmentType.replace(/_/g, " ")}
                          </span>
                          <span className="block text-ink-muted mt-0.5">
                            Income: ₹{loan.monthlyIncome.toLocaleString("en-IN")}/mo
                          </span>
                        </div>
                      </td>

                      {/* Car & Loan */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs">
                          <span className="font-bold text-success-700 block">
                            ₹{(loan.loanAmountRequested / 100000).toFixed(1)} Lakh Loan
                          </span>
                          {loan.carId ? (
                            <Link
                              href={`/cars/${loan.carId}`}
                              target="_blank"
                              className="text-primary-600 hover:underline inline-flex items-center gap-1 mt-0.5"
                            >
                              <Car className="h-3 w-3" />
                              {loan.carTitle || "View Car"}
                            </Link>
                          ) : (
                            <span className="text-ink-subtle italic">Pre-approval enquiry</span>
                          )}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 text-center">
                        <select
                          value={loan.status}
                          disabled={updatingId === loan.id}
                          onChange={(e) => handleStatusChange(loan.id, e.target.value)}
                          className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border cursor-pointer ${
                            loan.status === "disbursed"
                              ? "bg-success-50 text-success-700 border-success-200"
                              : loan.status === "approved"
                              ? "bg-primary-50 text-primary-700 border-primary-200"
                              : loan.status === "rejected"
                              ? "bg-danger-50 text-danger-700 border-danger-200"
                              : "bg-warning-50 text-warning-700 border-warning-200"
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="in_process">In Process</option>
                          <option value="approved">Approved</option>
                          <option value="disbursed">Disbursed (Commission Due)</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-xs text-ink-muted inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {dateFormatted}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

