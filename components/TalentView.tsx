"use client";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
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

interface Talent {
  id: number;
  name: string;
  domisili: string;
  igAccount: string;
  igFollowers: number;
  tiktokAccount: string;
  tiktokFollowers: number;
  totalFollowers: number;
  contactPerson: string;
  suku: string;
  agama: string;
  alasan: string;
  hobby: string;
  umur: string;
  pekerjaan: string;
  zodiac: string;
  tempatKuliah: string;
  category: string;
  rateCard: number;
  status: string;
  tier_ig: string;
  tier_tiktok: string;
  er: string;
  source: string;
  monthlyImpressions?: number[];
  youtube_username?: string;
  youtube_subscriber?: number;
  last_update?: string;
  email?: string;
  hijab?: string;
  gender?: string;
}

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
  selectedTier: string;
  setSelectedTier: (val: string) => void;
  selectedAgeRange: string;
  setSelectedAgeRange: (val: string) => void;
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
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
  onRefresh,
  isLoading,
}: TalentViewProps) {
  const [selectedDetail, setSelectedDetail] = useState<Talent | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isImporting, setIsImporting] = useState(false);
  const [talentToDelete, setTalentToDelete] = useState<Talent | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [selectedSource, setSelectedSource] = useState("All");

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
      // 1. Cek apakah formatnya DD-MM-YYYY (pake strip)
      // Kita pecah: "22-01-2026 16:29:52" -> ["22", "01", "2026 16:29:52"]
      const parts = dateString.split("-");

      let date;
      if (parts.length === 3) {
        const day = parts[0];
        const month = parts[1];
        const yearWithTime = parts[2]; // "2026 16:29:52"

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
  if (!filteredTalent || filteredTalent.length === 0) return;

  const confirmRefresh = confirm(`Update real-time ${filteredTalent.length} talent?`);
  if (!confirmRefresh) return;

  console.log("Memulai Sinkronisasi Real-time...");

  for (const talent of filteredTalent) {
    if (!talent.igAccount || talent.igAccount === "-") continue;

    try {
      const username = talent.igAccount.replace("@", "").trim();
      // 1. Tembak API
      const res = await fetch(`/API/instagram?username=${username}&id=${talent.id}`);
      const data = await res.json();
      
      if (data.success) {
        console.log(`✅ @${username} updated: ${data.followers}`);
        onRefresh(); 
      } else {
        console.warn(`⚠️ @${username}: ${data.error}`);
      }
      
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.error(`❌ Gagal update @${talent.igAccount}`);
    }
  }

};
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const bstr = event.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];

        // Pakai range: 1 karena header lo ada di baris ke-2
        const rawData: any[] = XLSX.utils.sheet_to_json(ws, { range: 1 });

        // Filter
        const cleanData = rawData.filter((row) => row["Name"]);

        if (cleanData.length === 0)
          return alert("Header 'Name' tidak ditemukan atau file kosong!");
        if (!confirm(`Yakin mau import ${cleanData.length} talent?`)) return;

        for (const row of cleanData) {
          // Helper biar followers gak rusak
          const cleanNum = (v: any) => {
            if (!v || v === "-" || v === "N/A") return ""; // Samain dengan manual Add ("")
            return String(v).replace(/\D/g, "");
          };

          const payload = {
            // Kunci-kunci ini HARUS sama persis dengan yang di handleSaveTalent (Page.tsx)
            name: String(row["Name"] || ""),
            domicile: "-",
            instagram_username: String(row["Username_Instagram"] || ""),
            instagram_followers: cleanNum(row["Followers_Instagram"]),
            tiktok_username: String(row["Username_Tiktok"] || "-"),
            tiktok_followers: cleanNum(row["Followers_Tiktok"]),
            youtube_username: "-",
            youtube_subscriber: "",
            contact_person: String(row["Phone Number"] || ""),
            ethnicity: "-",
            religion: "Other",
            reason_for_joining: "-",
            hobby: "-",
            age: "",
            occupation: "-",
            zodiac: "-",
            university: "-",
            category: String(row["Category"] || "Beauty"),
            rate_card: "",
            status: "active",
            tier: String(row["Tier"] || "Nano"),
            last_update: new Date().toISOString(),
            email: String(row["Email"] || "-"),
            hijab: String(row["Hijab/Non"] || "no")
              .toLowerCase()
              .includes("non")
              ? "no"
              : "yes",
            gender: String(row["Gender"] || "-"),
          };

          console.log("Kirim payload import:", payload);

          await fetch("/API/Talent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }

        alert(`Beres! ${cleanData.length} data sukses diproses.`);
        onRefresh(); // Supaya Page.tsx narik data terbaru ke tabel
      } catch (err) {
        console.error(err);
        alert("Format file salah atau sistem error.");
      } finally {
        // setIsImporting(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExportExcel = () => {
    const dataToExport = filteredTalent.map((t, index) => ({
      No: index + 1,
      Name: t.name,
      "IG Username": t.igAccount,
      "IG Followers": t.igFollowers,
      "IG Tier": t.tier_ig,
      "TikTok Username": t.tiktokAccount,
      "TikTok Followers": t.tiktokFollowers,
      Category: t.category,
      Gender: t.gender,
      "Hijab Status": t.hijab === "yes" ? "Hijab" : "Non Hijab",
      Email: t.email,
      "Phone Number": t.contactPerson,
      "Last Updated": t.last_update,
    }));

    const handleSyncInstagram = async (talent: Talent) => {
  try {
    // 1. Ambil username tanpa @
    const username = talent.igAccount.replace("@", "");
    
    // 2. Tembak API Route Backend
    const res = await fetch(`/API/instagram?username=${username}&id=${talent.id}`);
    const data = await res.json();

    if (data.success) {
      // 3. Panggil onRefresh (fungsi dari Page.tsx) untuk menarik data terbaru dari DB ke Tabel
      onRefresh(); 
      alert(`Berhasil sinkronisasi @${username}! Followers: ${data.followers.toLocaleString()}`);
    } else {
      alert("Gagal sinkronisasi: " + (data.error || "Unknown error"));
    }
  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan koneksi.");
  }
};

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // Atur lebar kolom biar gak berantakan pas dibuka
    worksheet["!cols"] = [
      { wch: 5 },
      { wch: 25 },
      { wch: 20 },
      { wch: 15 },
      { wch: 10 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 12 },
      { wch: 25 },
      { wch: 20 },
      { wch: 25 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "KOL Database");
    const date = new Date().toISOString().split("T")[0];
    XLSX.writeFile(workbook, `Cretivox_Talent_Export_${date}.xlsx`);
  };
  const isFilterActive =
    selectedReligion !== "All" ||
    selectedTier !== "All" ||
    selectedAgeRange !== "All" ||
    selectedStatus !== "All" ||
    selectedCategory !== "All";
    selectedSource !== "All";

  // Hitung indeks data
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredTalent.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTalent.length / rowsPerPage);

  // Reset ke halaman 1 jika hasil filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedTier, selectedReligion]);

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
              onChange={setSelectedReligion}
              options={[

                "Instagram",
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
              ]}
            />
            <FilterSelect
              placeholder="All Tier"
              value={selectedTier}
              onChange={setSelectedTier}
              options={["Mega", "Macro", "Micro", "Nano"]}
            />
            <FilterSelect
              placeholder="All Age"
              value={selectedAgeRange}
              onChange={setSelectedAgeRange}
              options={["10-20", "21-30", "31-40", "41-50", "51++"]}
            />
            <FilterSelect
              placeholder="All Status"
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={["Active", "Inactive"]}
            />
            {/* <FilterSelect
              placeholder="All Category"
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={[
                "Lifestyle",
                "Beauty",
                "Food",
                "Travel",
                "Gaming",
                "Finance",
              ]}
            /> */}
          </div>
          <div className="ml-auto flex gap-4">
            <div className="relative group">
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleImportExcel}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                title="Import Data"
              />
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all group-hover:scale-105">
                <Download size={18} className="" />{" "}
              </button>
            </div>
            <button
              onClick={handleExportExcel}
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
                field="igFollowers"
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

