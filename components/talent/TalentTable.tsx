"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Talent } from "@/types";
import { formatDate } from "@/types";
import * as XLSX from "xlsx";
import {
  ChevronDown,
  Eye,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  MapPin,
  Instagram,
  Phone,
  Users,
  Heart,
  Cake,
  Briefcase,
  GraduationCap,
  AlertCircle,
  Clock,
  Plus,
  Search,
  Download,
  Upload,
} from "lucide-react";
import EditTalentModal from "./EditTalentModal";

interface TalentTableProps {
  talents: Talent[];
  isLoading: boolean;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  talentToEdit: Talent | null;
  setTalentToEdit: (talent: Talent | null) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  selectedReligion: string;
  setSelectedReligion: (religion: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedTier: string;
  setSelectedTier: (tier: string) => void;
  selectedAgeRange: string;
  setSelectedAgeRange: (range: string) => void;
  selectedSource: string;
  setSelectedSource: (source: string) => void;
  filteredAndSortedTalents: Talent[];
  onDelete: (id: number) => Promise<void>;
  onUpdate: (talent: Talent) => void;
  onRefresh: () => void;
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
}

const TalentTable: React.FC<TalentTableProps> = ({
  talents,
  isLoading,
  isModalOpen,
  setIsModalOpen,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  talentToEdit,
  setTalentToEdit,
  sortBy,
  setSortBy,
  selectedReligion,
  setSelectedReligion,
  selectedStatus,
  setSelectedStatus,
  selectedTier,
  setSelectedTier,
  selectedAgeRange,
  setSelectedAgeRange,
  selectedSource,
  setSelectedSource,
  filteredAndSortedTalents,
  onDelete,
  onUpdate,
  onRefresh,
  isSidebarOpen,
  isSidebarCollapsed,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [talentToDelete, setTalentToDelete] = useState<Talent | null>(null);
  const [confirmationText, setConfirmationText] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingTalent, setEditingTalent] = useState<Talent | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);

  const getTalentStatusValue = (talent: Talent) => {
    const statusFromTalent = (talent as any)?.talent_status;
    const status = statusFromTalent ?? talent.status ?? "";
    return String(status).trim();
  };

  // Filter only internal talent (source === "talent")
  const internalTalents = useMemo(() => {
    return filteredAndSortedTalents.filter(
      (item) =>
        item.source?.toLowerCase() === "talent" ||
        item.source?.toLowerCase() === "talent",
    );
  }, [filteredAndSortedTalents]);

  const statusOptions = useMemo(() => {
    const uniqueStatuses = Array.from(
      new Set(
        internalTalents
          .map((talent) => getTalentStatusValue(talent))
          .filter((status) => status.length > 0),
      ),
    );
    return uniqueStatuses;
  }, [internalTalents]);

  // Apply search filter
  const searchFilteredTalents = useMemo(() => {
    if (!searchTerm.trim()) return internalTalents;

    const searchLower = searchTerm.toLowerCase();
    return internalTalents.filter((talent) => {
      const name = talent.name?.toLowerCase() || "";
      const email = talent.email?.toLowerCase() || "";
      const phone = talent.contactPerson?.toLowerCase() || "";
      const status = getTalentStatusValue(talent).toLowerCase();
      const category = talent.category?.toLowerCase() || "";

      return (
        name.includes(searchLower) ||
        email.includes(searchLower) ||
        phone.includes(searchLower) ||
        status.includes(searchLower) ||
        category.includes(searchLower)
      );
    });
  }, [searchTerm, internalTalents]);

  // Apply status filter
  const statusFilteredTalents = useMemo(() => {
    if (!selectedStatus || selectedStatus === "All") {
      return searchFilteredTalents;
    }
    const selectedStatusNormalized = selectedStatus.trim().toLowerCase();
    return searchFilteredTalents.filter((talent) => {
      const statusNormalized = getTalentStatusValue(talent).toLowerCase();
      return statusNormalized === selectedStatusNormalized;
    });
  }, [selectedStatus, searchFilteredTalents]);

  // Pagination
  const filteredTalent = statusFilteredTalents;
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const paginatedTalents = filteredTalent.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTalent.length / rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  const handleEditRequest = (talent: Talent) => {
    setEditingTalent(talent);
    setIsEditOpen(true);
    setOpenDropdown(null);
  };

