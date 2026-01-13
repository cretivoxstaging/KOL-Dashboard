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
  monthlyImpressions?: number[];
  tier: string;
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "talent" | "tax">(
    "dashboard"
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
  const [selectedZodiac, setSelectedZodiac] = useState("All");
  const [selectedTier, setSelectedTier] = useState("All");
  const [selectedAgeRange, setSelectedAgeRange] = useState("All");
  const API_URL = "/API/Talent";

  // 1. Tambahkan state untuk Sorting di bagian atas komponen
  const [sortBy, setSortBy] = useState("name-asc"); // Default A-Z

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
      const matchZodiac =
        selectedZodiac === "All" || t.zodiac === selectedZodiac;


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
        matchSearch && matchReligion && matchZodiac && matchTier && matchAge
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rate-high":
          return b.rateCard - a.rateCard; // Sudah angka dari mappedData
        case "rate-low":
          return a.rateCard - b.rateCard;
        case "followers-high":
          return b.totalFollowers - a.totalFollowers; // Gunakan totalFollowers dari mappedData
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "age-old":
          return parseInt(b.umur) - parseInt(a.umur); // Umur di mappedData masih string
        case "age-young":
          return parseInt(a.umur) - parseInt(b.umur);
        default:
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

  // 1. FUNGSI LOAD DATA (Sudah diperbaiki strukturnya)
  const loadTalents = async () => {
    try {
      setIsLoading(true);
      const result = await getTalents();
      if (result && result.data) {
        const mappedData = result.data.map((t: any) => {
          const ig = parseInt(t.instagram_followers) || 0;
          const tt = parseInt(t.tiktok_followers) || 0;
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
            rateCard: t.rate_card
              ? parseInt(String(t.rate_card).replace(/[^0-9]/g, "")) || 0
              : 0,
            status: t.status === "active" ? "Active" : "Inactive",
            monthlyImpressions: t.monthly_impressions || [
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            ],
            tier: t.tier || "Nano",
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

  useEffect(() => {
    loadTalents();
  }, []);

  // 2. FUNGSI SAVE (ADD & EDIT)
  const handleSaveTalent = async (formData: any) => {
    try {
      setIsLoading(true);
      const payload = {
        name: formData.name,
        domicile: formData.domisili,
        instagram_username: formData.igAccount,
        instagram_followers: String(formData.igFollowers),
        tiktok_username: formData.tiktokAccount,
        tiktok_followers: String(formData.tiktokFollowers),
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
        rate_card: String(formData.rateCard),
        status: "active",
        tier: formData.tier,
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
      alert("Terjadi kesalahan: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. FUNGSI DELETE
  const handleDeleteTalent = async (id: number) => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin menghapus talent ini secara permanen?"
      )
    ) {
      try {
        setIsLoading(true);
        await deleteTalent(id);
        alert("Talent berhasil dihapus!");
        await loadTalents();
      } catch (error: any) {
        alert("Gagal menghapus: " + error.message);
      } finally {
        setIsLoading(false);
      }
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
            0
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
            <p className="text-slate-500 font-medium animate-pulse">
              Fetching data...
            </p>
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
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  selectedReligion={selectedReligion}
                  setSelectedReligion={setSelectedReligion}
                  selectedZodiac={selectedZodiac}
                  setSelectedZodiac={setSelectedZodiac}
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
