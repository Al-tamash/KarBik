"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function HeroSearchWidget() {
  const router = useRouter();

  const [brands, setBrands] = useState([]);
  const [searchBrand, setSearchBrand] = useState("");
  const [searchBudget, setSearchBudget] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  // Fetch unique brand list from backend for the hero dropdown
  useEffect(() => {
    fetch(`${API}/api/cars/brands`)
      .then((res) => res.json())
      .then((data) => setBrands(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Handle advanced search redirection based on selected criteria
  const handleHeroSearch = () => {
    const params = new URLSearchParams();
    if (searchBrand && searchBrand !== "Any Brand") params.set("brand", searchBrand);
    if (searchBudget && searchBudget !== "Any Budget") params.set("maxPrice", searchBudget);
    if (searchLocation && searchLocation !== "All Hyderabad") params.set("location", searchLocation);
    router.push(`/cars?${params.toString()}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
      className="w-full max-w-5xl bg-white rounded-2xl p-4 md:p-5 shadow-2xl border border-neutral-200 flex flex-col md:flex-row gap-3 md:gap-4 items-end text-neutral-850"
    >
      {/* Brand / Make selector */}
      <div className="w-full text-left">
        <label className="block text-[10px] md:text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">Brand / Make</label>
        <select 
          value={searchBrand}
          onChange={(e) => setSearchBrand(e.target.value)}
          className="select w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 text-sm text-neutral-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        >
          <option value="">Any Brand</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </div>

      {/* Budget range selector */}
      <div className="w-full text-left">
        <label className="block text-[10px] md:text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">Budget</label>
        <select 
          value={searchBudget}
          onChange={(e) => setSearchBudget(e.target.value)}
          className="select w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 text-sm text-neutral-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        >
          <option value="">Any Budget</option>
          <option value="300000">Under ₹3 Lakh</option>
          <option value="500000">Under ₹5 Lakh</option>
          <option value="1000000">Under ₹10 Lakh</option>
          <option value="2000000">Under ₹20 Lakh</option>
          <option value="5000000">Under ₹50 Lakh</option>
        </select>
      </div>

      {/* Regional area selector */}
      <div className="w-full text-left">
        <label className="block text-[10px] md:text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">Area</label>
        <select 
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
          className="select w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 text-sm text-neutral-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        >
          <option value="">All Hyderabad</option>
          <option value="Kukatpally">Kukatpally</option>
          <option value="Gachibowli">Gachibowli</option>
          <option value="Madhapur">Madhapur</option>
          <option value="Begumpet">Begumpet</option>
          <option value="LB Nagar">LB Nagar</option>
          <option value="Minister Road">Minister Road</option>
        </select>
      </div>

      {/* Trigger redirect search */}
      <button 
        onClick={handleHeroSearch}
        className="w-full md:w-auto btn btn-primary px-6 md:px-8 py-2.5 md:py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
      >
        <Search className="h-4 w-4" />
        <span>Search Cars</span>
      </button>
    </motion.div>
  );
}
