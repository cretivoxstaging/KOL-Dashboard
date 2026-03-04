/**
 * ============================================
 * SPK FILTER COMPONENT
 * ============================================
 * 
 * Komponen untuk search dan filter SPK
 * Fitur:
 * - Search bar (talent, brand, SPK number)
 * - Filter tahun
 * - Filter bulan
 * - Refresh button
 * - Create button
 * 
 * Semua state management berada di parent (SPKView)
 */

"use client";
import React from "react";
import { Plus, RefreshCw } from "lucide-react";

interface SPKFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  selectedYear: string;
  onYearChange: (year: string) => void;
  availableYears: string[];
  onRefresh: () => void;
  onCreateNew: () => void;
  isLoading: boolean;
}

/**
 * ============================================
 * SPKFilter Main Component
 * ============================================
 */
export default function SPKFilter({
  searchQuery,
  onSearchChange,
  selectedMonth,
  onMonthChange,
  selectedYear,
  onYearChange,
  availableYears,
  onRefresh,
  onCreateNew,
  isLoading,
}: SPKFilterProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
      {/* Left Section: Search & Filters */}
      <div className="flex flex-wrap items-center gap-2 flex-1 w-full md:w-auto">
        {/* ============================================ */}
        {/* SEARCH BAR */}
        {/* ============================================ */}
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg
              className="w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search talent or brand..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
          />
        </div>

        {/* ============================================ */}
        {/* FILTER TAHUN (YEAR) */}
        {/* ============================================ */}
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
          className="px-4 h-11 border font-bold border-slate-200 rounded-2xl bg-white text-sm outline-none shadow-sm focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer text-[#1B3A5B]"
        >
          <option value="all">All Year</option>
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        {/* ============================================ */}
        {/* FILTER BULAN (MONTH) */}
        {/* ============================================ */}
        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          className="px-4 h-11 border font-bold border-slate-200 rounded-2xl bg-white text-sm outline-none shadow-sm focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer"
        >
          <option value="all">All Month</option>
          <option value="01">January</option>
          <option value="02">February</option>
          <option value="03">March</option>
          <option value="04">April</option>
          <option value="05">May</option>
          <option value="06">June</option>
          <option value="07">July</option>
          <option value="08">August</option>
          <option value="09">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>
      </div>

      {/* Right Section: Refresh & Create Buttons */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        {/* ============================================ */}
        {/* REFRESH BUTTON */}
        {/* ============================================ */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center justify-center bg-white hover:bg-slate-100 hover:scale-110 text-slate-600 h-12 w-16 rounded-2xl font-bold border border-slate-200 shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh Data"
        >
          <RefreshCw
            size={18}
            className={`${isLoading ? "animate-spin" : ""}`}
          />
        </button>

        {/* ============================================ */}
        {/* CREATE NEW BUTTON */}
        {/* ============================================ */}
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 bg-[#1B3A5B] text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:scale-105 transition-all w-full md:w-auto justify-center"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
}
