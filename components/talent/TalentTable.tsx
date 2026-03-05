"use client";

import React, { useState, useMemo } from "react";
import { Talent } from "@/types";
import { formatDate } from "@/types";
import { ChevronDown, Eye, RefreshCw, Pencil, Trash2, X, MapPin, Instagram, Phone, Users, Heart, Cake, Briefcase, GraduationCap, AlertCircle } from "lucide-react";

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
  onDelete: (id: number) => void;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const itemsPerPage = 10;

  // Filter only internal talent (source === "talent")
  const internalTalents = useMemo(() => {
    return filteredAndSortedTalents.filter(
      (item) =>
        item.source?.toLowerCase() === "talent" ||
        item.source?.toLowerCase() === "talent"
    );
  }, [filteredAndSortedTalents]);

  // Apply search filter
  const searchFilteredTalents = useMemo(() => {
    if (!searchTerm.trim()) return internalTalents;

    const searchLower = searchTerm.toLowerCase();
    return internalTalents.filter((talent) => {
      const name = talent.name?.toLowerCase() || "";
      const email = talent.email?.toLowerCase() || "";
      const phone = talent.contactPerson?.toLowerCase() || "";
      const status = talent.status?.toLowerCase() || "";

      return (
        name.includes(searchLower) ||
        email.includes(searchLower) ||
        phone.includes(searchLower) ||
        status.includes(searchLower)
      );
    });
  }, [searchTerm, internalTalents]);

  // Apply status filter
  const statusFilteredTalents = useMemo(() => {
    if (!selectedStatus || selectedStatus === "All") {
      return searchFilteredTalents;
    }
    return searchFilteredTalents.filter(
      (talent) => talent.status === selectedStatus
    );
  }, [selectedStatus, searchFilteredTalents]);

  // Pagination
  const totalPages = Math.ceil(statusFilteredTalents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTalents = statusFilteredTalents.slice(startIndex, endIndex);

  const handleEdit = (talent: Talent) => {
    setTalentToEdit(talent);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (talent: Talent) => {
    setTalentToDelete(talent);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (talentToDelete) {
      onDelete(talentToDelete.id);
      setShowDeleteModal(false);
      setTalentToDelete(null);
    }
  };

  const handleManualSync = async (talent: Talent) => {
    // Check if at least one account exists
    if (
      (!talent.igAccount || talent.igAccount === "-") &&
      (!talent.tiktokAccount || talent.tiktokAccount === "-")
    ) {
      alert("Username IG & TikTok kosong, tidak ada yang bisa di-sync.");
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

      if (talent.tiktokAccount && talent.tiktokAccount !== "-") {
        const ttUser = talent.tiktokAccount.replace("@", "").trim();
        const ttUrl = `/api/tiktok?username=${encodeURIComponent(ttUser)}&id=${talent.id}`;
        syncTasks.push(fetch(ttUrl));
      }

      console.log(`[Sync] Menjalankan ${syncTasks.length} task sync...`);
      const results = await Promise.all(syncTasks);

      results.forEach((res, i) => {
        if (!res.ok)
          console.error(`Task ke-${i + 1} gagal dengan status ${res.status}`);
      });

      // Refresh data after sync
      onRefresh();
      alert("Sync berhasil! Data telah diperbarui.");
    } catch (err) {
      console.error("Manual sync failed", err);
      alert("Ada error saat sync, cek koneksi atau limit API.");
    } finally {
      setSyncingId(null);
      setOpenDropdown(null);
    }
  };

  const handleDetailClick = (talent: Talent) => {
    setSelectedTalent(talent);
    setDetailModalOpen(true);
    setOpenDropdown(null);
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700 border border-green-200";
      case "inactive":
        return "bg-red-100 text-red-700 border border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading internal talent data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-6 text-slate-800">
        Talent Management
      </h1>

      {/* Action Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        {/* Add New Button */}
        <button
          onClick={() => {
            setTalentToEdit(null);
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Total Talent</div>
          <div className="text-2xl font-bold text-gray-900">
            {internalTalents.length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {
              internalTalents.filter(
                (t) => t.status?.toLowerCase() === "active"
              ).length
            }
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Inactive</div>
          <div className="text-2xl font-bold text-red-600">
            {
              internalTalents.filter(
                (t) => t.status?.toLowerCase() === "inactive"
              ).length
            }
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Domisili
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Instagram Account
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Pekerjaan
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedTalents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
                      <p className="text-lg font-medium">No talent found</p>
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
                    ? (talent.igAccount.startsWith('@') ? talent.igAccount : `@${talent.igAccount}`)
                    : '-';

                  return (
                    <tr
                      key={talent.id}
                      className="hover:bg-gray-50 transition-colors"
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
                            <div className="text-sm font-medium text-gray-900">
                              {talent.name || "N/A"}
                            </div>
                            {talent.email && (
                              <div className="text-xs text-gray-500">
                                {talent.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Domisili */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {talent.domisili || "-"}
                          </span>
                        </div>
                      </td>

                      {/* Instagram Account */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Instagram size={14} className="text-pink-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {igUsername}
                          </span>
                        </div>
                      </td>

                      {/* Pekerjaan */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Briefcase size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {talent.pekerjaan || "-"}
                          </span>
                        </div>
                      </td>

                      {/* Actions - Dropdown */}
                      <td className="px-6 py-4 text-center">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() =>
                              setOpenDropdown(
                                isDropdownOpen ? null : talent.id
                              )
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
                                className={`absolute right-0 w-40 bg-white border border-slate-100 rounded-xl shadow-xl z-20 py-2 animate-in fade-in zoom-in duration-200 ${
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
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                  <Eye size={14} className="text-blue-500" />{" "}
                                  Detail
                                </button>

                                <button
                                  onClick={() => handleManualSync(talent)}
                                  disabled={isSyncing}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
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
                                    handleEdit(talent);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                  <Pencil size={14} className="text-amber-500" />{" "}
                                  Edit
                                </button>

                                <div className="h-px bg-slate-100 my-1 mx-2"></div>

                                <button
                                  onClick={() => {
                                    handleDeleteClick(talent);
                                    setOpenDropdown(null);
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, statusFilteredTalents.length)} of{" "}
              {statusFilteredTalents.length} entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && talentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirm Delete
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Are you sure you want to delete{" "}
                  <span className="font-medium">{talentToDelete.name}</span>?
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setTalentToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal - Full Data Display */}
      {detailModalOpen && selectedTalent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full my-8 shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5 rounded-t-xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xl">
                    {selectedTalent.name?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedTalent.name}
                  </h2>
                  <p className="text-blue-100 text-sm">Detail Informasi Talent</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setDetailModalOpen(false);
                  setSelectedTalent(null);
                }}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Nama */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Users size={18} className="text-blue-600" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Nama Lengkap
                    </span>
                  </div>
                  <p className="text-base font-medium text-gray-900">
                    {selectedTalent.name || "-"}
                  </p>
                </div>

                {/* Domisili */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin size={18} className="text-green-600" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Domisili
                    </span>
                  </div>
                  <p className="text-base font-medium text-gray-900">
                    {selectedTalent.domisili || "-"}
                  </p>
                </div>

                {/* Instagram Account */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Instagram size={18} className="text-pink-600" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Instagram Account
                    </span>
                  </div>
                  <p className="text-base font-medium text-gray-900">
                    {selectedTalent.igAccount 
                      ? (selectedTalent.igAccount.startsWith('@') 
                          ? selectedTalent.igAccount 
                          : `@${selectedTalent.igAccount}`)
                      : "-"}
                  </p>
                </div>

                {/* No. HP */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Phone size={18} className="text-purple-600" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      No. HP
                    </span>
                  </div>
                  <p className="text-base font-medium text-gray-900">
                    {selectedTalent.contactPerson || "-"}
                  </p>
                </div>

                {/* Suku */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Users size={18} className="text-orange-600" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Suku
                    </span>
                  </div>
                  <p className="text-base font-medium text-gray-900">
                    {selectedTalent.suku || "-"}
                  </p>
                </div>

                {/* Agama */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Heart size={18} className="text-red-600" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Agama
                    </span>
                  </div>
                  <p className="text-base font-medium text-gray-900">
                    {selectedTalent.agama || "-"}
                  </p>
                </div>

                {/* Alasan Jadi Talent */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 md:col-span-2">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle size={18} className="text-indigo-600" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Alasan Jadi Talent
                    </span>
                  </div>
                  <p className="text-base font-medium text-gray-900">
                    {selectedTalent.alasan || "-"}
                  </p>
                </div>

                {/* Hobby */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Heart size={18} className="text-pink-600" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Hobby
                    </span>
                  </div>
                  <p className="text-base font-medium text-gray-900">
                    {selectedTalent.hobby || "-"}
                  </p>
                </div>

                {/* Umur */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Cake size={18} className="text-yellow-600" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Umur
                    </span>
                  </div>
                  <p className="text-base font-medium text-gray-900">
                    {selectedTalent.umur ? `${selectedTalent.umur} tahun` : "-"}
                  </p>
                </div>

                {/* Pekerjaan */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Briefcase size={18} className="text-cyan-600" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Pekerjaan
                    </span>
                  </div>
                  <p className="text-base font-medium text-gray-900">
                    {selectedTalent.pekerjaan || "-"}
                  </p>
                </div>

                {/* Status */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle size={18} className="text-emerald-600" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </span>
                  </div>
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeStyle(
                      selectedTalent.status
                    )}`}
                  >
                    {selectedTalent.status || "Unknown"}
                  </span>
                </div>

                {/* Universitas / Tempat Kuliah */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 md:col-span-2">
                  <div className="flex items-center gap-3 mb-2">
                    <GraduationCap size={18} className="text-blue-600" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Universitas / Tempat Kuliah
                    </span>
                  </div>
                  <p className="text-base font-medium text-gray-900">
                    {selectedTalent.tempatKuliah || "-"}
                  </p>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setDetailModalOpen(false);
                  setSelectedTalent(null);
                }}
                className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  handleEdit(selectedTalent);
                  setDetailModalOpen(false);
                  setSelectedTalent(null);
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                <Pencil size={16} />
                Edit Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TalentTable;
