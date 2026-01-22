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
  tier: string;
  monthlyImpressions?: number[];
  youtube_username?: string;
  youtube_subscriber?: number;
  last_update?: string;
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
  // Props Filter Advanced
  selectedReligion: string;
  setSelectedReligion: (val: string) => void;
  selectedTier: string;
  setSelectedTier: (val: string) => void;
  selectedAgeRange: string;
  setSelectedAgeRange: (val: string) => void;
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
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
}: TalentViewProps) {
  const [selectedDetail, setSelectedDetail] = useState<Talent | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const bstr = event.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        // Convert Excel ke JSON
        const rawData: any[] = XLSX.utils.sheet_to_json(ws);

        if (rawData.length === 0) return alert("File kosong!");

        // Konfirmasi sebelum hajar upload
        if (!confirm(`Yakin mau import ${rawData.length} data talent?`)) return;

        // Looping kirim ke API Talent lo
        for (const row of rawData) {
          await fetch("/API/Talent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: row["Nama Talent"] || row.name,
              tier: row.Tier || "Nano",
              status: row.Status || "Active",
              category: row.Kategori || row.category,
              domisili: row.Domisili || row.domisili,
              igAccount: row["Instagram Username"] || row.igAccount,
              igFollowers: Number(row["Instagram Followers"]) || 0,
              tiktokAccount: row["TikTok Username"] || row.tiktokAccount,
              tiktokFollowers: Number(row["TikTok Followers"]) || 0,
              rateCard: Number(row["Rate Card (IDR)"]) || 0,
              contactPerson: String(row["Contact Person"] || ""),
              umur: String(row.Umur || ""),
              pekerjaan: row.Pekerjaan || "",
              tempatKuliah: row["Pendidikan/Kampus"] || "",
              suku: row["Suku/Ethnicity"] || "",
              agama: row.Agama || "",
              zodiac: row.Zodiac || "",
              hobby: row.Hobby || "",
              alasan: row["Alasan Bergabung"] || "",
              last_update: new Date().toISOString(),
            }),
          });
        }

        alert("Import Berhasil! Refresh halaman untuk melihat data.");
        window.location.reload(); // Paksa refresh biar data muncul
      } catch (err) {
        console.error(err);
        alert("Gagal membaca file Excel. Pastikan format kolom benar.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExportExcel = () => {
    // Ambil data yang sudah di-filter (bukan seluruh database)
    const dataToExport = filteredTalent.map((t, index) => ({
      No: index + 1,
      "Nama Talent": t.name,
      Tier: t.tier,
      Status: t.status,
      Kategori: t.category,
      Domisili: t.domisili,
      "Instagram Username": t.igAccount,
      "Instagram Followers": t.igFollowers,
      "TikTok Username": t.tiktokAccount,
      "TikTok Followers": t.tiktokFollowers,
      "Total Followers": t.totalFollowers,
      "Rate Card (IDR)": t.rateCard,
      "Contact Person": t.contactPerson,
      Umur: t.umur,
      Pekerjaan: t.pekerjaan,
      "Pendidikan/Kampus": t.tempatKuliah,
      "Suku/Ethnicity": t.suku,
      Agama: t.agama,
      Zodiac: t.zodiac,
      Hobby: t.hobby,
      "Alasan Bergabung": t.alasan,
    }));

    // Mengatur lebar kolom otomatis (opsional tapi biar rapi)
    const columnWidths = [
      { wch: 5 }, // No
      { wch: 25 }, // Nama
      { wch: 10 }, // Tier
      { wch: 10 }, // Status
      { wch: 15 }, // Kategori
      { wch: 20 }, // Domisili
      { wch: 20 }, // IG
      { wch: 15 }, // IG Followers
      { wch: 20 }, // TikTok
      { wch: 15 }, // TikTok Followers
      { wch: 15 }, // Total
      { wch: 15 }, // Rate Card
      { wch: 20 }, // CP
      { wch: 8 }, // Umur
      { wch: 20 }, // Pekerjaan
      { wch: 25 }, // Pendidikan
      { wch: 15 }, // Suku
      { wch: 12 }, // Agama
      { wch: 12 }, // Zodiac
      { wch: 25 }, // Hobby
      { wch: 50 }, // Alasan
    ];

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Talent Lengkap");

    // Download file dengan nama yang ada tanggalnya
    const date = new Date().toISOString().split("T")[0];
    XLSX.writeFile(workbook, `Database_Talent_Export_${date}.xlsx`);
  };
  const isFilterActive =
    selectedReligion !== "All" ||
    selectedTier !== "All" ||
    selectedAgeRange !== "All" ||
    selectedStatus !== "All" ||
    selectedCategory !== "All";

  // Hitung indeks data
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredTalent.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTalent.length / rowsPerPage);

  // Reset ke halaman 1 jika hasil filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedTier, selectedReligion]);

  function setTalentToDelete(selectedDetail: Talent) {
    throw new Error("Function not implemented.");
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

            <div className="flex items-center gap-2 bg-white px-3 py-2 border border-slate-200 rounded-xl shadow-sm">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-bold text-slate-700 outline-none bg-transparent cursor-pointer"
              >
                <option value="name-asc">A-Z</option>
                <option value="name-desc">Z-A</option>
                <option value="rate-high">Rate: High to Low</option>
                <option value="rate-low">Rate: Low to High</option>
                <option value="followers-high">Most Followers</option>
                <option value="age-old">Age: Oldest</option>
                <option value="age-young">Age: Youngest</option>
              </select>
            </div>
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
            <FilterSelect
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
            />
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
              <th className="p-5">Talent & Socials</th>
              <th className="p-5">Domisili</th>
              <th className="p-5 text-center">Followers ig</th>
              <th className="p-5 text-center">Tier</th>
              <th className="p-5 text-center">Status</th>
              <th className="p-5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {/* Ganti bagian ini */}
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
                        href={`https://wa.me/${selectedDetail.contactPerson.replace(
                          /[^0-9]/g,
                          "",
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1 hover:underline"
                      >
                        {/* Ikon WhatsApp sederhana atau Phone */}
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.672 1.43 5.661 1.43h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        {selectedDetail.contactPerson}
                      </a>
                    ) : (
                      <p className="text-xs font-bold text-slate-300">-</p>
                    )}
                  </div>
                  <DetailItem label="Tier Class" value={selectedDetail.tier} />
                  <DetailItem
                    label="Age"
                    value={`${selectedDetail.umur} Years Old`}
                  />
                  <DetailItem label="Ethnicity" value={selectedDetail.suku} />
                  <DetailItem label="Religion" value={selectedDetail.agama} />
                  <DetailItem label="Zodiac" value={selectedDetail.zodiac} />
                  <DetailItem label="Hobby" value={selectedDetail.hobby} />
                  <DetailItem
                    label="Occupation"
                    value={selectedDetail.pekerjaan}
                  />
                  <DetailItem
                    label="Education"
                    value={selectedDetail.tempatKuliah}
                  />
                  <DetailItem
                    label="Domisili / Location"
                    value={selectedDetail.domisili}
                  />
                </div>
              </div>

              {/* KOLOM KANAN: BUSINESS & SOCIALS */}
              <div className="space-y-5">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">
                  Social Media & Business
                </h4>

                {/* SOCIAL LINKS */}
                <div className="space-y-3">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">
                      Instagram Profile
                    </p>
                    <a
                      href={`https://instagram.com/${selectedDetail.igAccount.replace(
                        "@",
                        "",
                      )}`}
                      target="_blank"
                      className="text-sm font-bold text-blue-600 flex items-center gap-2 hover:underline"
                    >
                      <Instagram size={16} /> {selectedDetail.igAccount}
                      <span className="text-[11px] text-slate-400 font-medium">
                        ({selectedDetail.igFollowers.toLocaleString()}{" "}
                        followers)
                      </span>
                    </a>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">
                      TikTok Profile
                    </p>
                    <a
                      href={`https://tiktok.com/@${selectedDetail.tiktokAccount.replace(
                        "@",
                        "",
                      )}`}
                      target="_blank"
                      className="text-sm font-bold text-pink-600 flex items-center gap-2 hover:underline"
                    >
                      {/* SVG TikTok */}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 50 50"
                        fill="currentColor"
                      >
                        <path d="M41,4H9C6.243,4,4,6.243,4,9v32c0,2.757,2.243,5,5,5h32c2.757,0,5-2.243,5-5V9C46,6.243,43.757,4,41,4z M37.006,22.323 c-0.227,0.021-0.457,0.035-0.69,0.035c-2.623,0-4.928-1.349-6.269-3.388c0,5.349,0,11.435,0,11.537c0,4.709-3.818,8.527-8.527,8.527 s-8.527-3.818-8.527-8.527s3.818-8.527,8.527-8.527c0.178,0,0.352,0.016,0.527,0.027v4.202c-0.175-0.021-0.347-0.053-0.527-0.053 c-2.404,0-4.352,1.948-4.352,4.352s1.948,4.352,4.352,4.352s4.527-1.894,4.527-4.298c0-0.095,0.042-19.594,0.042-19.594h4.016 c0.378,3.591,3.277,6.425,6.901,6.685V22.323z" />
                      </svg>
                      {selectedDetail.tiktokAccount}
                      <span className="text-[11px] text-slate-400 font-medium">
                        ({selectedDetail.tiktokFollowers.toLocaleString()}{" "}
                        followers)
                      </span>
                    </a>
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
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
                      (
                      {(selectedDetail.youtube_subscriber || 0).toLocaleString(
                        "id-ID",
                      )}{" "}
                      subs)
                    </span>
                  </a>
                </div>
              </div>

              {/* FOOTER: ALASAN BERGABUNG (FULL WIDTH) */}
              <div className="col-span-1 md:col-span-2 space-y-2 mt-4 bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                <h4 className="text-[11px] font-bold text-[#1B3A5B] uppercase tracking-[0.2em]">
                  Reason for Joining
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  "
                  {selectedDetail.alasan ||
                    "No additional information provided."}
                  "
                </p>
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
                <button className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-95">
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
  const [followers, setFollowers] = useState<number>(t.igFollowers || 0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // Di dalam useEffect TalentRow
    const sync = async () => {
      if (!t.igAccount) return;

      setSyncing(true);
      try {
        const username = (t.igAccount.split("/").pop() || "").replace("@", "");
        const res = await fetch(`/API/instagram?username=${username}`);

        // CEK DISINI: Jangan langsung .json() kalau statusnya bukan 200
        if (!res.ok) {
          console.error(`Server error: ${res.status}`);
          return;
        }

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.error("Dapetnya bukan JSON tapi HTML/Text!");
          return;
        }

        const data = await res.json();
        if (data.followers) {
          setFollowers(data.followers);
          // ... lanjut simpan ke DB
        }
      } catch (err) {
        console.error("Gagal sinkronisasi", err);
      } finally {
        setSyncing(false);
      }
    };

    sync();
  }, [t.igAccount]);
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
          <MapPin size={12} className="text-slate-400" /> {t.domisili}
        </div>
      </td>
      <td className="p-5 text-center">
        <div className="flex flex-col items-center justify-center">
          <span
            className={`font-bold ${syncing ? "text-blue-500 animate-pulse" : "text-slate-700"}`}
          >
            {followers.toLocaleString()}
          </span>
          {syncing && (
            <span className="text-[8px] text-blue-400 uppercase font-black">
              Syncing...
            </span>
          )}
        </div>
      </td>
      {/* ... Sisa kolom Tier, Status, dan Action sama seperti kode lama kamu ... */}
      <td className="p-5 text-center">
        <span
          className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
            t.tier === "Mega"
              ? "bg-purple-100 text-purple-700 border border-purple-200"
              : t.tier === "Macro"
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : t.tier === "Micro"
                  ? "bg-cyan-100 text-cyan-700 border border-cyan-200"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
          }`}
        >
          {t.tier || "Nano"}
        </span>
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
