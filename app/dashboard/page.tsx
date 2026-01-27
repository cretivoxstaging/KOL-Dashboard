"use client";

import React, { useState, useEffect } from "react";
import { LayoutDashboard, Users, Calculator, LogOut, Menu } from "lucide-react";

import DashboardView from "../../components/DashboardView";
import TalentView from "../../components/TalentView";
import AddTalentModal from "../../components/AddTalentModal";
import TaxCalculatorView from "../../components/TaxCalculatorView";

// Interface untuk TypeScript agar tidak merah
interface Talent {
  id: number;
  name: string;
  tier_ig?: string; // Baru
  tier_tiktok?: string; // Baru
  er?: string; // Baru
  source?: string;
  domisili: string;
  igAccount: string;
  igFollowers: number;
  tiktokAccount: string;
  tiktokFollowers: number;
  youtube_username: string;
  youtube_subscriber: number;
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
  monthlyImpressions?: number[];
  tier: string;
  last_update?: string;
  email?: string;
  hijab?: string;
  gender?: string;
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "talent" | "tax">(
    "dashboard",
  );
  const [talents, setTalents] = useState<Talent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [talentToEdit, setTalentToEdit] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Untuk Mobile
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Tambahkan ini untuk Desktop minimize
  const [selectedReligion, setSelectedReligion] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedTier, setSelectedTier] = useState("All");
  const [selectedAgeRange, setSelectedAgeRange] = useState("All");
  const API_URL = "/API/Talent";

  // 1. Tambahkan state untuk Sorting di bagian atas komponen
  const [sortBy, setSortBy] = useState("update-desc");

  const getTimestamp = (dateString?: string) => {
    if (!dateString || dateString === "null" || dateString === "") return 0;
    try {
      const parts = dateString.split("-");
      if (parts.length === 3) {
        const day = parts[0];
        const month = parts[1];
        const yearWithTime = parts[2];
        // Susun ke format ISO: YYYY-MM-DDTHH:mm:ss
        const isoFormat = `${yearWithTime.split(" ")[0]}-${month}-${day}T${yearWithTime.split(" ")[1]}`;
        return new Date(isoFormat).getTime();
      }
      return new Date(dateString).getTime(); // Fallback buat format ISO
    } catch (e) {
      return 0;
    }
  };

  // 2. Logika Filtering & Sorting yang Digabung
  const filteredAndSortedTalents = talents
    .filter((t) => {
      // Search by Name or Ethnic
      const matchSearch =
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.suku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.igAccount?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter Agama
      const matchReligion =
        selectedReligion === "All" || t.agama === selectedReligion;

      // Filter Zodiac
      const matchStatus =
        selectedStatus === "All" || t.status === selectedStatus;

      const matchTier = selectedTier === "All" || t.tier === selectedTier;

      // Filter Umur (Range)
      const age = parseInt(t.umur) || 0;
      let ageRange = "All";
      if (age >= 10 && age <= 20) ageRange = "10-20";
      else if (age >= 21 && age <= 30) ageRange = "21-30";
      else if (age >= 31 && age <= 40) ageRange = "31-40";
      else if (age >= 41 && age <= 50) ageRange = "41-50";
      else if (age > 50) ageRange = "51++";

      const matchAge =
        selectedAgeRange === "All" || ageRange === selectedAgeRange;

      return (
        matchSearch && matchReligion && matchStatus && matchTier && matchAge
      );
    })
    .sort((a, b) => {
      // 1. Pecah dulu, misal "igFollowers-desc" jadi field="igFollowers" & order="desc"
      const [field, order] = sortBy.split("-");
      const isAsc = order === "asc";

      // 2. Gunakan 'field' di dalam switch, bukan 'sortBy'
      switch (field) {
        case "last_update":
        case "update": // Tambahkan case ini jika di header lo pake 'update'
          const timeA = getTimestamp(a.last_update);
          const timeB = getTimestamp(b.last_update);
          return isAsc ? timeA - timeB : timeB - timeA;

        case "name":
          return isAsc
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);

        case "igFollowers":
          // Pastikan convert ke Number biar aman
          const followersA = Number(a.igFollowers) || 0;
          const followersB = Number(b.igFollowers) || 0;
          return isAsc ? followersA - followersB : followersB - followersA;

        case "tier":
          const tierWeight: any = { Mega: 4, Macro: 3, Micro: 2, Nano: 1 };
          const weightA = tierWeight[a.tier] || 0;
          const weightB = tierWeight[b.tier] || 0;
          return isAsc ? weightA - weightB : weightB - weightA;

        default:
          // Fallback: Jika sortBy isinya "update-desc" tapi gak masuk case atas
          if (sortBy === "update-desc") {
            return getTimestamp(b.last_update) - getTimestamp(a.last_update);
          }
          return 0;
      }
    });

  const getTalents = async () => {
    const res = await fetch("/API/Talent");
    if (!res.ok) throw new Error("Gagal mengambil data");
    return res.json();
  };

  const createTalent = async (payload: any) => {
    const res = await fetch("/API/Talent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Gagal menambah talent");
    return res.json();
  };

  const updateTalent = async (id: string | number, payload: any) => {
    const res = await fetch(`/API/Talent/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Gagal update talent");
    return res.json();
  };

  const deleteTalent = async (id: string | number) => {
    const res = await fetch(`/API/Talent/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Gagal menghapus talent");
    return res.json();
  };

  // 1. FUNGSI LOAD DATA
  const loadTalents = async () => {
    try {
      setIsLoading(true);
      const result = await getTalents();
      if (result && result.data) {
        const mappedData = result.data.map((t: any) => {
          const ig = parseInt(t.instagram_followers) || 0;
          const tt = parseInt(t.tiktok_followers) || 0;
          const getTier = (foll: number) => {
            if (foll >= 1000000) return "Mega";
            if (foll >= 100000) return "Macro";
            if (foll >= 10000) return "Micro";
            return "Nano";
          };
          return {
            id: t.id,
            name: t.name,
            domisili: t.domicile,
            igAccount: t.instagram_username,
            igFollowers: ig,
            tiktokAccount: t.tiktok_username,
            tiktokFollowers: tt,
            totalFollowers: ig + tt,
            contactPerson: t.contact_person,
            suku: t.ethnicity,
            agama: t.religion,
            alasan: t.reason_for_joining,
            hobby: t.hobby,
            umur: t.age,
            pekerjaan: t.occupation,
            zodiac: t.zodiac,
            tempatKuliah: t.university,
            category: t.category || "Uncategorized",
            status: t.status === "active" ? "Active" : "Inactive",
            monthlyImpressions: t.monthly_impressions || [
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            ],
            tier_ig: t.tier_ig || "Nano",
            tier_tiktok: getTier(tt),
            er: t.er || "0%",
            source: t.source || "-",
            youtube_subscriber: t.youtube_subscriber,
            youtube_username: t.youtube_username || "",
            last_update: t.last_update,
            email: t.email || "-",
            hijab: t.hijab || "no",
            gender: t.gender || "-",
          };
        });
        setTalents(mappedData);
      }
    } catch (error) {
      console.error("Client Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      // 1. Reset sorting ke update terbaru (Descending)
      setSortBy("last_update-desc");

      // 2. Reset filters (Opsional, tapi bagus biar data murni kelihatan)
      setSearchTerm("");
      setSelectedCategory("All");
      setSelectedReligion("All");
      setSelectedStatus("All");
      setSelectedTier("All");
      setSelectedAgeRange("All");

      // 3. Ambil data ulang dari API
      await loadTalents();
    } catch (error) {
      console.error("Refresh Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTalents();
  }, []);

  // 2. FUNGSI SAVE (ADD & EDIT)
  const handleSaveTalent = async (formData: any) => {
    try {
      setIsLoading(true);

      // Inisialisasi data IG
      let currentIgFollowers = formData.igFollowers;
      let currentIgTier = formData.tier_ig;

      // Inisialisasi data TikTok
      let currentTtFollowers = formData.tiktokFollowers;
      let currentTtTier = formData.tier_tiktok;

      // JALANKAN SYNC OTOMATIS HANYA SAAT ADD NEW TALENT (Bukan Edit)
      if (!talentToEdit) {
        // 1. Sinkronisasi Instagram
        if (formData.igAccount && formData.igAccount !== "-") {
          try {
            const usernameIg = formData.igAccount.replace("@", "").trim();
            const resIg = await fetch(`/API/instagram?username=${usernameIg}`);
            const dataIg = await resIg.json();

            if (dataIg.success) {
              currentIgFollowers = dataIg.followers;
              currentIgTier = dataIg.tier;
              console.log("Auto-sync IG Success:", dataIg.followers);
            }
          } catch (err) {
            console.warn("Auto-sync IG failed.");
          }
        }

        // 2. Sinkronisasi TikTok (TAMBAHKAN INI)
        if (formData.tiktokAccount && formData.tiktokAccount !== "-") {
          try {
            const usernameTt = formData.tiktokAccount.replace("@", "").trim();
            const resTt = await fetch(`/API/tiktok?username=${usernameTt}`);
            const dataTt = await resTt.json();

            if (dataTt.success) {
              currentTtFollowers = dataTt.followers;
              currentTtTier = dataTt.tier;
              console.log("Auto-sync TikTok Success:", dataTt.followers);
            }
          } catch (err) {
            console.warn("Auto-sync TikTok failed.");
          }
        }
      }

      const payload = {
        name: formData.name,
        domicile: formData.domisili,
        instagram_username: formData.igAccount,
        instagram_followers: String(currentIgFollowers || "0"),
        tiktok_username: formData.tiktokAccount,
        tiktok_followers: String(currentTtFollowers || "0"), // Pakai hasil fetch TikTok
        youtube_username: formData.youtube_username,
        youtube_subscriber: String(formData.youtube_subscriber || "0"),
        contact_person: formData.contactPerson,
        ethnicity: formData.suku,
        religion: formData.agama,
        reason_for_joining: formData.alasan,
        hobby: formData.hobby,
        age: String(formData.umur),
        occupation: formData.pekerjaan,
        zodiac: formData.zodiac,
        university: formData.tempatKuliah,
        category: formData.category,
        rate_card: String(formData.rateCard || "0"),
        status: formData.status.toLowerCase(),
        tier_ig: currentIgTier,
        tier_tiktok: currentTtTier, // Pakai hasil fetch TikTok
        er: formData.er,
        source: talentToEdit ? formData.source : "RapidAPI",
        tier: currentIgTier, // Tier utama biasanya ikut IG
        last_update: new Date().toISOString(),
        email: formData.email,
        hijab: formData.hijab,
        gender: formData.gender,
      };

      if (talentToEdit) {
        await updateTalent(talentToEdit.id, payload);
      } else {
        await createTalent(payload);
      }

      await loadTalents();
      setIsModalOpen(false);
      setTalentToEdit(null);
    } catch (error: any) {
      alert("Gagal menyimpan: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. FUNGSI DELETE
  const handleDeleteTalent = async (id: number) => {
    try {
      setIsLoading(true);
      await deleteTalent(id);
      await loadTalents();
    } catch (error: any) {
    } finally {
      setIsLoading(false);
      // Reset state di TalentView akan ditangani via onClose modal
    }
  };

  const handleOpenEdit = (talent: any) => {
    setTalentToEdit(talent);
    setIsModalOpen(true);
  };

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const impressionData = months.map((m, i) => ({
    name: m,
    value:
      talents.length > 0
        ? talents.reduce(
            (acc, curr) => acc + (curr.monthlyImpressions?.[i] || 0),
            0,
          ) / talents.length
        : 0,
  }));

  function SidebarItem({ icon, label, active, collapsed, onClick }: any) {
    return (
      <button
        onClick={onClick}
        className={`
        w-full flex items-center gap-3 p-3 rounded-xl transition-all group
        ${
          active
            ? "bg-[#1B3A5B] text-white shadow-lg"
            : "text-slate-400 hover:bg-slate-50"
        }
        ${collapsed ? "justify-center" : ""}
      `}
        title={collapsed ? label : ""} // Munculkan tooltip saat di-minimize
      >
        <div className="flex-shrink-0">{icon}</div>
        {!collapsed && (
          <span className="text-sm font-medium whitespace-nowrap">{label}</span>
        )}
      </button>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-[#F0F4F8] overflow-x-hidden font-sans text-slate-700">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {/* SIDEBAR */}
      <aside
        className={`
    fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-gray-200 shadow-xl flex flex-col transition-all duration-300 ease-in-out
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
    ${isSidebarCollapsed ? "w-20" : "w-64"} 
  `}
      >
        {/* Header Sidebar dengan Tombol Minimize */}
        <div
          className={`flex items-center mb-10 text-[#1B3A5B] p-6 ${
            isSidebarCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!isSidebarCollapsed && (
            <h1 className="text-xl font-bold tracking-tight uppercase">KOL</h1>
          )}

          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors hidden lg:block"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 px-4">
          <SidebarItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={activeTab === "dashboard"}
            collapsed={isSidebarCollapsed}
            onClick={() => setActiveTab("dashboard")}
          />
          <SidebarItem
            icon={<Users size={20} />}
            label="Talent List"
            active={activeTab === "talent"}
            collapsed={isSidebarCollapsed}
            onClick={() => setActiveTab("talent")}
          />
          <SidebarItem
            icon={<Calculator size={20} />}
            label="Tax Calculator"
            active={activeTab === "tax"}
            collapsed={isSidebarCollapsed}
            onClick={() => setActiveTab("tax")}
          />
        </nav>

        {/* Tombol Logout */}
        <div className="p-4 mt-auto">
          <button
            onClick={() => (window.location.href = "/login")}
            className={`flex items-center gap-3 bg-[#1B3A5B] text-white shadow-lg hover:bg-red-500 transition-all rounded-[9px] h-12 font-bold text-sm ${
              isSidebarCollapsed ? "justify-center w-12" : "w-full px-4"
            }`}
          >
            <LogOut size={18} />
            {!isSidebarCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 h-full overflow-y-auto p-8 bg-[#F8FAFC]">
        {isLoading ? (
          <div className="flex flex-col h-full items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B3A5B]"></div>
            <p className="text-slate-500 font-medium animate-pulse">Loading</p>
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && (
              <DashboardView
                talents={talents}
                impressionData={impressionData}
              />
            )}
            {activeTab === "talent" && (
              <>
                <TalentView
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  filteredTalent={filteredAndSortedTalents}
                  onAddClick={() => setIsModalOpen(true)}
                  onDelete={handleDeleteTalent}
                  onUpdate={handleOpenEdit}
                  onRefresh={handleRefresh}
                  isLoading={isLoading}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  selectedReligion={selectedReligion}
                  setSelectedReligion={setSelectedReligion}
                  selectedStatus={selectedStatus}
                  setSelectedStatus={setSelectedStatus}
                  selectedTier={selectedTier}
                  setSelectedTier={setSelectedTier}
                  selectedAgeRange={selectedAgeRange}
                  setSelectedAgeRange={setSelectedAgeRange}
                />
                {isModalOpen && (
                  <AddTalentModal
                    onClose={() => {
                      setIsModalOpen(false);
                      setTalentToEdit(null);
                    }}
                    onSave={handleSaveTalent}
                    initialData={talentToEdit}
                  />
                )}
              </>
            )}
            {activeTab === "tax" && <TaxCalculatorView />}
          </>
        )}
      </main>
    </div>
  );
}
