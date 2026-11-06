"use client";

/**
 * WHAT: Redesigned premium EMI Calculator component.
 * WHY: Replaces the basic input fields with a highly polished, interactive UI.
 *      It helps buyers understand their monthly outgoings at a glance with:
  *      - Responsive OKLCH sliders
 *      - Live loan amount tracking
 *      - Custom visual principal-to-interest indicators
 */
import React, { type Dispatch, type SetStateAction } from "react";
import { CreditCard, Landmark, Calendar, Percent } from "lucide-react";

export default function EMICalculator({
  dynamicEmi,
  downPaymentPercent,
  setDownPaymentPercent,
  downPaymentAmount,
  emiTenureSlider,
  setEmiTenureSlider,
  carPrice = 0
}: {
  dynamicEmi: number;
  downPaymentPercent: number;
  setDownPaymentPercent: Dispatch<SetStateAction<number>>;
  downPaymentAmount: number;
  emiTenureSlider: number;
  setEmiTenureSlider: Dispatch<SetStateAction<number>>;
  carPrice?: number;
}) {
  // Derive loan details
  const loanAmount = Math.max(0, carPrice - downPaymentAmount);
  
  // Calculate indicative interest ratio
  // Standard car loan interest rate: 10.8%
  const rate = 10.8;
  const totalMonths = emiTenureSlider;
  const totalRepayment = dynamicEmi * totalMonths;
  const totalInterest = Math.max(0, totalRepayment - loanAmount);
  
  const interestPercentage = totalRepayment > 0 ? (totalInterest / totalRepayment) * 100 : 0;
  const principalPercentage = 100 - interestPercentage;

  return (
    <div className="bg-surface-alt/60 rounded-2xl p-5 border border-border text-left">
      <div className="flex justify-between items-baseline mb-4">
        <span className="text-xs font-black uppercase tracking-wider text-ink-subtle">
          Estimated Monthly EMI
        </span>
        <span className="text-xl font-black text-primary-600 tracking-tight">
          ₹ {dynamicEmi.toLocaleString("en-IN")}
          <span className="text-xs font-bold text-ink-muted">/mo</span>
        </span>
      </div>

      <hr className="border-border my-3" />

      {/* Slider 1: Down Payment Percent */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs font-bold text-ink">
          <span>Down Payment</span>
          <span className="text-ink-strong font-extrabold">
            ₹ {(downPaymentAmount / 100000).toFixed(2)} L{" "}
            <span className="text-xs font-medium text-ink-subtle">({downPaymentPercent}%)</span>
          </span>
        </div>
        <input
          type="range"
          aria-label="Down payment percentage"
          min={10}
          max={60}
          step={5}
          value={downPaymentPercent}
          onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
          className="w-full h-1.5 bg-surface-alt rounded-lg appearance-none cursor-pointer accent-primary-600"
        />
        <div className="flex justify-between text-xs text-ink-subtle font-semibold">
          <span>Min: 10%</span>
          <span>Max: 60%</span>
        </div>
      </div>

      {/* Slider 2: Tenure Months */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs font-bold text-ink">
          <span>Tenure</span>
          <span className="text-ink-strong font-extrabold">
            {emiTenureSlider} Months{" "}
            <span className="text-xs font-medium text-ink-subtle">({emiTenureSlider / 12} Yrs)</span>
          </span>
        </div>
        <input
          type="range"
          aria-label="Loan tenure in months"
          min={12}
          max={84}
          step={12}
          value={emiTenureSlider}
          onChange={(e) => setEmiTenureSlider(Number(e.target.value))}
          className="w-full h-1.5 bg-surface-alt rounded-lg appearance-none cursor-pointer accent-primary-600"
        />
        <div className="flex justify-between text-xs text-ink-subtle font-semibold">
          <span>Min: 1 Yr</span>
          <span>Max: 7 Yrs</span>
        </div>
      </div>

      {/* Visual principal-to-interest bar charts ratio */}
      {loanAmount > 0 && (
        <div className="mt-4 pt-3 border-t border-border space-y-2">
          <div className="flex justify-between text-xs font-bold text-ink-muted">
            <span>Loan Amount: ₹{Math.round(loanAmount).toLocaleString("en-IN")}</span>
            <span>Int: {rate}%</span>
          </div>
          
          <div className="h-1.5 w-full rounded-full bg-surface-alt flex overflow-hidden">
            <div 
              style={{ width: `${principalPercentage}%` }} 
              className="h-full bg-primary-600 transition-all duration-350"
              title={`Principal: ${Math.round(principalPercentage)}%`}
            />
            <div 
              style={{ width: `${interestPercentage}%` }} 
              className="h-full bg-primary-300 transition-all duration-350"
              title={`Interest: ${Math.round(interestPercentage)}%`}
            />
          </div>
          
          <div className="flex justify-between text-xs font-black uppercase tracking-wider text-ink-subtle">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-primary-600 rounded-full shrink-0" /> Principal ({Math.round(principalPercentage)}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-primary-300 rounded-full shrink-0" /> Interest ({Math.round(interestPercentage)}%)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
