/**
 * ============================================
 * FILTER SELECT - REUSABLE FILTER COMPONENT
 * ============================================
 * 
 * Dropdown select component yang reusable untuk filtering
 * 
 * Fitur:
 * - Controlled component (value dan onChange dari parent)
 * - Custom styling dengan border dan padding
 * - Support "All" option sebagai default
 * - Dynamic options array
 * 
 * Props:
 * - label: Label text di samping dropdown
 * - value: Selected value (controlled)
 * - onChange: Handler untuk value change
 * - options: Array of option values untuk dropdown
 * 
 * Dipakai untuk filter:
 * - Source (Instagram, TikTok, YouTube, etc)
 * - Tier (Gold, Silver, Bronze)
 * - Religion (Islam, Kristen, Katolik, Hindu, Buddha)
 * - Status (Active, Inactive)
 */

import React from "react";

interface FilterSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
}

const FilterSelect: React.FC<FilterSelectProps> = ({ value, onChange, options, placeholder }) => (
  <div className="flex items-center bg-white px-3 py-2 border border-slate-200 rounded-xl shadow-sm hover:border-[#00F0FF]/30 transition-all">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs font-bold text-slate-700 outline-none bg-transparent cursor-pointer"
    >
      <option value="All">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

export default FilterSelect;