  const handleUpdate = async (
    updatedTalent: Talent,
    event?: React.FormEvent<HTMLFormElement>,
  ) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    try {
      setIsUpdating(true);
      const selectedStatus =
        updatedTalent.status === "Taken" ? "Taken" : "Available";

      const payload = {
        name: updatedTalent.name,
        domicile: updatedTalent.domisili || "",
        instagram_username: updatedTalent.igAccount || "",
        contact_person: updatedTalent.contactPerson || "",
        ethnicity: updatedTalent.suku || "",
        religion: updatedTalent.agama || "",
        reason_for_joining: updatedTalent.alasan || "",
        hobby: updatedTalent.hobby || "",
        age: String(updatedTalent.umur || ""),
        occupation: updatedTalent.pekerjaan || "",
        university: updatedTalent.tempatKuliah || "",
        status: selectedStatus,
        talent_status: selectedStatus,
        source: "talent",
        last_update: new Date().toISOString(),
      };

      const response = await fetch(`/api/Talent/${updatedTalent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Gagal update talent");
      }

      setIsEditOpen(false);
      setEditingTalent(null);
      await onRefresh();
    } catch (error) {
      console.error("[Talent Edit] Update failed:", error);
      alert("Gagal menyimpan perubahan talent.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteRequest = (talent: Talent) => {
    setTalentToDelete(talent);
    setConfirmationText("");
    setShowDeleteModal(true);
    setOpenDropdown(null);
  };

  const handleConfirmDelete = async () => {
    if (confirmationText !== "delete") {
      return;
    }

    const selectedTalentId = talentToDelete?.id;
    if (selectedTalentId === null || selectedTalentId === undefined) {
      console.log("[Talent Delete] Missing selected talent id on confirm");
      return;
    }

    await onDelete(selectedTalentId);
    setShowDeleteModal(false);
    setTalentToDelete(null);
    setConfirmationText("");
  };

  const handleManualSync = async (talent: Talent) => {
    if (!talent.igAccount || talent.igAccount === "-") {
      alert("Username IG kosong, tidak ada yang bisa di-sync.");
      return;
    }

    setSyncingId(talent.id);
    try {
      const syncTasks = [];

      if (talent.igAccount && talent.igAccount !== "-") {
        const igUser = talent.igAccount.replace("@", "").trim();
        const igUrl = `/api/instagram?username=${encodeURIComponent(igUser)}&id=${talent.id}`;
        syncTasks.push(fetch(igUrl));
      }

      console.log(`[Sync] Menjalankan ${syncTasks.length} task sync...`);
      const results = await Promise.all(syncTasks);

      results.forEach((res, i) => {
        if (!res.ok)
          console.error(`Task ke-${i + 1} gagal dengan status ${res.status}`);
      });

      // Refresh data after sync
      onRefresh();
    } catch (err) {
      console.error("Manual sync failed", err);
      alert("Ada error saat sync, cek koneksi atau limit API.");
    } finally {
      setSyncingId(null);
      setOpenDropdown(null);
    }
  };

  const handleRealTimeRefresh = async () => {
    try {
      await onRefresh();
    } catch (err) {
      console.error("Gagal merefresh tabel:", err);
    }
  };

  const handleDetailClick = (talent: Talent) => {
    setSelectedTalent(talent);
    setDetailModalOpen(true);
    setOpenDropdown(null);
  };

  const exportToExcel = () => {
    if (statusFilteredTalents.length === 0) {
      alert("Tidak ada data talent untuk diexport.");
      return;
    }

    const exportRows = statusFilteredTalents.map((talent) => ({
      ID: talent.id,
      Nama: talent.name || "",
      Umur: talent.umur || "",
      Suku: talent.suku || "",
      Agama: talent.agama || "",
      Domisili: talent.domisili || "",
      Pekerjaan: talent.pekerjaan || "",
      Tempat_Kuliah: talent.tempatKuliah || "",
      Hobby: talent.hobby || "",
      Alasan: talent.alasan || "",
      IG_Account: talent.igAccount || "",
      IG_Followers: talent.igFollowers ?? 0,
      WA_Contact: talent.contactPerson || "",
      Category: talent.category || "",
      Status: getTalentStatusValue(talent),
      Email: talent.email || "",
      Last_Update: talent.last_update || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Talent");

    const today = new Date();
    const dateLabel = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    XLSX.writeFile(workbook, `Data_Talent_${dateLabel}.xlsx`);
  };

  // Helper component untuk InfoCard yang reusable
  const InfoCard = ({
    icon: Icon,
    label,
    value,
    fullWidth = false,
    isStatus = false,
    isBadge = false,
  }: any) => (
    <div
      className={`bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 ${fullWidth ? "col-span-full" : ""}`}
    >
      <div className="flex items-center gap-3 mb-2">
        {Icon && (
          <Icon size={16} className="text-slate-600 dark:text-slate-300" />
        )}
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
          {label}
        </span>
      </div>
      {isStatus ? (
        <span
          className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatusBadgeStyle(value)}`}
        >
          {value || "Unknown"}
        </span>
      ) : isBadge ? (
        <span className="inline-block px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-md">
          {value || "-"}
        </span>
      ) : (
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {value || "-"}
        </p>
      )}
    </div>
  );

  const DetailItem = ({
    label,
    value,
  }: {
    label: string;
    value?: string | null;
  }) => (
    <div>
      <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter mb-0.5">
        {label}
      </p>
      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
        {value || "-"}
      </p>
    </div>
  );

  const getStatusBadgeStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-700 border border-green-200";
      case "taken":
        return "bg-red-100 text-red-700 border border-red-200";
      default:
        return "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-600";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-slate-400">
            Loading internal talent data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-200">
        Talent Management
      </h1>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Card 1: Total khusus Talent saja */}
        <div className="bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-slate-400 mb-1">
            Total Talent
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            {talents.filter((t) => t.source?.toLowerCase() === "talent").length}
          </div>
        </div>

        {/* Card 2: Available khusus yang source-nya Talent */}
        <div className="bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-slate-400 mb-1">
            Available
          </div>
          <div className="text-2xl font-bold text-green-600">
            {
              talents.filter(
                (t) =>
                  t.source?.toLowerCase() === "talent" &&
                  (t.status?.toLowerCase() === "active" ||
                    t.status?.toLowerCase() === "available"),
              ).length
            }
          </div>
        </div>

        {/* Card 3: Taken khusus yang source-nya Talent */}
        <div className="bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-slate-400 mb-1">
            Taken
          </div>
          <div className="text-2xl font-bold text-red-600">
            {
              talents.filter(
                (t) =>
                  t.source?.toLowerCase() === "talent" &&
                  (t.status?.toLowerCase() === "inactive" ||
                    t.status?.toLowerCase() === "taken"),
              ).length
            }
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-3 w-full">
        <div className="relative w-full md:w-1/2 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-9 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#1E293B] text-black dark:text-slate-200"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#1E293B] min-w-40 text-black dark:text-slate-200 font-medium text-sm"
        >
          <option value="All">All Status</option>
          <option value="Available">Available</option>
          <option value="Taken">Taken</option>
        </select>
        <div className="md:ml-auto flex items-center gap-3">
          <button
            onClick={handleRealTimeRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 bg-white dark:bg-[#1E293B] hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-110 text-slate-600 dark:text-slate-300 px-4 py-2.5 rounded-xl font-bold text-sm border border-slate-200 dark:border-slate-800 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw
              size={18}
              className={`${isLoading ? "animate-spin" : ""}`}
            />
          </button>
          <button
            type="button"
            onClick={exportToExcel}
            title="Export Data"
            className="inline-flex items-center bg-green-500 hover:bg-green-600 justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-white shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Upload size={18} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-[#1E293B] border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                  Domisili
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                  Instagram Account
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                  Pekerjaan
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {paginatedTalents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-500 dark:text-slate-400">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
                        No talent found
                      </p>
                      <p className="text-sm mt-1">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTalents.map((talent, index) => {
                  const isLastTwo = index >= paginatedTalents.length - 2;
                  const isDropdownOpen = openDropdown === talent.id;
                  const isSyncing = syncingId === talent.id;

                  // Format Instagram username
                  const igUsername = talent.igAccount
                    ? talent.igAccount.startsWith("@")
                      ? talent.igAccount
                      : `@${talent.igAccount}`
                    : "-";
                  const igUrlUsername = (talent.igAccount || "")
                    .replace("@", "")
                    .trim();

                  return (
                    <tr
                      key={talent.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      {/* Nama */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {talent.name?.charAt(0).toUpperCase() || "?"}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                              {talent.name || "N/A"}
                            </div>
                            {talent.email && (
                              <div className="text-xs text-gray-500 dark:text-slate-400">
                                {talent.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Domisili */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin
                            size={14}
                            className="text-gray-400 dark:text-slate-500"
                          />
                          <span className="text-sm text-gray-900 dark:text-slate-100">
                            {talent.domisili || "-"}
                          </span>
                        </div>
                      </td>

                      {/* Instagram Account */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Instagram size={14} className="text-pink-500" />
                          {igUrlUsername ? (
                            <a
                              href={`https://instagram.com/${igUrlUsername}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-blue-600 hover:underline"
                            >
                              {igUsername}
                            </a>
                          ) : (
                            <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                              {igUsername}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Pekerjaan */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Briefcase
                            size={14}
                            className="text-gray-400 dark:text-slate-500"
                          />
                          <span className="text-sm text-gray-900 dark:text-slate-100">
                            {talent.pekerjaan || "-"}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {(() => {
                          const talentStatus = getTalentStatusValue(talent);
                          return (
                            <span
                              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeStyle(
                                talentStatus,
                              )}`}
                            >
                              {talentStatus || "-"}
                            </span>
                          );
                        })()}
                      </td>

                      {/* Actions - Dropdown */}
                      <td className="px-6 py-4 text-center">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() =>
                              setOpenDropdown(isDropdownOpen ? null : talent.id)
                            }
                            style={{ backgroundColor: "#007AFF" }}
                            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-[10px] font-bold transition-all shadow-sm hover:opacity-80"
                          >
                            Action{" "}
                            <ChevronDown
                              size={12}
                              className={`transition-transform ${
                                isDropdownOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {isDropdownOpen && (
                            <>
                              {/* Backdrop to close dropdown when clicking outside */}
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenDropdown(null)}
                              ></div>

                              <div
                                className={`absolute right-0 w-40 bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl z-20 py-2 animate-in fade-in zoom-in duration-200 ${
                                  isLastTwo
                                    ? "bottom-full mb-2 origin-bottom-right"
                                    : "top-full mt-2 origin-top-right"
                                }`}
                              >
                                <button
                                  onClick={() => {
                                    handleDetailClick(talent);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                  <Eye size={14} className="text-blue-500" />{" "}
                                  Detail
                                </button>

                                <button
                                  onClick={() => handleManualSync(talent)}
                                  disabled={isSyncing}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                                >
                                  <RefreshCw
                                    size={14}
                                    className={`text-emerald-500 ${
                                      isSyncing ? "animate-spin" : ""
                                    }`}
                                  />
                                  {isSyncing ? "Syncing..." : "Sync Data"}
                                </button>

                                <button
                                  onClick={() => {
                                    handleEditRequest(talent);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                  <Pencil
                                    size={14}
                                    className="text-amber-500"
                                  />{" "}
                                  Edit
                                </button>

                                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2"></div>

                                <button
                                  onClick={() => {
                                    handleDeleteRequest(talent);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-red-500 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
            {/* PAGINATION CONTROLS */}
      <div className="flex flex-col md:flex-row items-center justify-between mt-6 px-2 pb-4 gap-4">
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
            className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-black dark:text-slate-200 text-xs font-bold rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/10 shadow-sm cursor-pointer"
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
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
                      : "text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && talentToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-120 p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#1E293B] rounded-4xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-800 p-8">
            {/* Icon & Title */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-50 rounded-lg text-red-600">
                <Trash2 size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                Delete Talent
              </h3>
            </div>

            {/* Warning Box */}
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6">
              <p className="text-sm font-bold text-red-800 mb-1">Warning:</p>
              <p className="text-xs text-red-600 leading-relaxed font-medium">
                Action ini tidak bisa dibatalkan. Data talent{" "}
                <span className="font-black underline">
                  {talentToDelete.name}
                </span>{" "}
                akan dihapus permanen.
              </p>
            </div>

            {/* Input Confirmation */}
            <div className="space-y-3 mb-8">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Type <span className="text-red-600">delete</span> to confirm:
                </label>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="delete"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1E293B] px-4 py-3 text-sm text-slate-700 dark:text-slate-200 outline-none transition-all focus:border-slate-500 dark:focus:border-slate-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setTalentToDelete(null);
                  setConfirmationText("");
                }}
                className="flex-1 py-4 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={confirmationText !== "delete"}
                className="flex-[1.5] py-4 bg-red-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-red-200 hover:bg-red-600 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-500"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <EditTalentModal
        isOpen={isEditOpen}
        talent={editingTalent}
        onClose={() => {
          setIsEditOpen(false);
          setEditingTalent(null);
        }}
        onUpdate={(talent, event) => handleUpdate(talent, event)}
        isLoading={isUpdating}
      />

      {/* Detail Modal - Full Data Display */}
      {detailModalOpen && selectedTalent && (
        <div
          className={
            "fixed inset-0 bg-black/60 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
          }
        >
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-8 relative scrollbar-hide border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-start mb-8">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-2xl bg-[#1B3A5B] dark:bg-slate-700 flex items-center justify-center text-3xl font-bold text-white uppercase shadow-lg shadow-[#1B3A5B]/20 dark:shadow-slate-700/20">
                  {selectedTalent.name?.[0] || "?"}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black text-[#1B3A5B] dark:text-slate-100">
                      {selectedTalent.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-slate-400 dark:text-slate-500">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${getStatusBadgeStyle(
                          getTalentStatusValue(selectedTalent),
                        )}`}
                      >
                        {getTalentStatusValue(selectedTalent) || "-"}
                      </span>
                      <Clock size={12} />
                      <span className="text-[10px] font-medium">
                        Last updated: {formatDate(selectedTalent.last_update)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setDetailModalOpen(false);
                  setSelectedTalent(null);
                }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-700 dark:text-slate-300"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-5">
                <h4 className="text-[11px] font-bold text-black dark:text-slate-100 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800 pb-2">
                  Personal Information
                </h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div>
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter mb-0.5">
                      Contact Person
                    </p>
                    {selectedTalent.contactPerson ? (
                      <a
                        href={`https://wa.me/${selectedTalent.contactPerson.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1 hover:underline"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.672 1.43 5.661 1.43h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        {selectedTalent.contactPerson}
                      </a>
                    ) : (
                      <p className="text-xs font-bold text-slate-300 dark:text-slate-500">
                        -
                      </p>
                    )}
                  </div>
                  <DetailItem
                    label="Umur"
                    value={`${selectedTalent.umur || "-"} Tahun`}
                  />
                  <DetailItem label="Religion" value={selectedTalent.agama} />
                  <DetailItem
                    label="Occupation"
                    value={selectedTalent.pekerjaan}
                  />
                  <DetailItem label="Ethnicity" value={selectedTalent.suku} />
                  <DetailItem label="Hobby" value={selectedTalent.hobby} />
                  <DetailItem
                    label="Education"
                    value={selectedTalent.tempatKuliah}
                  />
                  <DetailItem
                    label="Domisili / Location"
                    value={selectedTalent.domisili}
                  />
                </div>
              </div>

              <div className="space-y-5">
                <h4 className="text-[11px] font-bold text-black dark:text-slate-100 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800 pb-2">
                  Social Media & Insight
                </h4>
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                      Instagram Account
                    </p>
                    {selectedTalent.igAccount ? (
                      <a
                        href={`https://instagram.com/${selectedTalent.igAccount.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold text-blue-600 flex items-center gap-2 hover:underline"
                      >
                        <Instagram size={16} />
                        <span>
                          {selectedTalent.igAccount.startsWith("@")
                            ? selectedTalent.igAccount
                            : `@${selectedTalent.igAccount}`}
                        </span>
                      </a>
                    ) : (
                      <p className="text-sm font-bold text-slate-300 dark:text-slate-500">
                        -
                      </p>
                    )}
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                      Alasan Jadi Talent
                    </p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-100">
                      {selectedTalent.alasan || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TalentTable;