{/* ================= MODAL DETAIL POP-UP ================= */}
{selectedDetail && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
    <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-8 relative scrollbar-hide">
      {/* HEADER MODAL */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex gap-4">
          <div className="w-20 h-20 rounded-2xl bg-[#1B3A5B] flex items-center justify-center text-3xl font-bold text-white uppercase shadow-lg shadow-[#1B3A5B]/20">
            {selectedDetail.name[0]}
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#1B3A5B] mb-1">
              {selectedDetail.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-2 text-slate-400">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-slate-100 text-[#1B3A5B] text-[10px] font-bold rounded-md uppercase tracking-wider">
                  {selectedDetail.category}
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                    selectedDetail.status === "Active"
                      ? "bg-green-100 text-green-600"
                      : "bg-orange-100 text-orange-600"
                  }`}
                >
                  {selectedDetail.status}
                </span>
                <Clock size={12} />
                <span className="text-[10px] font-medium">
                  Last updated: {formatDate(selectedDetail.last_update)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => setSelectedDetail(null)}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
        >
          <Plus size={24} className="rotate-45" />
        </button>
      </div>

      {/* BODY MODAL: GRID 2 KOLOM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        {/* KOLOM KIRI: PERSONAL INFO */}
        <div className="space-y-5">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">
            Personal Information
          </h4>
          <div className="grid grid-cols-2 gap-y-4 gap-x-2">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">
                Contact Person
              </p>
              {selectedDetail.contactPerson ? (
                <a
                  href={`https://wa.me/${selectedDetail.contactPerson.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1 hover:underline"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.672 1.43 5.661 1.43h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {selectedDetail.contactPerson}
                </a>
              ) : (
                <p className="text-xs font-bold text-slate-300">-</p>
              )}
            </div>
            {/* TIER CLASS SUDAH DIHAPUS DARI SINI */}
            <DetailItem label="Age" value={`${selectedDetail.umur} Years Old`} />
            <DetailItem label="Ethnicity" value={selectedDetail.suku} />
            <DetailItem label="Religion" value={selectedDetail.agama} />
            <DetailItem label="Zodiac" value={selectedDetail.zodiac} />
            <DetailItem label="Hobby" value={selectedDetail.hobby} />
            <DetailItem label="Occupation" value={selectedDetail.pekerjaan} />
            <DetailItem label="Education" value={selectedDetail.tempatKuliah} />
            <DetailItem label="Domisili / Location" value={selectedDetail.domisili} />
            <DetailItem label="Gender" value={selectedDetail.gender || "-"} />
            <DetailItem label="Hijab Status" value={selectedDetail.hijab === "yes" ? "Hijab" : "Non-Hijab"} />
          </div>
        </div>

        {/* KOLOM KANAN: BUSINESS & SOCIALS */}
        <div className="space-y-5">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">
            Social Media & Business
          </h4>

          {/* SOCIAL LINKS */}
          <div className="space-y-4">
            {/* INSTAGRAM CARD */}
            <div className="relative bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-[9px] font-black px-2 py-0.5 rounded-lg shadow-md uppercase tracking-tighter">
                {selectedDetail.tier_ig || "Nano"}
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">
                Instagram Profile
              </p>
              <a
                href={`https://instagram.com/${selectedDetail.igAccount.replace("@", "")}`}
                target="_blank"
                className="text-sm font-bold text-blue-600 flex items-center gap-2 hover:underline"
              >
                <Instagram size={16} /> {selectedDetail.igAccount}
                <span className="text-[11px] text-slate-400 font-medium">
                  ({selectedDetail.igFollowers.toLocaleString()} followers)
                </span>
              </a>
            </div>

            {/* TIKTOK CARD */}
            <div className="relative bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="absolute -top-2 -right-2 bg-pink-600 text-white text-[9px] font-black px-2 py-0.5 rounded-lg shadow-md uppercase tracking-tighter">
                {selectedDetail.tier_tiktok || "Nano"}
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">
                TikTok Profile
              </p>
              <a
                href={`https://tiktok.com/@${selectedDetail.tiktokAccount.replace("@", "")}`}
                target="_blank"
                className="text-sm font-bold text-pink-600 flex items-center gap-2 hover:underline"
              >
                <svg width="16" height="16" viewBox="0 0 50 50" fill="currentColor">
                  <path d="M41,4H9C6.243,4,4,6.243,4,9v32c0,2.757,2.243,5,5,5h32c2.757,0,5-2.243,5-5V9C46,6.243,43.757,4,41,4z M37.006,22.323 c-0.227,0.021-0.457,0.035-0.69,0.035c-2.623,0-4.928-1.349-6.269-3.388c0,5.349,0,11.435,0,11.537c0,4.709-3.818,8.527-8.527,8.527 s-8.527-3.818-8.527-8.527s3.818-8.527,8.527-8.527c0.178,0,0.352,0.016,0.527,0.027v4.202c-0.175-0.021-0.347-0.053-0.527-0.053 c-2.404,0-4.352,1.948-4.352,4.352s1.948,4.352,4.352,4.352s4.527-1.894,4.527-4.298c0-0.095,0.042-19.594,0.042-19.594h4.016 c0.378,3.591,3.277,6.425,6.901,6.685V22.323z" />
                </svg>
                {selectedDetail.tiktokAccount}
                <span className="text-[11px] text-slate-400 font-medium">
                  ({selectedDetail.tiktokFollowers.toLocaleString()} followers)
                </span>
              </a>
            </div>

            {/* YOUTUBE CARD */}
            <div className="relative bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">
                Channel YouTube
              </p>
              <a
                href={`https://youtube.com/@${selectedDetail.youtube_username || ""}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-red-600 flex items-center gap-2 hover:underline"
              >
                <Youtube size={16} className="text-red-600" />{" "}
                {selectedDetail.youtube_username || "-"}
                <span className="text-[11px] text-slate-400 font-medium">
                  ({(selectedDetail.youtube_subscriber || 0).toLocaleString("id-ID")} subs)
                </span>
              </a>
            </div>

            {/* BUSINESS EMAIL CARD */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">
                Business Email
              </p>
              {selectedDetail.email && selectedDetail.email !== "-" ? (
                <a
                  href={`mailto:${selectedDetail.email}`}
                  className="text-sm font-bold text-slate-700 flex items-center gap-2 hover:text-[#1B3A5B] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {selectedDetail.email}
                </a>
              ) : (
                <p className="text-sm font-bold text-slate-300 italic">- No Email Provided -</p>
              )}
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="col-span-1 md:col-span-2 pt-4 flex gap-3">
          <button
            onClick={() => {
              onUpdate(selectedDetail);
              setSelectedDetail(null);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-600 shadow-lg shadow-amber-200 transition-all active:scale-95"
          >
            <Edit3 size={18} /> Edit Profile
          </button>
          <button
            onClick={() => {
              setTalentToDelete(selectedDetail);
              setSelectedDetail(null);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-95"
          >
            <Trash2 size={18} /> Delete Talent
          </button>
        </div>
      </div>
    </div>
  </div>
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
            {[5, 10, 20, 50, 100, 200].map((size) => (
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
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
                <Trash2 size={18} /> Delete Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Komponen Helper
function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">
        {label}
      </p>
      <p className="text-xs font-bold text-slate-700">{value || "-"}</p>
    </div>
  );
}

function FilterSelect({ value, onChange, options, placeholder }: any) {
  return (
    <div className="flex items-center bg-white px-3 py-2 border border-slate-200 rounded-xl shadow-sm hover:border-[#1B3A5B]/30 transition-all">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-xs font-bold text-slate-700 outline-none bg-transparent cursor-pointer"
      >
        <option value="All">{placeholder}</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function TalentRow({
  t,
  index,
  indexOfFirstItem,
  onDetailClick,
}: {
  t: Talent;
  index: number;
  indexOfFirstItem: number;
  onDetailClick: (t: Talent) => void;
}) {
  // 1. Gak perlu setFollowers lagi, pake data dari props t langsung
  const followers = t.igFollowers || 0;

  const calculateTier = (followers: number) => {
    if (followers >= 1000000) return "Mega";
    if (followers >= 100000) return "Macro";
    if (followers >= 10000) return "Micro";
    return "Nano";
  };

  return (
    <tr className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
      <td className="p-5 text-center font-bold text-slate-800">
        {indexOfFirstItem + index + 1}
      </td>
      <td className="p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1B3A5B] flex items-center justify-center font-bold text-white text-xs border border-slate-200">
            {t.name[0]}
          </div>
          <div>
            <p className="font-bold text-slate-800">{t.name}</p>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
              <Instagram size={10} className="text-pink-500" /> {t.igAccount}
            </div>
          </div>
        </div>
      </td>
      <td className="p-5">
        <div className="flex items-center gap-1.5 text-slate-600 font-medium text-xs">
          {t.source}
        </div>
      </td>
      {/* KOLOM FOLLOWERS IG */}
      <td className="p-5 text-center border-r border-slate-50">
        <div className="flex flex-col items-center justify-center">
          <span className="font-bold text-slate-700">
            {Number(t.igFollowers || 0).toLocaleString()}
          </span>
        </div>
      </td>

      {/* KOLOM FOLLOWERS TIKTOK */}
      <td className="p-5 text-center">
        <div className="flex flex-col items-center justify-center">
          <span className="font-bold text-slate-700">
            {Number(t.tiktokFollowers || 0).toLocaleString()}
          </span>
        </div>
      </td>
      <td className="p-5 text-center">
        <div className="flex flex-col gap-1 items-center">
          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[9px] font-bold uppercase border border-purple-100">
            IG: {t.tier_ig || t.tier_ig}
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-bold uppercase border border-blue-100">
            TT: {t.tier_tiktok || "Nano"}
          </span>
        </div>
      </td>
      <td className="p-5 text-center">
        <span
          className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase ${
            t.status === "Active"
              ? "bg-green-100 text-green-600"
              : "bg-orange-100 text-orange-600"
          }`}
        >
          {t.status}
        </span>
      </td>
      <td className="p-5 text-center">
        <button
          onClick={() => onDetailClick(t)}
          className="flex items-center gap-1 mx-auto bg-slate-100 hover:bg-[#1B3A5B] hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border border-slate-200 shadow-sm"
        >
          <Eye size={12} /> Detail
        </button>
      </td>
    </tr>
  );
}
