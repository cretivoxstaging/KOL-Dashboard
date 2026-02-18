"use client";
import React, { useEffect, useState, useRef } from "react";

import { useExcelActions } from "./useExcelActions";
import {
  Search,
  Plus,
  Instagram,
  MapPin,
  Edit3,
  Trash2,
  Download,
  Eye,
  Banknote,
  Youtube,
  Upload,
  Clock,
  RefreshCw,
} from "lucide-react";

import TalentRow from "./TalentRow";
import FilterSelect from "./FilterSelect";
import TalentDetailModal from "./TalentDetailModal";
import { Talent, getSourceStyle } from "../types";

interface TalentViewProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  filteredTalent: Talent[];
  onAddClick: () => void;
  onDelete: (id: number) => void;
  onUpdate: (talent: any) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  selectedReligion: string;
  setSelectedReligion: (val: string) => void;
  selectedSource: string;
  setSelectedSource: (val: string) => void;
  selectedTier: string;
  setSelectedTier: (val: string) => void;
  selectedAgeRange: string;
  setSelectedAgeRange: (val: string) => void;
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
}

export default function TalentView({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  filteredTalent,
  onAddClick,
  onDelete,
  onUpdate,
  sortBy,
  setSortBy,
  selectedReligion,
  setSelectedReligion,
  selectedTier,
  setSelectedTier,
  selectedAgeRange,
  setSelectedAgeRange,
  selectedStatus,
  setSelectedStatus,
  selectedSource,
  setSelectedSource,
  onRefresh,
  isLoading,
  isSidebarOpen,
  isSidebarCollapsed,
}: TalentViewProps) {
  const [selectedDetail, setSelectedDetail] = useState<Talent | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [talentToDelete, setTalentToDelete] = useState<Talent | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const {
    isPaused,
    setIsPaused,
    isPausedRef,
    isCancelledRef,
    importProgress,
    setImportProgress,
    showProgress,
    setShowProgress,
    handleCancelImport,
    togglePause,
    processImport,
    handleImportExcel,
    handleExportExcel,
  } = useExcelActions(onRefresh);

  useEffect(() => {
    const savedData = localStorage.getItem("pending_import_data");
    const savedIndex = localStorage.getItem("pending_import_index");
    if (savedData && savedIndex) {
      try {
        const data = JSON.parse(savedData);
        const index = parseInt(savedIndex);
        if (Array.isArray(data) && index < data.length) {
          // Kasih delay dikit pas mount biar gak bentrok sama render awal
          setShowProgress(true);
          setImportProgress({ current: index + 1, total: data.length });
          const timer = setTimeout(() => {
            if (confirm(`Proses import terhenti di ${index + 1}. Lanjut?`)) {
              processImport(data, index);
            } else {
              localStorage.removeItem("pending_import_data");
              localStorage.removeItem("pending_import_index");
            }
          }, 1000);
          return () => clearTimeout(timer);
        }
      } catch (e) {
        localStorage.removeItem("pending_import_data");
      }
    }
  }, []);

  useEffect(() => {
    if (selectedDetail) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup saat komponen unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedDetail]);
  const formatDate = (dateString?: string) => {
    if (!dateString || dateString === "null" || dateString === "")
      return "Never";

    try {
      const parts = dateString.split("-");

      let date;
      if (parts.length === 3) {
        const day = parts[0];
        const month = parts[1];
        const yearWithTime = parts[2];

        const formattedForJS = `${yearWithTime.split(" ")[0]}-${month}-${day} ${yearWithTime.split(" ")[1]}`;
        date = new Date(formattedForJS);
      } else {
        // Fallback kalau ternyata formatnya sudah ISO
        date = new Date(dateString);
      }

      if (isNaN(date.getTime())) return "Never";

      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (e) {
      return "Never";
    }
  };

  const calculateTier = (followers: number) => {
    if (followers >= 1000000) return "Mega";
    if (followers >= 100000) return "Macro";
    if (followers >= 10000) return "Micro";
    return "Nano";
  };

  const handleRealTimeRefresh = async () => {
    console.log("Memperbarui tampilan tabel dari database...");

    try {
      await onRefresh();
      console.log("Data tabel berhasil disinkronkan dengan database pusat.");
    } catch (err) {
      console.error("Gagal merefresh tabel:", err);
    }
  };

  const isFilterActive =
    selectedReligion !== "All" ||
    selectedTier !== "All" ||
    selectedAgeRange !== "All" ||
    selectedStatus !== "All" ||
    selectedSource !== "All";

  // Hitung indeks data
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredTalent.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTalent.length / rowsPerPage);

  // Reset ke halaman 1 jika hasil filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedSource,
    selectedCategory,
    selectedTier,
    selectedReligion,
    selectedAgeRange,
    selectedStatus,
  ]);

  function SortableHeader({
    label,
    field,
    currentSort,
    onSort,
    align = "left",
  }: any) {
    const [sortField, sortOrder] = currentSort.split("-");
    const isActive = sortField === field;

    return (
      <th
        className={`p-5 cursor-pointer hover:bg-slate-300 transition-colors ${align === "center" ? "text-center" : ""}`}
        onClick={() =>
          onSort(
            isActive && sortOrder === "desc" ? `${field}-asc` : `${field}-desc`,
          )
        }
      >
        <div
          className={`flex items-center gap-2 ${align === "center" ? "justify-center" : ""}`}
        >
          {label}
          <div className="flex flex-col text-[8px]">
            <span
              className={
                isActive && sortOrder === "asc"
                  ? "text-blue-600"
                  : "text-slate-400"
              }
            >
              ▲
            </span>
            <span
              className={
                isActive && sortOrder === "desc"
                  ? "text-blue-600"
                  : "text-slate-400"
              }
            >
              ▼
            </span>
          </div>
        </div>
      </th>
    );
  }

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold mb-8 text-[#1B3A5B]">
        Talent Management
      </h2>

      {/* TOOLBAR SECTION */}
      <div className="mb-2">
        {/* BARIS 1: SEARCH, SORT, ADD */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-3 items-center flex-1 w-full">
            <div className="relative flex-1 max-w-60">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-800"
                size={16}
              />
              <input
                type="text"
                placeholder="Search name, ethnic, or IG (@username)..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1B3A5B]/10 outline-none transition-all bg-white shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <FilterSelect
              placeholder="All Source"
              value={selectedSource}
              onChange={setSelectedSource}
              options={[
                "Artist/Celebrity",
                "Influencer/KOL",
                "Talent",
                "Media",
                "Clippers",
              ]}
            />
            <FilterSelect
              placeholder="All Status"
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={["Active", "Inactive"]}
            />
            <FilterSelect
              placeholder="All Tier"
              value={selectedTier}
              onChange={setSelectedTier}
              options={[
                "IG: Mega",
                "IG: Macro",
                "IG: Micro",
                "IG: Nano",
                "TT: Mega",
                "TT: Macro",
                "TT: Micro",
                "TT: Nano",
              ]}
            />
            <FilterSelect
              placeholder="All Religion"
              value={selectedReligion}
              onChange={setSelectedReligion}
              options={[
                "Islam",
                "Kristen",
                "Katolik",
                "Hindu",
                "Buddha",
                "Khonghucu",
                "Other",
                "-",
              ]}
            />
          </div>
          <div className="ml-auto flex gap-4">
            <div
              className={`relative group transition-opacity duration-300 ${selectedDetail ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleImportExcel}
                disabled={!!selectedDetail}
                className={`absolute inset-0 w-full h-full opacity-0 z-10 ${selectedDetail ? "cursor-not-allowed" : "cursor-pointer"}`}
                title={
                  selectedDetail ? "Close detail to import" : "Import Data"
                }
              />
              <button
                disabled={!!selectedDetail}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all group-hover:scale-105 disabled:hover:scale-100"
              >
                <Download size={18} />
              </button>
            </div>
            <button
              onClick={() => handleExportExcel(filteredTalent)}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all hover:scale-105"
              title="Export Data"
            >
              <Upload size={18} />
            </button>
            <button
              onClick={onAddClick}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#1B3A5B] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-[#1B3A5B]/20 hover:scale-105 transition-transform"
              title="Add New Talent"
            >
              <Plus size={18} />
            </button>
            <button
              onClick={handleRealTimeRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 bg-white hover:bg-slate-100 hover:scale-110 text-slate-600 px-4 py-2.5 rounded-xl font-bold text-sm border border-slate-200 shadow-sm transition-all active:scale-95 disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw
                size={18}
                className={`${isLoading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* BARIS 2: ADVANCED FILTERS */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
          {isFilterActive && (
            <button
              onClick={() => {
                setSelectedReligion("All");
                setSelectedTier("All");
                setSelectedAgeRange("All");
                setSelectedStatus("All");
                setSelectedCategory("All");
                setSelectedSource("All");
                setSearchTerm("");
              }}
              className="ml-2 text-[10px] font-extrabold text-red-500 hover:text-red-700 underline underline-offset-4 uppercase tracking-wider"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-200 text-slate-800 text-[12px] uppercase tracking-widest font-bold">
              <th className="p-5 text-center w-16">#</th>
              <SortableHeader
                label="Talent & Socials"
                field="name"
                currentSort={sortBy}
                onSort={setSortBy}
              />
              <th className="p-5">Source</th>
              <SortableHeader
                label="Followers IG"
                field="igFollowers"
                currentSort={sortBy}
                onSort={setSortBy}
                align="center"
              />
              <SortableHeader
                label="Followers Tiktok"
                field="tiktokFollowers"
                currentSort={sortBy}
                onSort={setSortBy}
                align="center"
              />
              <th className="p-5 text-center">Tier</th>
              <th className="p-5 text-center">Status</th>
              <th className="p-5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredTalent.length > 0 ? (
              currentItems.map((t, index) => (
                <TalentRow
                  key={t.id}
                  t={t}
                  index={index}
                  indexOfFirstItem={indexOfFirstItem}
                  onDetailClick={setSelectedDetail}
                  onUpdate={(talent) => {
                    onUpdate(talent);
                  }}
                  setTalentToDelete={setTalentToDelete} // Kirim fungsi delete-nya
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="p-20 text-center text-slate-400 italic"
                >
                  No talents found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal detail talent */}
      {selectedDetail && (
        <TalentDetailModal
          selectedDetail={selectedDetail}
          setSelectedDetail={setSelectedDetail}
          formatDate={formatDate}
          getSourceStyle={getSourceStyle}
          onUpdate={onUpdate}
          setTalentToDelete={setTalentToDelete}
        />
      )}
      {/* PAGINATION CONTROLS */}
      <div className="flex flex-col md:flex-row items-center justify-between mt-6 px-2 gap-4">
        {/* Info Rows Per Page */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500">
            Rows per page:
          </span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/10 shadow-sm cursor-pointer"
          >
            {[10, 20, 50, 100, 200].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-400">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredTalent.length)} of{" "}
            {filteredTalent.length}
          </span>
        </div>

        {/* Page Navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Prev
          </button>

          <div className="flex items-center gap-1 mx-2">
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              // Hanya tampilkan beberapa nomor halaman jika terlalu banyak
              if (
                totalPages > 5 &&
                Math.abs(pageNum - currentPage) > 1 &&
                pageNum !== 1 &&
                pageNum !== totalPages
              ) {
                if (pageNum === 2 || pageNum === totalPages - 1)
                  return (
                    <span key={pageNum} className="text-slate-300">
                      ...
                    </span>
                  );
                return null;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === pageNum
                      ? "bg-[#1B3A5B] text-white shadow-md shadow-[#1B3A5B]/20"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      </div>
      {/* ================= MODAL DELETE VERIFICATION ================= */}
      {talentToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-100 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <Trash2 size={24} />
                <h3 className="text-xl font-bold">Delete Employee</h3>
              </div>

              <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
                <p className="text-red-800 text-sm font-medium">
                  <span className="font-bold">Warning:</span> This action cannot
                  be undone. This will permanently delete the employee record.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                <p className="text-xs text-slate-500 uppercase font-bold mb-2">
                  Employee to be deleted:
                </p>
                <div className="space-y-1">
                  <p className="text-sm">
                    <strong>Name:</strong> {talentToDelete.name}
                  </p>
                  <p className="text-sm">
                    <strong>Category:</strong> {talentToDelete.category}
                  </p>
                  <p className="text-sm">
                    <strong>Email:</strong> {talentToDelete.email}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700">
                  Type <span className="text-red-600">delete</span> to confirm:
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                  placeholder="Type 'delete' here"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 flex gap-3">
              <button
                onClick={() => {
                  setTalentToDelete(null);
                  setDeleteConfirmation("");
                }}
                className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                disabled={deleteConfirmation.toLowerCase() !== "delete"}
                onClick={() => {
                  onDelete(talentToDelete.id);
                  setTalentToDelete(null);
                  setDeleteConfirmation("");
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all ${
                  deleteConfirmation.toLowerCase() === "delete"
                    ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200"
                    : "bg-red-300 cursor-not-allowed"
                }`}
              >
                <Trash2 size={18} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {showProgress && (
        <div className="fixed bottom-10 right-10 z-9999 animate-in slide-in-from-right-full duration-500">
          <div className="bg-[#1B3A5B] text-white p-5 rounded-2xl shadow-2xl border border-white/10 min-w-[320px]">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <RefreshCw
                  size={16}
                  className={`${isPaused ? "" : "animate-spin"} text-blue-400`}
                />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {isPaused ? "Paused" : "Syncing Data"}
                </span>
              </div>
              <span className="text-xs font-black bg-blue-500/30 px-2 py-1 rounded-lg">
                {Math.round(
                  (importProgress.current / importProgress.total) * 100,
                )}
                %
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-4">
              <div
                className="bg-blue-400 h-full transition-all duration-300"
                style={{
                  width: `${(importProgress.current / importProgress.total) * 100}%`,
                }}
              />
            </div>

            {/* CONTROLS */}
            <div className="flex gap-2">
              <button
                onClick={togglePause}
                className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-bold uppercase transition-all"
              >
                {isPaused ? "Resume" : "Pause"}
              </button>
              <button
                onClick={() => handleCancelImport()}
                className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-200 rounded-lg text-[10px] font-bold uppercase transition-all"
              >
                Cancel
              </button>
            </div>

            <p className="text-[9px] text-blue-200 mt-3 italic text-center">
              Processing {importProgress.current} of {importProgress.total}{" "}
              talents...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
