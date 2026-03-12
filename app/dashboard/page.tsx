"use client";

import React, { useEffect, Suspense } from "react";
import DashboardView from "../../components/DashboardView";
import TaxCalculatorView from "../../components/TaxCalculatorView";
import SPKview from "@/components/spk/SPKView";
import TalentView from "@/components/talent/TalentView";
import TalentTable from "@/components/talent/TalentTable";
import TalentForm from "@/components/talent/TalentForm";
import InfluencerTable from "@/components/influencer/InfluencerTable";
import InfluencerForm from "@/components/influencer/InfluencerForm";
import AddTalentModal from "@/components/talent/AddTalentModal";
import Sidebar from "./Sidebar";
import { useTalentData } from "./useTalentData";

function DashboardContent() {
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
    <div className="flex h-screen w-screen bg-[#F0F4F8] dark:bg-[#0F172A] overflow-x-hidden font-sans text-slate-700 dark:text-slate-200 relative">
      {/* Tombol menu di header utama (mobile/tablet) */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-[#1E293B] rounded-lg shadow-lg transition-colors lg:hidden"
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
          setIsSidebarOpen(false); // Close sidebar on mobile after tab selection
        }}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
      />

      <main
        id="main-content"
        className={`flex-1 w-full bg-[#F8FAFC] dark:bg-[#0F172A] overflow-x-hidden ${activeTab === "tax" ? "h-screen overflow-hidden" : "h-screen overflow-y-auto"}`}
      >
        {isLoading ? (
          <div className="flex flex-col h-full items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B3A5B]"></div>
            <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading</p>
          </div>
        ) : (
          <>
            {/* Dashboard View */}
            {activeTab === "dashboard" && (
              <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                <DashboardView
                  talents={talents}
                  impressionData={impressionData}
                />
              </div>
            )}

            {/* Talent List View */}
            {activeTab === "talent-list" && (
              <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                <TalentTable
                  talents={talents}
                  isLoading={isLoading}
                  isModalOpen={isModalOpen}
                  setIsModalOpen={setIsModalOpen}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  talentToEdit={talentToEdit}
                  setTalentToEdit={setTalentToEdit}
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
                  selectedSource={selectedSource}
                  setSelectedSource={setSelectedSource}
                  filteredAndSortedTalents={filteredAndSortedTalents}
                  onDelete={handleDeleteTalent}
                  onUpdate={handleOpenEdit}
                  onRefresh={handleRefresh}
                  isSidebarOpen={isSidebarOpen}
                  isSidebarCollapsed={isSidebarCollapsed}
                />
                {isModalOpen && (
                  <TalentForm
                    onClose={() => {
                      setIsModalOpen(false);
                      setTalentToEdit(null);
                    }}
                    onSave={handleSaveTalent}
                    initialData={talentToEdit}
                  />
                )}
              </div>
            )}

            {/* Influencer List View */}
            {activeTab === "influencer" && (
              <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                <InfluencerTable
                  talents={talents}
                  isLoading={isLoading}
                  isModalOpen={isModalOpen}
                  setIsModalOpen={setIsModalOpen}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  talentToEdit={talentToEdit}
                  setTalentToEdit={setTalentToEdit}
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
                  selectedSource={selectedSource}
                  setSelectedSource={setSelectedSource}
                  filteredAndSortedTalents={filteredAndSortedTalents}
                  onDelete={handleDeleteTalent}
                  onUpdate={handleOpenEdit}
                  onRefresh={handleRefresh}
                  isSidebarOpen={isSidebarOpen}
                  isSidebarCollapsed={isSidebarCollapsed}
                />
                {isModalOpen && (
                  <InfluencerForm
                    onClose={() => {
                      setIsModalOpen(false);
                      setTalentToEdit(null);
                    }}
                    onSave={handleSaveTalent}
                    initialData={talentToEdit}
                  />
                )}
              </div>
            )}

            {/* SPK View */}
            {activeTab === "SPK" && (
              <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                <SPKview spkList={spkList} fetchSPK={fetchSPK} />
              </div>
            )}

            {/* Tax Calculator View */}
            {activeTab === "tax" && <TaxCalculatorView />}
          </>
        )}
      </main>
    </div>
  );
}
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
