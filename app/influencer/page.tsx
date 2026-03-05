/**
 * ============================================
 * INFLUENCER PAGE
 * ============================================
 * 
 * Page khusus untuk Influencer/KOL Management
 * Filter: Hanya menampilkan source !== "talent"
 * 
 * Supported sources:
 * - Artist/Celebrity
 * - Influencer/KOL
 * - Media
 * - Clippers
 */

"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import InfluencerTable from "@/components/influencer/InfluencerTable";
import InfluencerForm from "@/components/influencer/InfluencerForm";
import Sidebar from "@/app/dashboard/Sidebar";
import { useTalentData } from "@/app/dashboard/useTalentData";

function InfluencerContent() {
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
  } = useTalentData();

  useEffect(() => {
    const mainElement = document.getElementById("main-content");
    if (mainElement) {
      mainElement.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, []);

  return (
    <div className="flex h-screen w-screen bg-[#F0F4F8] overflow-x-hidden font-sans text-slate-700 relative">
      {/* Tombol menu di header utama (mobile/tablet) */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg transition-colors lg:hidden"
        aria-label="Open menu"
        style={{ display: isSidebarOpen ? "none" : "block" }}
      >
        <span className="sr-only">Open menu</span>
      </button>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        activeTab="influencer"
        setActiveTab={() => {
          /* No tab switching on influencer */
        }}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
      />

      <main
        id="main-content"
        className="flex-1 w-full bg-[#F8FAFC] overflow-y-auto h-screen"
      >
        {isLoading ? (
          <div className="flex flex-col h-full items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B3A5B]"></div>
            <p className="text-slate-500 font-medium animate-pulse">Loading</p>
          </div>
        ) : (
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
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InfluencerContent />
    </Suspense>
  );
}
