"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardView from "../../components/DashboardView";
import TalentView from "../../components/TalentView";
import AddTalentModal from "../../components/AddTalentModal";
import TaxCalculatorView from "../../components/TaxCalculatorView";
import SPKview from "@/components/SPKview";
import Sidebar from "./Sidebar";
import { useTalentData } from "./useTalentData";

export default function Page() {
  const router = useRouter();

  const {
    activeTab,
    setActiveTab,
    talents,
    isModalOpen,
    setIsModalOpen,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    talentToEdit,
    setTalentToEdit,
    isLoading,
    isSidebarOpen,
    setIsSidebarOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
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
    sortBy,
    setSortBy,
    filteredAndSortedTalents,
    handleRefresh,
    handleSaveTalent,
    handleDeleteTalent,
    handleOpenEdit,
    spkList,
    fetchSPK,
  } = useTalentData();

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

  useEffect(() => {
    const mainElement = document.getElementById("main-content");
    if (mainElement) {
      mainElement.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [activeTab]);

  return (
    <div className="flex h-screen w-screen bg-[#F0F4F8] overflow-x-hidden font-sans text-slate-700 relative">
      {/* Tombol menu di header utama (mobile/tablet) */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg transition-colors lg:hidden"
        aria-label="Open menu"
        style={{ display: isSidebarOpen ? "none" : "block" }}
      >
        {/* Icon menu moved to Sidebar */}
        <span className="sr-only">Open menu</span>
      </button>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab: string) => {
          setActiveTab(tab as any);
          router.push(`?tab=${tab}`, { scroll: false });
        }}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
      />

      <main
        id="main-content"
        className={`flex-1 w-full bg-[#F8FAFC] overflow-x-hidden ${activeTab === "tax" ? "h-screen overflow-hidden" : "h-screen overflow-y-auto"}`}
      >
        {isLoading ? (
          <div className="flex flex-col h-full items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B3A5B]"></div>
            <p className="text-slate-500 font-medium animate-pulse">Loading</p>
          </div>
        ) : (
          <>
            {activeTab === "dashboard" || activeTab === "talent" ? (
              <div className="p-3 sm:p-4 md:p-6 lg:p-8">
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
                      selectedSource={selectedSource}
                      setSelectedSource={setSelectedSource}
                      selectedReligion={selectedReligion}
                      setSelectedReligion={setSelectedReligion}
                      selectedStatus={selectedStatus}
                      setSelectedStatus={setSelectedStatus}
                      selectedTier={selectedTier}
                      setSelectedTier={setSelectedTier}
                      selectedAgeRange={selectedAgeRange}
                      setSelectedAgeRange={setSelectedAgeRange}
                      isSidebarOpen={isSidebarOpen}
                      isSidebarCollapsed={isSidebarCollapsed}
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
              </div>
            ) : null}
            {activeTab === "tax" && <TaxCalculatorView />}
            <div>
              {activeTab === "SPK" && (
                <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                <SPKview spkList={spkList} fetchSPK={fetchSPK} />
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
