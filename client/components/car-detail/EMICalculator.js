"use client";

import React from "react";

export default function EMICalculator({ 
  dynamicEmi, 
  downPaymentPercent, 
  setDownPaymentPercent,
  downPaymentAmount,
  emiTenureSlider,
  setEmiTenureSlider
}) {
  return (
    <div className="bg-[#f5f2ff] rounded-xl p-5 border border-[#c7c4d8]/30">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-[#1b1b24]">
          Estimated EMI
        </h3>
        <span className="text-lg font-bold text-[#3525cd]">
          ₹ {dynamicEmi.toLocaleString("en-IN")}
        </span>
      </div>

      {/* Down Payment Slider */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] font-semibold text-[#777587] mb-2">
          <span>Down Payment</span>
          <span>
            ₹ {(downPaymentAmount / 100000).toFixed(1)} Lakh ({downPaymentPercent}%)
          </span>
        </div>
        <input
          type="range"
          min={10}
          max={50}
          value={downPaymentPercent}
          onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
          className="w-full h-1 bg-[#c7c4d8] rounded-full appearance-none cursor-pointer accent-[#3525cd]"
        />
      </div>

      {/* Tenure Slider */}
      <div>
        <div className="flex justify-between text-[10px] font-semibold text-[#777587] mb-2">
          <span>Tenure</span>
          <span>{emiTenureSlider} Months</span>
        </div>
        <input
          type="range"
          min={12}
          max={84}
          step={12}
          value={emiTenureSlider}
          onChange={(e) => setEmiTenureSlider(Number(e.target.value))}
          className="w-full h-1 bg-[#c7c4d8] rounded-full appearance-none cursor-pointer accent-[#3525cd]"
        />
      </div>
      <p className="text-[10px] text-[#777587] mt-3 text-center">
        Calculated at 9.5% interest. Indicative only.
      </p>
    </div>
  );
}
