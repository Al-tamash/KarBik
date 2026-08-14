"use client";

/**
 * WHAT: Redesigned premium EMI Calculator component.
 * WHY: Replaces the basic input fields with a highly polished, interactive UI.
 *      It helps buyers understand their monthly outgoings at a glance with:
 *      - Responsive OKLCH/indigo sliders
 *      - Live loan amount tracking
 *      - Custom visual principal-to-interest indicators
 */
import React from "react";
import { CreditCard, Landmark, Calendar, Percent } from "lucide-react";

export default function EMICalculator({
  dynamicEmi,
  downPaymentPercent,
  setDownPaymentPercent,
  downPaymentAmount,
  emiTenureSlider,
  setEmiTenureSlider,
  carPrice = 0
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
    <div className="bg-neutral-50/50 rounded-2xl p-5 border border-neutral-200/70 text-left">
      <div className="flex justify-between items-baseline mb-4">
        <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
          Estimated Monthly EMI
        </span>
        <span className="text-xl font-black text-primary-600 tracking-tight">
          ₹ {dynamicEmi.toLocaleString("en-IN")}
          <span className="text-[10px] font-bold text-neutral-500">/mo</span>
        </span>
      </div>

      <hr className="border-neutral-200/50 my-3" />

      {/* Slider 1: Down Payment Percent */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs font-bold text-neutral-700">
          <span>Down Payment</span>
          <span className="text-neutral-900 font-extrabold">
            ₹ {(downPaymentAmount / 100000).toFixed(2)} L{" "}
            <span className="text-[10px] font-medium text-neutral-400">({downPaymentPercent}%)</span>
          </span>
        </div>
        <input
          type="range"
          min={10}
          max={60}
          step={5}
          value={downPaymentPercent}
          onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
          className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
        />
        <div className="flex justify-between text-[9px] text-neutral-400 font-semibold">
          <span>Min: 10%</span>
          <span>Max: 60%</span>
        </div>
      </div>

      {/* Slider 2: Tenure Months */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs font-bold text-neutral-700">
          <span>Tenure</span>
          <span className="text-neutral-900 font-extrabold">
            {emiTenureSlider} Months{" "}
            <span className="text-[10px] font-medium text-neutral-400">({emiTenureSlider / 12} Yrs)</span>
          </span>
        </div>
        <input
          type="range"
          min={12}
          max={84}
          step={12}
          value={emiTenureSlider}
          onChange={(e) => setEmiTenureSlider(Number(e.target.value))}
          className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
        />
        <div className="flex justify-between text-[9px] text-neutral-400 font-semibold">
          <span>Min: 1 Yr</span>
          <span>Max: 7 Yrs</span>
        </div>
      </div>

      {/* Visual principal-to-interest bar charts ratio */}
      {loanAmount > 0 && (
        <div className="mt-4 pt-3 border-t border-neutral-200/50 space-y-2">
          <div className="flex justify-between text-[10px] font-bold text-neutral-500">
            <span>Loan Amount: ₹{Math.round(loanAmount).toLocaleString("en-IN")}</span>
            <span>Int: {rate}%</span>
          </div>
          
          <div className="h-1.5 w-full rounded-full bg-neutral-200 flex overflow-hidden">
            <div 
              style={{ width: `${principalPercentage}%` }} 
              className="h-full bg-primary-600 transition-all duration-350"
              title={`Principal: ${Math.round(principalPercentage)}%`}
            />
            <div 
              style={{ width: `${interestPercentage}%` }} 
              className="h-full bg-indigo-300 transition-all duration-350"
              title={`Interest: ${Math.round(interestPercentage)}%`}
            />
          </div>
          
          <div className="flex justify-between text-[8px] font-black uppercase tracking-wider text-neutral-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-primary-600 rounded-full shrink-0" /> Principal ({Math.round(principalPercentage)}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full shrink-0" /> Interest ({Math.round(interestPercentage)}%)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
