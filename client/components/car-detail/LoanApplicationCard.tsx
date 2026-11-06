"use client";

import React, { useState } from "react";
import { Landmark, CheckCircle2, ShieldCheck, ChevronRight, Sparkles } from "lucide-react";
import { useAppSession } from "@/lib/auth-client";
import type { ApiCar } from "@/lib/api-types";

export default function LoanApplicationCard({
  car,
  requestedLoanAmount,
}: {
  car: ApiCar;
  requestedLoanAmount?: number;
}) {
  const { data: session } = useAppSession();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(session?.user?.name || "");
  const [phone, setPhone] = useState(
    (session?.user as { phone?: string })?.phone || ""
  );
  const [city, setCity] = useState(car.city || "Hyderabad");
  const [employmentType, setEmploymentType] = useState<"salaried" | "self_employed">("salaried");
  const [monthlyIncome, setMonthlyIncome] = useState("45000");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const defaultLoanAmount = requestedLoanAmount || Math.round(car.price * 0.8);

  async function handleApplyLoan(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/loans/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name || session?.user?.name || "Interested Buyer",
          phone: cleanPhone,
          city,
          employmentType,
          monthlyIncome: parseInt(monthlyIncome, 10) || 30000,
          loanAmountRequested: defaultLoanAmount,
          carId: car.id,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit loan application.");
      }

      setSuccess(true);
      setSuccessMsg(data.message || "Loan application received!");
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-primary-200/80 bg-linear-to-br from-primary-50/50 via-surface to-surface p-5 shadow-xs transition-all">
      {/* Top Banner */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-xs">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-700">
                Financing Partner
              </span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-success-50 px-2 py-0.2 text-xs font-bold text-success-700 border border-success-200">
                <Sparkles className="h-2.5 w-2.5" /> Instant Approval
              </span>
            </div>
            <h4 className="text-sm font-bold text-ink-strong mt-0.5">
              Get Pre-Approved Loan for this {car.brand}
            </h4>
          </div>
        </div>
      </div>

      <p className="mt-2.5 text-xs text-ink-muted leading-relaxed">
        Rates starting at <strong>9.5% p.a.</strong> • Up to 85% on-road funding • Tie-ups with HDFC, ICICI, IDFC & Poonawalla.
      </p>

      {success ? (
        <div className="mt-4 rounded-xl bg-success-50/80 border border-success-200 p-4 text-center">
          <CheckCircle2 className="h-6 w-6 text-success-600 mx-auto mb-1.5" />
          <h5 className="text-sm font-bold text-success-900">Application Received!</h5>
          <p className="text-xs text-success-800 mt-1 leading-relaxed">
            {successMsg}
          </p>
        </div>
      ) : !isOpen ? (
        <button
          type="button"
          onClick={() => {
            if (session?.user) {
              setName(session.user.name || "");
              setPhone((session.user as { phone?: string })?.phone || "");
            }
            setIsOpen(true);
          }}
          className="mt-4 w-full flex items-center justify-between py-2.5 px-4 rounded-xl text-xs font-bold text-primary-700 bg-surface border border-primary-200 hover:bg-primary-50 transition-colors shadow-2xs cursor-pointer"
        >
          <span>Check Instant Eligibility (₹{(defaultLoanAmount / 100000).toFixed(1)} Lakh Loan)</span>
          <ChevronRight className="h-4 w-4 text-primary-600" />
        </button>
      ) : (
        <form onSubmit={handleApplyLoan} className="mt-4 space-y-3 pt-3 border-t border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-ink-muted block mb-1">Your Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="input input-sm text-xs"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-ink-muted block mb-1">10-Digit Mobile Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="e.g. 9876543210"
                className="input input-sm text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-ink-muted block mb-1">Employment Type</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as "salaried" | "self_employed")}
                className="select input-sm text-xs"
              >
                <option value="salaried">Salaried (Private / Govt)</option>
                <option value="self_employed">Self-Employed / Business</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-ink-muted block mb-1">Monthly In-Hand Salary (₹)</label>
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="e.g. 45000"
                className="input input-sm text-xs"
                min="10000"
                required
              />
            </div>
          </div>

          {errorMsg && <p className="text-xs text-danger-600">{errorMsg}</p>}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn btn-primary btn-sm py-2 text-xs font-bold shadow-xs cursor-pointer"
            >
              {loading ? "Checking Eligibility..." : "Apply for Loan Approval"}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn btn-outline btn-sm py-2 text-xs"
            >
              Cancel
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 pt-1 text-xs text-ink-subtle">
            <ShieldCheck className="h-3 w-3 text-success-600" />
            <span>Zero impact on CIBIL score • Fast digital disbursal</span>
          </div>
        </form>
      )}
    </div>
  );
}

